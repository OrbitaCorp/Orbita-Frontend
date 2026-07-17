import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Sin esto, el navegador bloquea todas las llamadas del frontend (otro
  // origen) al backend por CORS. FRONTEND_URL ya se usaba para armar links
  // de email (ver members.service.ts / auth.service.ts) — se reusa acá.
  // localhost:3001 queda siempre permitido para no romper el dev local.
  app.enableCors({
    origin: [process.env.FRONTEND_URL ?? 'http://localhost:3001', 'http://localhost:3001'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
