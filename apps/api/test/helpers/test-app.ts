import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

let cachedApp: INestApplication | null = null;

export async function createTestApp(): Promise<INestApplication> {
  if (cachedApp) return cachedApp;

  // El ThrottlerGuard está activo en producción y funciona correctamente
  // (verificado con test empírico: 6to request devuelve 429). Se desactiva
  // en tests vía skipIf para que las suites e2e prueben lógica de negocio
  // sin que el rate-limit interfiera. El @Throttle() por handler overridea
  // el límite del módulo, así que skipIf es la única forma de saltear el
  // guard sin tocar código de producción.
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider('THROTTLER:MODULE_OPTIONS')
    .useValue({
      throttlers: [{ name: 'default', ttl: 60000, limit: 10000 }],
      skipIf: () => true,
    })
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();

  cachedApp = app;
  return app;
}

export async function closeTestApp(): Promise<void> {
  if (cachedApp) {
    await cachedApp.close();
    cachedApp = null;
  }
}
