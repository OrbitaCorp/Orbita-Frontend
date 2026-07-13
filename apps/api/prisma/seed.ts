// Seed de datos de prueba para el flujo de Auth (Fase 1).
// Idempotente: correrlo varias veces no duplica ni rompe nada.
//
// Uso: pnpm seed  (o: npx prisma db seed)

process.loadEnvFile?.();

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en .env para correr el seed.',
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_PASSWORD = 'Test1234!';

// ── Catálogo global de permisos (7 grupos, ~19 permisos — ver CONTRATO_API.md §1) ──

const PERMISSIONS: Array<{ group: string; code: string; label: string }> = [
  { group: 'Pedidos', code: 'orders.view', label: 'Ver pedidos' },
  { group: 'Pedidos', code: 'orders.manage', label: 'Gestionar pedidos' },
  { group: 'Pedidos', code: 'orders.export', label: 'Exportar pedidos' },
  { group: 'Clientes', code: 'customers.view', label: 'Ver clientes' },
  { group: 'Clientes', code: 'customers.manage', label: 'Gestionar clientes' },
  { group: 'Reportes', code: 'reports.view', label: 'Ver reportes' },
  { group: 'Reportes', code: 'reports.export', label: 'Exportar reportes' },
  { group: 'Inventario', code: 'inventory.view', label: 'Ver inventario' },
  { group: 'Inventario', code: 'inventory.manage', label: 'Gestionar inventario' },
  { group: 'POS', code: 'pos.sell', label: 'Vender (POS)' },
  { group: 'POS', code: 'pos.edit_price', label: 'Editar precio en ticket' },
  { group: 'POS', code: 'pos.cash', label: 'Operar caja' },
  { group: 'POS', code: 'pos.cash.manage', label: 'Gestionar sesiones de caja' },
  { group: 'Descuentos', code: 'discounts.view', label: 'Ver descuentos' },
  { group: 'Descuentos', code: 'discounts.manage', label: 'Gestionar descuentos' },
  { group: 'Configuración', code: 'config.edit', label: 'Editar configuración' },
  { group: 'Configuración', code: 'config.team.manage', label: 'Gestionar equipo' },
  { group: 'Configuración', code: 'config.audit.view', label: 'Ver auditoría' },
  { group: 'Configuración', code: 'config.domains.manage', label: 'Gestionar dominios' },
];

// Permisos por rol default (coarse-grained; @Roles() ya cubre los casos owner-only)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: PERMISSIONS.map((p) => p.code), // todo
  admin: PERMISSIONS.map((p) => p.code), // todo (los casos owner-only usan @Roles('owner') directo)
  cajero: ['pos.sell', 'pos.cash', 'orders.view', 'customers.view', 'discounts.view'],
  empleado: ['orders.view', 'customers.view', 'inventory.view'],
};

// ── Helper: crear o reutilizar un usuario de Supabase Auth por email ──

async function getOrCreateSupabaseUser(email: string, password: string): Promise<string> {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (!createError && created.user) return created.user.id;

  // Ya existe: buscarlo paginando (la Admin API no filtra por email directamente).
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) return found.id;
    if (data.users.length < 200) break; // última página
  }

  throw new Error(
    `No se pudo crear ni encontrar el usuario de Supabase para ${email}: ${createError?.message}`,
  );
}

