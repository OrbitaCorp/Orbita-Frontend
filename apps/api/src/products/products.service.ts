import { randomUUID } from 'crypto';
import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { AddImageDto } from './dto/add-image.dto';

const PRODUCT_IMAGES_BUCKET = 'product-images';

const productDetailInclude = {
  productTags: { include: { tag: true } },
  options: { include: { values: { orderBy: { position: 'asc' as const } } }, orderBy: { position: 'asc' as const } },
  variants: {
    include: {
      optionValues: { include: { optionValue: true } },
      stock: true,
    },
  },
  images: { orderBy: { position: 'asc' as const } },
} satisfies Prisma.ProductInclude;

type ProductWithDetail = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  // ── Listado ──────────────────────────────────────────────────────────────

  async findAll(businessId: string, query: FindProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ProductWhereInput = {
      businessId,
      deletedAt: null,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
    };

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          variants: { select: { id: true, stock: { select: { quantity: true } } } },
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        categoryId: p.categoryId,
        categoryName: p.category?.name ?? null,
        basePrice: Number(p.basePrice),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        cost: p.cost ? Number(p.cost) : null,
        status: p.status,
        totalStock: p.variants.reduce((sum, v) => sum + v.stock.reduce((s, st) => s + st.quantity, 0), 0),
        variantCount: p.variants.length,
        primaryImageUrl: p.images[0]?.url ?? null,
        createdAt: p.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  // ── Detalle ──────────────────────────────────────────────────────────────

  async findOne(businessId: string, id: string) {
    const product = await this.findOneRaw(businessId, id);
    return this.toDetailResponse(product);
  }

  // ── Crear (transacción completa) ────────────────────────────────────────

  async create(businessId: string, dto: CreateProductDto) {
    if (dto.categoryId) await this.validateCategory(businessId, dto.categoryId);
    if (dto.tagIds?.length) await this.validateTags(businessId, dto.tagIds);
    this.validateVariantShape(dto);

    const defaultBranch = await this.getDefaultBranch(businessId);

    const productId = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          businessId,
          categoryId: dto.categoryId ?? null,
          name: dto.name,
          description: dto.description ?? null,
          basePrice: dto.basePrice,
          comparePrice: dto.comparePrice ?? null,
          cost: dto.cost ?? null,
          status: dto.status ?? 'DRAFT',
        },
      });

      // Opciones + valores, en el mismo orden que llegaron (la correspondencia
      // posicional con variant.optionValues depende de este orden).
      const createdOptions: { id: string; values: { id: string; value: string }[] }[] = [];
      for (const [i, opt] of (dto.options ?? []).entries()) {
        const option = await tx.productOption.create({
          data: { productId: product.id, name: opt.name, position: i },
        });
        const values: { id: string; value: string }[] = [];
        for (const [j, value] of opt.values.entries()) {
          const created = await tx.productOptionValue.create({
            data: { optionId: option.id, value, position: j },
          });
          values.push({ id: created.id, value: created.value });
        }
        createdOptions.push({ id: option.id, values });
      }

      // Sin variantes explícitas (producto sin variación): se crea una única
      // variante isDefault que hereda basePrice/comparePrice del producto,
      // con stock inicial en 0 (se carga después desde Inventario).
      const variantInputs =
        dto.variants.length > 0
          ? dto.variants
          : [{ price: dto.basePrice, comparePrice: dto.comparePrice, optionValues: [], initialStock: 0, stockMin: 0 }];
      const isSingleDefault = dto.variants.length === 0;

      for (const v of variantInputs) {
        const optionValueIds = this.resolveOptionValueIds(v.optionValues, createdOptions);
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku ?? null,
            barcode: v.barcode ?? null,
            price: v.price,
            comparePrice: v.comparePrice ?? null,
            isDefault: isSingleDefault,
          },
        });
        if (optionValueIds.length > 0) {
          await tx.variantOptionValue.createMany({
            data: optionValueIds.map((optionValueId) => ({ variantId: variant.id, optionValueId })),
          });
        }
        await tx.variantStock.create({
          data: {
            variantId: variant.id,
            branchId: defaultBranch.id,
            quantity: v.initialStock ?? 0,
            stockMin: v.stockMin ?? 0,
          },
        });
      }

      if (dto.tagIds?.length) {
        await tx.productTag.createMany({
          data: dto.tagIds.map((tagId) => ({ productId: product.id, tagId })),
        });
      }

      return product.id;
    });

    return this.findOne(businessId, productId);
  }

  // ── Actualizar ───────────────────────────────────────────────────────────
  // Reconcilia variantes por `id`: las que lo traen y matchean se actualizan
  // (solo campos escalares); las que no traen `id` se crean, resolviendo
  // optionValues contra las opciones YA existentes del producto (las opciones
  // en sí no se reconcilian acá). Nunca se borran variantes ausentes del body:
  // ProductVariant tiene orderItems/stockMovements sin onDelete:Cascade — un
  // delete-and-recreate rompería historial de ventas/stock. Ver PENDIENTES.md.

  async update(businessId: string, id: string, dto: CreateProductDto) {
    const existing = await this.findOneRaw(businessId, id);
    if (dto.categoryId) await this.validateCategory(businessId, dto.categoryId);
    if (dto.tagIds?.length) await this.validateTags(businessId, dto.tagIds);
    this.validateVariantReconciliation(dto, existing);

    const defaultBranch = await this.getDefaultBranch(businessId);
    const existingVariantIds = new Set(existing.variants.map((v) => v.id));

    await this.prisma.$transaction(async (tx) => {
      // businessId va en el where del updateMany, dentro de la misma tx — no
      // depende del findOneRaw de arriba para el aislamiento.
      const { count } = await tx.product.updateMany({
        where: { id, businessId },
        data: {
          categoryId: dto.categoryId ?? null,
          name: dto.name,
          description: dto.description ?? null,
          basePrice: dto.basePrice,
          comparePrice: dto.comparePrice ?? null,
          cost: dto.cost ?? null,
          status: dto.status ?? undefined,
        },
      });
      if (count === 0) throw new NotFoundException('Producto no encontrado');

      await tx.productTag.deleteMany({ where: { productId: id } });
      if (dto.tagIds?.length) {
        await tx.productTag.createMany({ data: dto.tagIds.map((tagId) => ({ productId: id, tagId })) });
      }

      for (const v of dto.variants) {
        if (v.id && existingVariantIds.has(v.id)) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku ?? null,
              barcode: v.barcode ?? null,
              price: v.price,
              comparePrice: v.comparePrice ?? null,
            },
          });
          continue;
        }

        const optionValueIds = this.resolveOptionValueIdsFromExisting(v.optionValues, existing.options);
        const variant = await tx.productVariant.create({
          data: {
            productId: id,
            sku: v.sku ?? null,
            barcode: v.barcode ?? null,
            price: v.price,
            comparePrice: v.comparePrice ?? null,
            isDefault: false,
          },
        });
        if (optionValueIds.length > 0) {
          await tx.variantOptionValue.createMany({
            data: optionValueIds.map((optionValueId) => ({ variantId: variant.id, optionValueId })),
          });
        }
        await tx.variantStock.create({
          data: {
            variantId: variant.id,
            branchId: defaultBranch.id,
            quantity: v.initialStock ?? 0,
            stockMin: v.stockMin ?? 0,
          },
        });
      }
    });

    return this.findOne(businessId, id);
  }

  async remove(businessId: string, id: string) {
    await this.findOneRaw(businessId, id);
    const { count } = await this.prisma.product.updateMany({
      where: { id, businessId },
      data: { deletedAt: new Date() },
    });
    if (count === 0) throw new NotFoundException('Producto no encontrado');
    return { ok: true };
  }

  // ── Códigos de barras ────────────────────────────────────────────────────

  async barcodes(businessId: string, variantIds?: string[], categoryId?: string) {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        product: { businessId, deletedAt: null, ...(categoryId ? { categoryId } : {}) },
        ...(variantIds?.length ? { id: { in: variantIds } } : {}),
      },
      include: {
        product: { select: { name: true } },
        optionValues: { include: { optionValue: true } },
      },
    });

    return variants.map((v) => ({
      variantId: v.id,
      sku: v.sku,
      barcode: v.barcode,
      productName: v.product.name,
      variantLabel: v.optionValues.length > 0 ? v.optionValues.map((ov) => ov.optionValue.value).join(' / ') : null,
      price: Number(v.price),
    }));
  }

  // ── Imágenes ─────────────────────────────────────────────────────────────

  async addImage(
    businessId: string,
    productId: string,
    dto: AddImageDto,
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ) {
    await this.findOneRaw(businessId, productId);
    if (dto.optionValueId) await this.validateOptionValue(productId, dto.optionValueId);

    const ext = file.originalname.split('.').pop() || 'jpg';
    const path = `${businessId}/${productId}/${randomUUID()}.${ext}`;

    const { error: uploadError } = await this.supabase.adminClient.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
    if (uploadError) {
      throw new BadRequestException(`No se pudo subir la imagen: ${uploadError.message}`);
    }

    const { data: publicUrl } = this.supabase.adminClient.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(path);

    const maxPosition = await this.prisma.productImage.aggregate({
      where: { productId },
      _max: { position: true },
    });

    const isPrimary = dto.isPrimary ?? false;
    if (isPrimary) {
      await this.prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    }

    const image = await this.prisma.productImage.create({
      data: {
        productId,
        optionValueId: dto.optionValueId ?? null,
        url: publicUrl.publicUrl,
        position: (maxPosition._max.position ?? -1) + 1,
        isPrimary,
      },
    });

    return {
      id: image.id,
      url: image.url,
      position: image.position,
      isPrimary: image.isPrimary,
      optionValueId: image.optionValueId,
    };
  }

  async removeImage(businessId: string, productId: string, imageId: string) {
    await this.findOneRaw(businessId, productId);
    const image = await this.prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Imagen no encontrada');

    // Best-effort: si falla el borrado en Storage no bloqueamos el borrado
    // del registro (evita imágenes "zombie" en la UI por un error de red).
    const path = this.extractStoragePath(image.url);
    if (path) {
      await this.supabase.adminClient.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]).catch(() => {});
    }

    // ProductImage no tiene businessId propio (solo productId) — el where lleva
    // productId además de id, así el aislamiento no depende únicamente del
    // findFirst de arriba. productId a su vez ya fue validado contra businessId
    // por el findOneRaw() al inicio de este método.
    const { count } = await this.prisma.productImage.deleteMany({ where: { id: imageId, productId } });
    if (count === 0) throw new NotFoundException('Imagen no encontrada');
    return { ok: true };
  }

  async reorderImages(businessId: string, productId: string, dto: ReorderImagesDto) {
    await this.findOneRaw(businessId, productId);

    await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        await tx.productImage.updateMany({
          where: { id: item.id, productId },
          data: { position: item.position },
        });
      }
      if (dto.primaryId) {
        await tx.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
        await tx.productImage.updateMany({
          where: { id: dto.primaryId, productId },
          data: { isPrimary: true },
        });
      }
    });

    return { ok: true };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async findOneRaw(businessId: string, id: string): Promise<ProductWithDetail> {
    const product = await this.prisma.product.findFirst({
      where: { id, businessId, deletedAt: null },
      include: productDetailInclude,
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  private toDetailResponse(p: ProductWithDetail) {
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      basePrice: Number(p.basePrice),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      cost: p.cost ? Number(p.cost) : null,
      status: p.status,
      tags: p.productTags.map((pt) => ({ id: pt.tag.id, name: pt.tag.name })),
      options: p.options.map((o) => ({
        id: o.id,
        name: o.name,
        position: o.position,
        values: o.values.map((v) => ({ id: v.id, value: v.value, position: v.position })),
      })),
      variants: p.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        barcode: v.barcode,
        price: Number(v.price),
        comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
        isDefault: v.isDefault,
        optionValues: v.optionValues.map((ov) => ({
          optionValueId: ov.optionValueId,
          value: ov.optionValue.value,
        })),
        stock: v.stock.map((s) => ({ branchId: s.branchId, quantity: s.quantity, stockMin: s.stockMin })),
      })),
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        position: img.position,
        isPrimary: img.isPrimary,
        optionValueId: img.optionValueId,
      })),
    };
  }

  private async validateCategory(businessId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({ where: { id: categoryId, businessId } });
    if (!category) throw new UnprocessableEntityException('Categoría inexistente');
  }

  private async validateTags(businessId: string, tagIds: string[]) {
    const found = await this.prisma.tag.findMany({ where: { id: { in: tagIds }, businessId } });
    if (found.length !== new Set(tagIds).size) {
      throw new BadRequestException('Uno o más tags no pertenecen a este negocio');
    }
  }

  private async validateOptionValue(productId: string, optionValueId: string) {
    const value = await this.prisma.productOptionValue.findFirst({
      where: { id: optionValueId, option: { productId } },
    });
    if (!value) throw new BadRequestException('optionValueId inválido para este producto');
  }

  private validateVariantShape(dto: CreateProductDto) {
    const optionCount = dto.options?.length ?? 0;
    if (optionCount === 0) return;
    for (const v of dto.variants) {
      if (v.optionValues.length !== optionCount) {
        throw new BadRequestException(
          `Cada variante debe definir exactamente ${optionCount} valor(es) de opción (uno por cada opción, en el mismo orden)`,
        );
      }
    }
  }

  // variant.optionValues es un array de strings ["M","Negro"] en el mismo
  // orden posicional que dto.options — no vienen tipados por optionId.
  private resolveOptionValueIds(
    optionValues: string[],
    createdOptions: { id: string; values: { id: string; value: string }[] }[],
  ): string[] {
    return optionValues.map((val, i) => {
      const option = createdOptions[i];
      const match = option?.values.find((v) => v.value === val);
      if (!match) {
        throw new BadRequestException(`Valor de opción "${val}" no encontrado en la opción correspondiente`);
      }
      return match.id;
    });
  }

  // Misma resolución posicional que en create(), pero contra las opciones ya
  // persistidas del producto (update() no reconcilia el árbol de opciones).
  private resolveOptionValueIdsFromExisting(
    optionValues: string[],
    existingOptions: ProductWithDetail['options'],
  ): string[] {
    return optionValues.map((val, i) => {
      const option = existingOptions[i];
      const match = option?.values.find((v) => v.value === val);
      if (!match) {
        throw new BadRequestException(`Valor de opción "${val}" no encontrado en la opción correspondiente`);
      }
      return match.id;
    });
  }

  private validateVariantReconciliation(dto: CreateProductDto, existing: ProductWithDetail) {
    const existingVariantIds = new Set(existing.variants.map((v) => v.id));
    const optionCount = existing.options.length;
    for (const v of dto.variants) {
      if (v.id) {
        if (!existingVariantIds.has(v.id)) {
          throw new BadRequestException(`La variante ${v.id} no pertenece a este producto`);
        }
        continue; // variante existente: sus optionValues no se reconcilian, se ignoran
      }
      if (v.optionValues.length !== optionCount) {
        throw new BadRequestException(
          `Cada variante nueva debe definir exactamente ${optionCount} valor(es) de opción ` +
            `(las opciones del producto no se reconcilian en PUT — solo variantes)`,
        );
      }
    }
  }

  private async getDefaultBranch(businessId: string) {
    const branch = await this.prisma.branch.findFirst({ where: { businessId, isDefault: true } });
    if (!branch) throw new UnprocessableEntityException('El negocio no tiene una sucursal principal configurada');
    return branch;
  }

  private extractStoragePath(url: string): string | null {
    const marker = `/${PRODUCT_IMAGES_BUCKET}/`;
    const idx = url.indexOf(marker);
    return idx === -1 ? null : url.slice(idx + marker.length);
  }
}
