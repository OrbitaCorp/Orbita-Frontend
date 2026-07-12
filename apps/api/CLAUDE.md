# Instrucciones permanentes para trabajar en apps/api/

## Mantener PENDIENTES.md actualizado

Este proyecto mantiene un archivo `apps/api/PENDIENTES.md` como registro vivo de todo lo que
queda pendiente, inconsistente, o requiere decisión/revisión humana. Es responsabilidad de
Claude Code actualizarlo al final de CADA tarea que realice en este backend, sin que el
usuario tenga que pedirlo explícitamente.

### Qué va en PENDIENTES.md

- **Decisiones tomadas sin especificación clara** — cualquier vez que el contrato de API, el
  modelo de datos, o el usuario no especificaron algo con precisión y hubo que decidir un
  criterio propio para poder avanzar.
- **Conflictos detectados** — casos donde dos documentos (contrato, modelo de datos, código
  existente) se contradicen entre sí.
- **Funcionalidad a medio construir** — endpoints que quedaron como stub porque dependen de
  un módulo que todavía no existe, o que se pospusieron deliberadamente.
- **Deuda técnica identificada** — atajos tomados conscientemente por velocidad, que deberían
  revisarse antes de producción (ej: falta de rate limiting, validaciones laxas, seguridad
  floja en algún flujo).
- **Bugs de infraestructura encontrados y corregidos** — para que quede registro de qué se
  rompió y cómo se arregló, en caso de que reaparezca en otro contexto.
- **Preguntas abiertas para el equipo** — cosas que technically funcionan pero donde el
  criterio de negocio no está claro y alguien (CTO/CEO/CPO) debería confirmar.

### Qué NO va en PENDIENTES.md

- Confirmaciones de que algo quedó bien implementado y verificado (eso va en el resumen de
  la tarea, no acá).
- Detalles de implementación que no requieren decisión de nadie.

### Formato

Cada entrada lleva: fecha, módulo/fase donde se originó, descripción del problema o decisión,
y estado (`ABIERTO` | `RESUELTO — [cómo]` | `DIFERIDO — [hasta cuándo/qué condición]`).

Organizá el archivo por fase/módulo (siguiendo TAREAS_IMPLEMENTACION.md), con las entradas
más recientes de cada módulo arriba. NO borres entradas resueltas — marcalas como
`RESUELTO` con la fecha y cómo se resolvió, para mantener el historial.

### Ejemplo de entrada

```markdown
## Fase 2 — Businesses/Branches

### [2026-07-XX] Rol mínimo para operaciones de sucursal
**Estado:** RESUELTO (2026-07-XX)
El contrato decía owner/admin para POST/PUT/DELETE /branches. Se decidió owner únicamente
por ser operación estructural (afecta stock/caja/reportes de todo el negocio). CONTRATO_API.md
corregido en consecuencia.

### [2026-07-XX] Endpoint POST /businesses (creación de negocio) no implementado
**Estado:** DIFERIDO — hasta que se diseñe como BusinessOnboardingService compartido con el
seed script, para no duplicar la lógica de transacción (crear business + branch + roles +
permissions + config + member owner + subscription inicial).

### [2026-07-XX] assertMemberContext() agregado en Businesses/Branches
**Estado:** ABIERTO — se detectó que endpoints sin @Roles() declarado no bloqueaban tokens de
tipo 'customer' (un cliente del storefront con header X-Business-Slug podía llamarlos). Se
agregó el chequeo en Businesses/Branches. PENDIENTE: revisar si otros módulos (a implementar)
necesitan el mismo chequeo, o si conviene moverlo al AuthGuard global en vez de repetirlo
módulo por módulo.
```

## Regla de trabajo

Al terminar CUALQUIER tarea en apps/api/ (implementar un módulo, corregir un bug, tomar una
decisión no especificada), antes de dar la tarea por finalizada:

1. Revisá si generaste algo que corresponda documentar en PENDIENTES.md según los criterios
   de arriba.
2. Si sí, agregalo (o actualizá una entrada existente si el pendiente ya estaba anotado y
   ahora se resolvió).
3. Mencioná en tu resumen final que actualizaste PENDIENTES.md y qué entradas tocaste.

Si una tarea no genera ningún pendiente ni decisión no especificada, no hace falta tocar el
archivo — no generes entradas artificiales solo para tener actividad.
