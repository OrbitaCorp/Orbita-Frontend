/**
 * Tests del flujo de Google OAuth (RBT-287).
 *
 * Mockea únicamente las dos llamadas de red reales de google-auth-library
 * (OAuth2Client.getToken y .verifyIdToken) — todo lo demás (firma/verificación
 * de `state`, resolución de negocio, vinculación/creación, emisión de sesión,
 * exchange store) corre con el código real.
 */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { createHmac } from 'crypto';
import { createTestApp, closeTestApp } from './helpers/test-app';
import { GoogleAuthService } from '../src/auth/google-auth.service';
import { SEED_USERS, SEED_BUSINESS_SLUG } from './helpers/test-users';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3001';
const CALLBACK_PATH = '/auth/google/callback';

interface MockIdentity {
  email: string;
  sub: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
}

function mockGoogleIdentity(payload: MockIdentity): void {
  jest.spyOn(OAuth2Client.prototype, 'getToken').mockResolvedValueOnce({
    tokens: { id_token: 'fake-id-token' },
  } as never);
  jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
    getPayload: () => ({ email_verified: true, ...payload }),
  } as never);
}

function codeFromRedirect(location: string): string | null {
  const url = new URL(location);
  return url.searchParams.get('code');
}

function errorFromRedirect(location: string): string | null {
  const url = new URL(location);
  return url.searchParams.get('error');
}

// Firma un state con exp arbitrario (para probar expiración) usando el mismo
// esquema que GoogleAuthService.signState — HMAC-SHA256 con JWT_SECRET.
function signStateAt(payload: { slug: string | null; contexto: 'storefront' | 'apex' }, exp: number): string {
  const body = Buffer.from(JSON.stringify({ ...payload, nonce: 'test-nonce', exp })).toString('base64url');
  const sig = createHmac('sha256', process.env.JWT_SECRET!).update(body).digest('base64url');
  return `${body}.${sig}`;
}