async function main() {
  // ── 1. Negocio ─────────────────────────────────────────────────────────────

  const business = await prisma.business.upsert({
    where: { subdomain: 'zapatoslorena' },
    update: {},
    create: {
      name: 'Zapatos Lorena',
      industry: 'Indumentaria',
      description: 'Zapatería de barrio con venta online y en local.',
      subdomain: 'zapatoslorena',
      mode: 'FULL',
    },
  });

  const existingBranch = await prisma.branch.findFirst({
    where: { businessId: business.id, isDefault: true },
  });
  if (!existingBranch) {
    await prisma.branch.create({
      data: {
        businessId: business.id,
        name: 'Principal',
        address: 'Av. Siempre Viva 742',
        isDefault: true,
      },
    });
  }

  await prisma.businessConfig.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      whatsapp: '+5493751123456',
      email: 'contacto@zapatoslorena.test',
      scheduleText: 'Lun a Vie 9 a 18hs',
      acceptsMercadopago: true,
      acceptsCash: true,
      acceptsTransfer: true,
      acceptsPickup: true,
      transferAlias: 'zapatoslorena.mp',
      shippingBase: 1500,
      freeShippingFrom: 20000,
      deliveryZones: ['Posadas', 'Garupá'],
    },
  });

  await prisma.storefrontConfig.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      storeName: 'Zapatos Lorena',
      tagline: 'Calzado para toda la familia',
      colorPrimary: '#8B4513',
      colorSecondary: '#D2B48C',
      colorMode: 'light',
      headerLayout: 'centered',
      gridLayout: 'grid-3',
      showRating: true,
      showNewBadge: true,
      showWhatsapp: true,
    },
  });

  await prisma.notificationConfig.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      matrix: {
        nuevo_pedido: { panel: true, email: true, whatsapp: false },
        pago_confirmado: { panel: true, email: true, whatsapp: false },
      },
    },
  });

  // ── 2. Permisos (catálogo global) + roles ───────────────────────────────────

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  const roleDefs = [
    { name: 'owner', color: '#000000' },
    { name: 'admin', color: '#4A5568' },
    { name: 'cajero', color: '#2B6CB0' },
    { name: 'empleado', color: '#718096' },
  ];

  const roles: Record<string, { id: string }> = {};
  for (const def of roleDefs) {
    let role = await prisma.role.findFirst({
      where: { businessId: business.id, name: def.name },
    });
    if (!role) {
      role = await prisma.role.create({
        data: {
          businessId: business.id,
          name: def.name,
          color: def.color,
          isDefault: true,
        },
      });
    }
    roles[def.name] = role;

    const permissionCodes = ROLE_PERMISSIONS[def.name] ?? [];
    const permissions = await prisma.permission.findMany({
      where: { code: { in: permissionCodes } },
    });
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  // ── 3. Member owner ──────────────────────────────────────────────────────────

  const ownerEmail = 'dueno@zapatoslorena.test';
  const ownerAuthUserId = await getOrCreateSupabaseUser(ownerEmail, TEST_PASSWORD);
  await prisma.member.upsert({
    where: { businessId_email: { businessId: business.id, email: ownerEmail } },
    update: { authUserId: ownerAuthUserId, status: 'ACTIVE', hasTempPassword: false },
    create: {
      businessId: business.id,
      authUserId: ownerAuthUserId,
      name: 'Lorena Dueña',
      email: ownerEmail,
      roleId: roles.owner.id,
      status: 'ACTIVE',
      hasTempPassword: false,
    },
  });

  // ── 4. Member cajero ─────────────────────────────────────────────────────────

  const cajeroEmail = 'cajero@zapatoslorena.test';
  const cajeroAuthUserId = await getOrCreateSupabaseUser(cajeroEmail, TEST_PASSWORD);
  await prisma.member.upsert({
    where: { businessId_email: { businessId: business.id, email: cajeroEmail } },
    update: { authUserId: cajeroAuthUserId, status: 'ACTIVE', hasTempPassword: false },
    create: {
      businessId: business.id,
      authUserId: cajeroAuthUserId,
      name: 'Carlos Cajero',
      email: cajeroEmail,
      roleId: roles.cajero.id,
      status: 'ACTIVE',
      hasTempPassword: false,
    },
  });

  // ── 5. Customer con cuenta ───────────────────────────────────────────────────

  const clienteEmail = 'cliente@zapatoslorena.test';
  const clienteAuthUserId = await getOrCreateSupabaseUser(clienteEmail, TEST_PASSWORD);
  await prisma.customer.upsert({
    where: { businessId_email: { businessId: business.id, email: clienteEmail } },
    update: { authUserId: clienteAuthUserId },
    create: {
      businessId: business.id,
      authUserId: clienteAuthUserId,
      firstName: 'Ana',
      lastName: 'García',
      email: clienteEmail,
    },
  });

  // ── 6. Customer sin cuenta (cargado desde POS) ──────────────────────────────

  const sinCuentaEmail = 'sinregistrar@zapatoslorena.test';
  await prisma.customer.upsert({
    where: { businessId_email: { businessId: business.id, email: sinCuentaEmail } },
    update: {},
    create: {
      businessId: business.id,
      authUserId: null,
      firstName: 'Pedro',
      lastName: 'Martínez',
      email: sinCuentaEmail,
      phone: '+5493751123456',
    },
  });

  // ── 6b. Customer sin cuenta #2 (fixture reutilizable para pruebas manuales) ─
  // El de arriba (sinregistrar@) ya se vinculó a una cuenta real de Supabase en
  // pruebas anteriores. Este segundo customer permite repetir el flujo de
  // vinculación POS→storefront sin depender de un dato ya "gastado".

  const sinCuentaEmail2 = 'sinregistrar2@zapatoslorena.test';
  await prisma.customer.upsert({
    where: { businessId_email: { businessId: business.id, email: sinCuentaEmail2 } },
    update: {},
    create: {
      businessId: business.id,
      authUserId: null,
      firstName: 'Laura',
      lastName: 'Fernández',
      email: sinCuentaEmail2,
      phone: '+5493751987654',
    },
  });

  // ── Resumen ──────────────────────────────────────────────────────────────────

  console.log('');
  console.log('✅ Seed completado');
  console.log('');
  console.log(`Negocio: Zapatos Lorena (subdomain: zapatoslorena)`);
  console.log('');
  console.log('Credenciales de prueba:');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ Owner (panel, sin header)                                │');
  console.log(`│   email: ${ownerEmail}`);
  console.log(`│   password: ${TEST_PASSWORD}`);
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Cajero (panel, sin header, para probar RolesGuard)       │');
  console.log(`│   email: ${cajeroEmail}`);
  console.log(`│   password: ${TEST_PASSWORD}`);
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Cliente CON cuenta (storefront, header                   │');
  console.log('│ X-Business-Slug: zapatoslorena)                          │');
  console.log(`│   email: ${clienteEmail}`);
  console.log(`│   password: ${TEST_PASSWORD}`);
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Cliente SIN cuenta (creado desde POS, sin auth todavía)  │');
  console.log(`│   email: ${sinCuentaEmail}`);
  console.log('│   (ya está vinculado a una cuenta real de Supabase por   │');
  console.log('│   pruebas anteriores — usalo para loguearte, no para     │');
  console.log('│   registrarte de nuevo)                                  │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Cliente SIN cuenta #2 (fixture reutilizable para pruebas │');
  console.log('│ manuales repetidas de vinculación POS→storefront)        │');
  console.log(`│   email: ${sinCuentaEmail2}`);
  console.log('│   (usar este email en /auth/register cuando quieras      │');
  console.log('│   repetir la prueba — el primero, sinregistrar@, ya está │');
  console.log('│   vinculado y no sirve más para este caso)               │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log('');
}

main()
  .catch((err) => {
    console.error('❌ Seed falló:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
