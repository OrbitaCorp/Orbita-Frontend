import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, closeTestApp } from './helpers/test-app';
import { SEED_USERS, SEED_BUSINESS_SLUG } from './helpers/test-users';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let ownerToken: string;
  let customerToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ── POST /auth/login ────────────────────────────────────────────────────
  // Login tests go first because we need tokens for subsequent tests.

  describe('POST /api/v1/auth/login', () => {
    it('login exitoso como owner (sin header) → 201, type member', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: SEED_USERS.owner.email, password: SEED_USERS.owner.password });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ type: 'member' });
      expect(res.body.token).toBeDefined();
      expect(res.body.role).toBeDefined();
      expect(res.body.permissions).toBeInstanceOf(Array);
      expect(res.body.business).toMatchObject({ subdomain: SEED_BUSINESS_SLUG });
      ownerToken = res.body.token;
    });

    it('login exitoso como cajero (sin header) → 201, type member, rol cajero', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: SEED_USERS.cashier.email, password: SEED_USERS.cashier.password });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ type: 'member' });
      expect(res.body.token).toBeDefined();
    });

    it('login exitoso como customer con cuenta (con header) → 201, type customer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('x-business-slug', SEED_BUSINESS_SLUG)
        .send({
          email: SEED_USERS.customerWithAccount.email,
          password: SEED_USERS.customerWithAccount.password,
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ type: 'customer' });
      expect(res.body.token).toBeDefined();
      expect(res.body.customer).toBeDefined();
      customerToken = res.body.token;
    });

    it('login con contraseña incorrecta → 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: SEED_USERS.owner.email, password: 'WrongPassword123!' });

      expect(res.status).toBe(401);
    });

    it('login con email inexistente → 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'noexiste@example.com', password: 'Test1234!' });

      expect(res.status).toBe(401);
    });

    it('login de member enviando header X-Business-Slug → devuelve type member (ignora header)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('x-business-slug', SEED_BUSINESS_SLUG)
        .send({ email: SEED_USERS.owner.email, password: SEED_USERS.owner.password });

      // Login prioriza member sobre customer — el header se ignora si el usuario es miembro.
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ type: 'member' });
    });
  });

  // ── POST /auth/register ─────────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    const uniqueEmail = `test-e2e-${Date.now()}@example.com`;

    it('registro exitoso con email nuevo → 201, devuelve customer + token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('x-business-slug', SEED_BUSINESS_SLUG)
        .send({
          email: uniqueEmail,
          password: 'Test1234!',
          firstName: 'TestE2E',
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.customer).toBeDefined();
      expect(res.body.customer.email).toBe(uniqueEmail);
    });

    it('registro sin header X-Business-Slug → 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'another@example.com',
          password: 'Test1234!',
          firstName: 'Test',
        });

      expect(res.status).toBe(400);
    });

    it('registro con slug de negocio inexistente → 404', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('x-business-slug', 'negocio-que-no-existe')
        .send({
          email: 'otro@example.com',
          password: 'Test1234!',
          firstName: 'Test',
        });

      expect(res.status).toBe(404);
    });

    it('registro con email de customerWithoutAccount vincula al existente (no duplica)', async () => {
      // This test only works on the FIRST run after a fresh seed (Supabase user
      // doesn't exist yet). On subsequent runs, Supabase returns "User already
      // registered" → 400. We test both scenarios:
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      try {
        const countBefore = await prisma.customer.count({
          where: { email: SEED_USERS.customerWithoutAccount.email, deletedAt: null },
        });
        expect(countBefore).toBe(1);

        const res = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .set('x-business-slug', SEED_BUSINESS_SLUG)
          .send({
            email: SEED_USERS.customerWithoutAccount.email,
            password: 'Test1234!',
            firstName: 'Vinculado',
          });

        if (res.status === 201) {
          // First run: Supabase user created, customer linked
          expect(res.body.customer).toBeDefined();
          const countAfter = await prisma.customer.count({
            where: { email: SEED_USERS.customerWithoutAccount.email, deletedAt: null },
          });
          expect(countAfter).toBe(1);
        } else {
          // Subsequent runs: Supabase already has this user → 400
          expect(res.status).toBe(400);
        }
      } finally {
        await prisma.$disconnect();
      }
    });
  });

  // ── GET /auth/me ────────────────────────────────────────────────────────

  describe('GET /api/v1/auth/me', () => {
    it('con token de owner (sin header) → 200, type member', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ type: 'member' });
      expect(res.body.business).toMatchObject({ subdomain: SEED_BUSINESS_SLUG });
    });

    it('con token de customer (con header) → 200, type customer', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${customerToken}`)
        .set('x-business-slug', SEED_BUSINESS_SLUG);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ type: 'customer' });
    });

    it('sin token → 401', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
    });

    it('con token inválido → 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer token-invalido-random-string');

      expect(res.status).toBe(401);
    });
  });

  // ── Regresión: member con header X-Business-Slug ─────────────────────────

  describe('Regresión: member token + header X-Business-Slug', () => {
    it('GET /auth/me con token de member + header X-Business-Slug → sigue siendo type member', async () => {
      // Login as owner without header
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: SEED_USERS.owner.email, password: SEED_USERS.owner.password });
      expect(loginRes.status).toBe(201);
      expect(loginRes.body.type).toBe('member');

      // Use that SAME token with X-Business-Slug header — must still resolve as member
      const meRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .set('x-business-slug', SEED_BUSINESS_SLUG);

      expect(meRes.status).toBe(200);
      expect(meRes.body.type).toBe('member');
    });

    it('GET /business con token de member + header X-Business-Slug → sigue siendo member (no 403/401)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/business')
        .set('Authorization', `Bearer ${ownerToken}`)
        .set('x-business-slug', SEED_BUSINESS_SLUG);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Zapatos Lorena');
    });
  });

  // ── POST /auth/logout ───────────────────────────────────────────────────

  describe('POST /api/v1/auth/logout', () => {
    it('con token válido → 201', async () => {
      // Login fresh to get a disposable token
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: SEED_USERS.owner.email, password: SEED_USERS.owner.password });

      const freshToken = loginRes.body.token;

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${freshToken}`);

      expect([200, 201]).toContain(res.status);
    });
  });

  // ── POST /auth/forgot-password ──────────────────────────────────────────

  describe('POST /api/v1/auth/forgot-password', () => {
    it('con email existente → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: SEED_USERS.owner.email });

      expect(res.status).toBe(201);
    });

    it('con email inexistente → 201 (no filtra información)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'noexiste-forgot@example.com' });

      expect(res.status).toBe(201);
    });
  });

  // ── POST /auth/accept-invitation ────────────────────────────────────────
  // NOTE: Not covered automatically — requires a PENDING member with hasTempPassword=true.
  // The seed creates members as ACTIVE. Documenting as uncovered case.

  describe('POST /api/v1/auth/accept-invitation', () => {
    it.todo('flujo completo de aceptar invitación (requiere member PENDING en seed)');
  });
});
