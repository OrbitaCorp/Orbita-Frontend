import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(businessId: string) {
    return this.prisma.branch.findMany({ where: { businessId } });
  }

  async findOne(businessId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({ where: { id, businessId } });
    if (!branch) throw new NotFoundException('Sucursal no encontrada');
    return branch;
  }

  create(businessId: string, dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        businessId,
        name: dto.name,
        address: dto.address,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(businessId: string, id: string, dto: UpdateBranchDto) {
    await this.findOne(businessId, id); // 404 si no existe o es de otro negocio

    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  async remove(businessId: string, id: string) {
    const branch = await this.findOne(businessId, id);
    if (branch.isDefault) {
      throw new UnprocessableEntityException('No se puede eliminar la sucursal principal');
    }

    try {
      await this.prisma.branch.delete({ where: { id } });
    } catch (err) {
      // P2003/P2014: la sucursal tiene registros asociados (stock, órdenes, caja, etc.)
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        (err.code === 'P2003' || err.code === 'P2014')
      ) {
        throw new UnprocessableEntityException(
          'No se puede eliminar: la sucursal tiene registros asociados (stock, órdenes o caja)',
        );
      }
      throw err;
    }

    return { ok: true };
  }
}
