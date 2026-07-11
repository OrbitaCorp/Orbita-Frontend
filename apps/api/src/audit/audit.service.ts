import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  // Stub: la lógica de negocio se implementa en un paso posterior.
  private notImplemented(): never {
    void this.prisma;
    throw new NotImplementedException();
  }
}
