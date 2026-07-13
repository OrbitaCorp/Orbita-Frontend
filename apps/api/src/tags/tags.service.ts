import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertTagDto } from './dto/upsert-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(businessId: string) {
    return this.prisma.tag.findMany({ where: { businessId }, orderBy: { name: 'asc' } });
  }

  async create(businessId: string, dto: UpsertTagDto) {
    try {
      return await this.prisma.tag.create({ data: { businessId, name: dto.name } });
    } catch (err) {
      throw this.mapNameConflict(err);
    }
  }

  async update(businessId: string, id: string, dto: UpsertTagDto) {
    await this.findOneRaw(businessId, id);
    try {
      return await this.prisma.tag.update({ where: { id }, data: { name: dto.name } });
    } catch (err) {
      throw this.mapNameConflict(err);
    }
  }

  async remove(businessId: string, id: string) {
    await this.findOneRaw(businessId, id);
    // product_tags tiene onDelete: Cascade — no queda huérfano.
    await this.prisma.tag.delete({ where: { id } });
    return { ok: true };
  }

  private async findOneRaw(businessId: string, id: string) {
    const tag = await this.prisma.tag.findFirst({ where: { id, businessId } });
    if (!tag) throw new NotFoundException('Tag no encontrado');
    return tag;
  }

  private mapNameConflict(err: unknown): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new BadRequestException('Ya existe un tag con ese nombre en este negocio');
    }
    throw err as Error;
  }
}
