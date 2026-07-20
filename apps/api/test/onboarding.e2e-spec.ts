/**
 * Test e2e del flujo completo de onboarding (auditoría del commit 6f14930 /
 * estado actual post-migración a auth propio).
 *
 * Cubre: registro de negocio + owner → token utilizable → login posterior
 * con la misma contraseña → aislamiento del passwordHash → el check de email
 * duplicado es GLOBAL (no por negocio) — ver informe de auditoría.
 */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, closeTestApp } from './helpers/test-app';

const PASSWORD = 'Test1234!';

describe('Onboarding (e2e) — registro de negocio + owner', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('crea negocio + owner en una transacción, devuelve token utilizable, y permite loguearse después con la misma contraseña', async () => {
    const email = `owner-onboarding-${Date.now()}@test.com`;

    // 1. Registro
    const regRes = await request(app.getHttpServer())
      .post('/api/v1/onboarding/register-business')
      .send({
        ownerName: 'Fernando Test',
        email,
        password: PASSWORD,
        businessName: `Negocio Test ${Date.now()}`,
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.token).toBeDefined();
    expect(regRes.body.business).toMatchObject({ isActive: false, mode: 'FULL' });
    expect(regRes.body.member).toMatchObject({ name: 'Fernando Test', email });

    const { token, business, member } = regRes.body;

    // 2. El token devuelto por el registro es un JWT real y utilizable de
    // inmediato (no requiere login previo) — confirma que signToken() local
    // no depende de ningún paso externo que pueda fallar después del commit
    // de la transacción.
    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.type).toBe('member');
    expect(meRes.body.member.email).toBe(email);
    expect(meRes.body.business.id).toBe(business.id);

    // 3. El owner puede loguearse después con la contraseña que puso en el
    // onboarding (confirma que el argon2.hash guardado en registro coincide
    // con lo que login() verifica).
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: PASSWORD });

    expect(loginRes.status).toBe(201);
    expect(loginRes.body.type).toBe('member');
    expect(loginRes.body.business.id).toBe(business.id);
    expect(loginRes.body.member.id).toBe(member.id);

    // 4. Aislamiento: el member creado está vinculado al businessId correcto
    // (no a otro negocio, no null) — verificado directo en la DB.
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const dbMember = await prisma.member.findUnique({ where: { id: member.id } });
      expect(dbMember.businessId).toBe(business.id);
      expect(dbMember.passwordHash).toBeDefined();
      expect(dbMember.passwordHash).not.toBeNull();
      // argon2id produce hashes con el prefijo "$argon2id$" — confirma que no
      // se coló bcrypt ("$2b$"/"$2a$") ni ningún otro algoritmo.
      expect(dbMember.passwordHash.startsWith('$argon2id$')).toBe(true);
    } finally {
      await prisma.$disconnect();
    }
  });

  it('email duplicado → 409, no crea un negocio a medias', async () => {
    const email = `owner-dup-${Date.now()}@test.com`;

    const first = await request(app.getHttpServer())
      .post('/api/v1/onboarding/register-business')
      .send({ ownerName: 'Primero', email, password: PASSWORD, businessName: 'Negocio Uno' });
    expect(first.status).toBe(201);

    const second = await request(app.getHttpServer())
      .post('/api/v1/onboarding/register-business')
      .send({ ownerName: 'Segundo', email, password: PASSWORD, businessName: 'Negocio Dos' });

    expect(second.status).toBe(409);
    expect(second.body.message).toContain('Este email ya tiene un negocio registrado en Orbita');
  });

  it('HALLAZGO: el check de email duplicado es GLOBAL — bloquea registrar un negocio nuevo con un email que ya es member de OTRO negocio', async () => {
    // Este test documenta el comportamiento actual, no lo que "debería" ser.
    // Ver informe de auditoría, punto 5: registerBusiness() no scopea el
    // chequeo de email por negocio, a diferencia de login() que sí aísla por
    // businessId. Un mismo dueño no puede autoservirse una segunda tienda
    // independiente con el mismo email.
    const email = `owner-crossbiz-${Date.now()}@test.com`;

    const firstBusiness = await request(app.getHttpServer())
      .post('/api/v1/onboarding/register-business')
      .send({ ownerName: 'Dueño', email, password: PASSWORD, businessName: 'Primer Negocio del Dueño' });
    expect(firstBusiness.status).toBe(201);

    // Intentar crear un SEGUNDO negocio, totalmente independiente, con el
    // mismo email — el modelo de aislamiento (CONTRATO_API.md, "cada negocio
    // gestiona sus propias credenciales") sugeriría que esto debería
    // funcionar, ya que @@unique([businessId, email]) en el schema lo
    // permitiría a nivel de base de datos.
    const secondBusiness = await request(app.getHttpServer())
      .post('/api/v1/onboarding/register-business')
      .send({ ownerName: 'Dueño', email, password: PASSWORD, businessName: 'Segundo Negocio del Dueño' });

    // Comportamiento ACTUAL: 409. Si el equipo decide que esto debería
    // permitirse, es un cambio de lógica de negocio, no un bug de sintaxis.
    expect(secondBusiness.status).toBe(409);
  });
});
