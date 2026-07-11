import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Módulo global de infraestructura: expone PrismaService a toda la app.
// No es un módulo de negocio — todos los módulos de dominio futuros
// dependerán de este para acceder a la base de datos.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