describe('Google OAuth (e2e)', () => {
  let app: INestApplication;
  let googleAuth: GoogleAuthService;
  let SLUG_B: string;

  beforeAll(async () => {
    app = await createTestApp();
    googleAuth = app.get(GoogleAuthService);

    const ownerBEmail = `google-owner-b-${Date.now()}@test.com`;
    const regRes = await request(app.getHttpServer())
      .post('/api/v1/onboarding/register-business')
      .send({
        ownerName: 'Owner Google B',
        email: ownerBEmail,
        password: 'Test1234!',
        businessName: `Tienda Google B ${Date.now()}`,
      });
    expect(regRes.status).toBe(201);
    SLUG_B = regRes.body.business.subdomain;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── 1. Cuenta nueva en tienda A ─────────────────────────────────────────
  it('1. Login con Google en tienda A, cuenta nueva → crea customer en A, emailVerified: true', async () => {
    const email = `google-new-${Date.now()}@example.com`;
    const googleId = `google-sub-new-${Date.now()}`;
    mockGoogleIdentity({ email, sub: googleId, given_name: 'Nueva', family_name: 'Cuenta' });

    const state = googleAuth.signState({ slug: SEED_BUSINESS_SLUG, contexto: 'storefront' });
    const callbackRes = await request(app.getHttpServer())
      .get(`/api/v1/${CALLBACK_PATH.slice(1)}`)
      .query({ code: 'fake-code', state })
      .redirects(0);

    expect(callbackRes.status).toBe(302);
    const location = callbackRes.headers.location as string;
    expect(location.startsWith(`${FRONTEND_URL}${CALLBACK_PATH}?code=`)).toBe(true);

    const code = codeFromRedirect(location);
    expect(code).toBeTruthy();

    const exchangeRes = await request(app.getHttpServer())
      .post('/api/v1/auth/google/exchange')
      .send({ code });

    expect(exchangeRes.status).toBe(201);
    expect(exchangeRes.body.type).toBe('customer');
    expect(exchangeRes.body.customer.email).toBe(email);

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const customer = await prisma.customer.findFirst({
        where: { email, googleId },
        include: { business: { select: { subdomain: true } } },
      });
      expect(customer).not.toBeNull();
      expect(customer.emailVerified).toBe(true);
      expect(customer.passwordHash).toBeNull(); // no necesita password usable
      expect(customer.business.subdomain).toBe(SEED_BUSINESS_SLUG);
    } finally {
      await prisma.$disconnect();
    }
  });

  // ── 2. Vincula a customer existente con password (no duplica) ──────────
  it('2. Login con Google en A, mismo email que customer con password en A → vincula (no duplica)', async () => {
    const email = SEED_USERS.customerWithAccount.email; // cliente@zapatoslorena.test, ya tiene passwordHash
    const googleId = `google-link-${Date.now()}`;

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const before = await prisma.customer.findFirst({
        where: { email, business: { subdomain: SEED_BUSINESS_SLUG } },
      });
      expect(before).not.toBeNull();
      expect(before.passwordHash).not.toBeNull(); // precondición: ya tenía password
      const countBefore = await prisma.customer.count({
        where: { email, business: { subdomain: SEED_BUSINESS_SLUG } },
      });

      mockGoogleIdentity({ email, sub: googleId });
      const state = googleAuth.signState({ slug: SEED_BUSINESS_SLUG, contexto: 'storefront' });
      const callbackRes = await request(app.getHttpServer())
        .get(`/api/v1/${CALLBACK_PATH.slice(1)}`)
        .query({ code: 'fake-code', state })
        .redirects(0);
      const code = codeFromRedirect(callbackRes.headers.location as string);

      const exchangeRes = await request(app.getHttpServer())
        .post('/api/v1/auth/google/exchange')
        .send({ code });
      expect(exchangeRes.status).toBe(201);
      expect(exchangeRes.body.customer.id).toBe(before.id); // MISMA fila

      const countAfter = await prisma.customer.count({
        where: { email, business: { subdomain: SEED_BUSINESS_SLUG } },
      });
      expect(countAfter).toBe(countBefore); // sin duplicar

      const after = await prisma.customer.findUnique({ where: { id: before.id } });
      expect(after.googleId).toBe(googleId); // vinculado
      expect(after.passwordHash).toBe(before.passwordHash); // password intacto
    } finally {
      await prisma.$disconnect();
    }
  });

  // ── 3. Aislamiento: mismo googleId en tienda B → no lo encuentra, crea independiente ──
  it('3. Login con Google en tienda B con mismo googleId que en A → NO encuentra nada en B, crea customer independiente', async () => {
    const email = `google-shared-${Date.now()}@example.com`;
    const googleId = `google-shared-sub-${Date.now()}`;

    // Login en A primero.
    mockGoogleIdentity({ email, sub: googleId });
    const stateA = googleAuth.signState({ slug: SEED_BUSINESS_SLUG, contexto: 'storefront' });
    const callbackA = await request(app.getHttpServer())
      .get(`/api/v1/${CALLBACK_PATH.slice(1)}`)
      .query({ code: 'fake-code-a', state: stateA })
      .redirects(0);
    const codeA = codeFromRedirect(callbackA.headers.location as string);
    const exchangeA = await request(app.getHttpServer()).post('/api/v1/auth/google/exchange').send({ code: codeA });
    expect(exchangeA.status).toBe(201);
    const customerAId = exchangeA.body.customer.id;

    // Mismo email + mismo googleId, pero en tienda B.
    mockGoogleIdentity({ email, sub: googleId });
    const stateB = googleAuth.signState({ slug: SLUG_B, contexto: 'storefront' });
    const callbackB = await request(app.getHttpServer())
      .get(`/api/v1/${CALLBACK_PATH.slice(1)}`)
      .query({ code: 'fake-code-b', state: stateB })
      .redirects(0);
    const codeB = codeFromRedirect(callbackB.headers.location as string);
    const exchangeB = await request(app.getHttpServer()).post('/api/v1/auth/google/exchange').send({ code: codeB });
    expect(exchangeB.status).toBe(201);
    const customerBId = exchangeB.body.customer.id;

    expect(customerBId).not.toBe(customerAId); // fila independiente, no la misma

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const rows = await prisma.customer.findMany({ where: { googleId }, include: { business: true } });
      expect(rows).toHaveLength(2); // una por negocio
      const businessIdsFound = rows.map((r: { business: { subdomain: string } }) => r.business.subdomain).sort();
      expect(businessIdsFound).toEqual([SEED_BUSINESS_SLUG, SLUG_B].sort());
    } finally {
      await prisma.$disconnect();
    }
  });

  // ── 4. state falsificado o vencido → rechazado ──────────────────────────
  it('4a. state con firma falsificada → rechazado, no se procesa el login', async () => {
    const validState = googleAuth.signState({ slug: SEED_BUSINESS_SLUG, contexto: 'storefront' });
    const tamperedState = validState.slice(0, -4) + 'XXXX'; // corrompe la firma

    const getTokenSpy = jest.spyOn(OAuth2Client.prototype, 'getToken');

    const res = await request(app.getHttpServer())
      .get(`/api/v1/${CALLBACK_PATH.slice(1)}`)
      .query({ code: 'fake-code', state: tamperedState })
      .redirects(0);

    expect(res.status).toBe(302);
    expect(errorFromRedirect(res.headers.location as string)).toBe('GOOGLE_AUTH_FAILED');
    expect(getTokenSpy).not.toHaveBeenCalled(); // no llegó a intercambiar el code — se cortó en el state
  });

  it('4b. state vencido → rechazado, no se procesa el login', async () => {
    const expiredState = signStateAt({ slug: SEED_BUSINESS_SLUG, contexto: 'storefront' }, Date.now() - 1000);
    const getTokenSpy = jest.spyOn(OAuth2Client.prototype, 'getToken');

    const res = await request(app.getHttpServer())
      .get(`/api/v1/${CALLBACK_PATH.slice(1)}`)
      .query({ code: 'fake-code', state: expiredState })
      .redirects(0);

    expect(res.status).toBe(302);
    expect(errorFromRedirect(res.headers.location as string)).toBe('GOOGLE_AUTH_FAILED');
    expect(getTokenSpy).not.toHaveBeenCalled();
  });

  // ── 5. id_token con email_verified: false → rechazado ───────────────────
  it('5. id_token con email_verified: false → rechazado, no crea nada', async () => {
    const email = `google-unverified-${Date.now()}@example.com`;
    mockGoogleIdentity({ email, sub: `google-unverified-${Date.now()}`, email_verified: false });

    const state = googleAuth.signState({ slug: SEED_BUSINESS_SLUG, contexto: 'storefront' });
    const res = await request(app.getHttpServer())
      .get(`/api/v1/${CALLBACK_PATH.slice(1)}`)
      .query({ code: 'fake-code', state })
      .redirects(0);

    expect(res.status).toBe(302);
    expect(errorFromRedirect(res.headers.location as string)).toBe('GOOGLE_AUTH_FAILED');

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const count = await prisma.customer.count({ where: { email } });
      expect(count).toBe(0);
    } finally {
      await prisma.$disconnect();
    }
  });

  // ── 6. Owner sin negocio previo en apex → "no tenés negocio", nunca auto-crea ──
  it('6. Owner (member) login con Google en apex sin negocio previo → NO_BUSINESS, nunca crea negocio/member', async () => {
    const email = `google-no-business-${Date.now()}@example.com`;
    const googleId = `google-no-business-sub-${Date.now()}`;
    mockGoogleIdentity({ email, sub: googleId });

    const state = googleAuth.signState({ slug: null, contexto: 'apex' });
    const res = await request(app.getHttpServer())
      .get(`/api/v1/${CALLBACK_PATH.slice(1)}`)
      .query({ code: 'fake-code', state })
      .redirects(0);

    expect(res.status).toBe(302);
    const location = res.headers.location as string;
    expect(location).toBe(`${FRONTEND_URL}${CALLBACK_PATH}?error=NO_BUSINESS`);

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const memberCount = await prisma.member.count({ where: { OR: [{ email }, { googleId }] } });
      expect(memberCount).toBe(0); // nunca se creó member (ni negocio, por construcción del código)
    } finally {
      await prisma.$disconnect();
    }
  });

  // ── 7. El JWT/refresh token nunca aparece en la URL de redirect final ───
  it('7. El JWT/refresh token nunca aparece en la URL final de redirect', async () => {
    const email = `google-no-leak-${Date.now()}@example.com`;
    const googleId = `google-no-leak-sub-${Date.now()}`;
    mockGoogleIdentity({ email, sub: googleId });

    const state = googleAuth.signState({ slug: SEED_BUSINESS_SLUG, contexto: 'storefront' });
    const callbackRes = await request(app.getHttpServer())
      .get(`/api/v1/${CALLBACK_PATH.slice(1)}`)
      .query({ code: 'fake-code', state })
      .redirects(0);

    const location = callbackRes.headers.location as string;
    // El único parámetro es un código opaco de un solo uso — nunca un JWT.
    expect(location).toMatch(/\?code=[a-f0-9]{48}$/);
    expect(location).not.toMatch(/token=/i);
    expect(location.split('.').length).toBeLessThan(3); // un JWT real tiene 2 puntos (header.payload.sig)

    const code = codeFromRedirect(location);
    const exchangeRes = await request(app.getHttpServer())
      .post('/api/v1/auth/google/exchange')
      .send({ code });
    expect(exchangeRes.status).toBe(201);

    // El token/refreshToken real (obtenido recién acá, server-a-server) NUNCA
    // apareció en la URL de redirect capturada arriba.
    expect(location).not.toContain(exchangeRes.body.token);
    expect(location).not.toContain(exchangeRes.body.refreshToken);
  });

  // ── Exchange de un solo uso ──────────────────────────────────────────────
  it('el código de exchange es de un solo uso — la segunda vez falla', async () => {
    const email = `google-single-use-${Date.now()}@example.com`;
    mockGoogleIdentity({ email, sub: `google-single-use-sub-${Date.now()}` });

    const state = googleAuth.signState({ slug: SEED_BUSINESS_SLUG, contexto: 'storefront' });
    const callbackRes = await request(app.getHttpServer())
      .get(`/api/v1/${CALLBACK_PATH.slice(1)}`)
      .query({ code: 'fake-code', state })
      .redirects(0);
    const code = codeFromRedirect(callbackRes.headers.location as string);

    const first = await request(app.getHttpServer()).post('/api/v1/auth/google/exchange').send({ code });
    expect(first.status).toBe(201);

    const second = await request(app.getHttpServer()).post('/api/v1/auth/google/exchange').send({ code });
    expect(second.status).toBe(401);
  });
});
