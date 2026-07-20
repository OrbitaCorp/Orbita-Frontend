# Órbita — contexto del proyecto

## Arquitectura / decisiones técnicas

### Auth: NO usa Supabase Auth

El proyecto **ya no usa Supabase Auth**, a pesar de que documentación vieja (incluyendo
descripciones de tareas en Jira) todavía lo mencione. La autenticación es propia:

- Contraseñas hasheadas con **argon2id**.
- **JWT firmado con clave propia (HS256)** — no tokens de Supabase.
- Tablas propias en Prisma: `refresh_tokens` y `password_reset_tokens`.
- Cada negocio (`businessId`) tiene sus propias credenciales **completamente aisladas**: el
  mismo email puede existir como `member` en un negocio y `customer` en otro, con
  contraseñas independientes entre sí.

Ver [`apps/api/src/auth/auth.service.ts`](apps/api/src/auth/auth.service.ts) y
[`apps/api/src/common/guards/auth.guard.ts`](apps/api/src/common/guards/auth.guard.ts) como
fuente de verdad del flujo actual. No asumas Supabase Auth por default ni propongas volver a
él — si una tarea o documento lo menciona, es una referencia desactualizada.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
