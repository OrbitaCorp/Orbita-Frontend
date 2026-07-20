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

    // El `where` lleva businessId también acá: el aislamiento de tenant no puede
    // depender de que el findOne() de arriba haya corrido antes — la query en sí
    // tiene que garantizarlo, no el orden del código alrededor.
    const { count } = await this.prisma.branch.updateMany({
      where: { id, businessId },
      data: dto,
    });
    if (count === 0) throw new NotFoundException('Sucursal no encontrada');

    return this.findOne(businessId, id);
  }

  async remove(businessId: string, id: string) {
    const branch = await this.findOne(businessId, id);
    if (branch.isDefault) {
      throw new UnprocessableEntityException('No se puede eliminar la sucursal principal');
    }

    let result: Prisma.BatchPayload;
    try {
      result = await this.prisma.branch.deleteMany({ where: { id, businessId } });
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
    if (result.count === 0) throw new NotFoundException('Sucursal no encontrada');

    return { ok: true };
  }
}
