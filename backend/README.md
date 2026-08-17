# SecureBank — Backend

API REST real conectada a PostgreSQL

## Stack

- Node.js + Express 5 + TypeScript
- `pg` (driver directo de PostgreSQL) para todas las consultas
- `zod` para validación de entrada
- `jsonwebtoken` + `bcryptjs` para autenticación y hashing
- `vitest` + `supertest` para pruebas unitarias e integración
- `eslint` (`@typescript-eslint`) para análisis estático

## Arquitectura

Backend único, multi-tenant por columna: una sola aplicación y una
sola base de datos PostgreSQL sirven a todas las entidades bancarias
clientes, y cada fila operativa (usuarios, roles, políticas, sesiones,
auditoría, SLA) queda asociada a un `tenantId`. El aislamiento entre
entidades no es opcional: se aplica en cadarepositorio/consulta, y el `tenantId` sale 
siempre del JWT del usuario autenticado, nunca de un parámetro que el cliente pueda manipular.

Capas del proyecto:

```
routes/        monta cada router + authMiddleware / requirePermission
controllers/   procesan la petición, llaman al service, arman la respuesta
services/      lógica de negocio, reglas de cada HU
repositories/  SQL, uno por entidad de dominio
db/            pool de conexión a Postgres + runners de migrate/seed
```

## Correr el Backend

```
docker compose up -d          # levanta Postgres (desde la raíz del repo)
cd backend
npm install
cp .env.example .env
npm run migrate               # crea las tablas
npm run seed                  # carga datos de demo
npm run dev                   # http://localhost:3000
```

## Usuarios de demo

```
Correo:      ana.solano@bancocr.fi.cr                   (Administrador, Banco Central)
Correo:      jorge.vindas@bancocr.fi.cr                  (Auditor, Banco Central)
Correo:      carlos.fernandez@securebanksolutions.com     (staff SecureBank, ve todas las entidades)
Contraseña:  SecureBank123!
Código MFA:  123456 (paso simulado en el frontend)
```


## Endpoints

`GET /api/health` no requiere autenticación (chequeo de salud del
servicio). Todo lo demás (salvo login y reset de contraseña) requiere
`Authorization: Bearer <token>`. Todas las respuestas siguen el
envelope `{ success, data }` / `{ success, error: { code, message } }`.

| Método | Ruta | HU | Nota |
|---|---|---|---|
| GET | `/api/health` | — | Chequeo de salud, sin auth |
| POST | `/api/auth/login` | HU-02, HU-14 | Bloquea la cuenta tras 5 intentos fallidos |
| POST | `/api/auth/logout` | — | Revoca la sesión actual |
| GET | `/api/auth/me` | — | Revalida la sesión contra la DB |
| POST | `/api/auth/reset-password` | HU-03 | En dev devuelve `devToken` (no hay servidor de correo configurado) |
| POST | `/api/auth/reset-password/confirm` | HU-03 | Token de un solo uso, expira en 30 min |
| GET/POST | `/api/roles` | HU-04 | |
| PUT | `/api/roles/:id` | HU-04 | Cada edición queda en el historial (HU-15) |
| GET | `/api/users` | HU-05 | |
| PUT | `/api/users/:id/role` | HU-05 | |
| POST | `/api/users/:id/revoke` | HU-05 | También revoca sus sesiones activas |
| GET | `/api/users/inactive-count` | HU-11 | |
| GET | `/api/audit-logs` | HU-06, HU-10 | `?userId=&from=&to=` |
| GET | `/api/audit-logs/export` | HU-07, HU-20 | Devuelve `{ entries, hash }` con sha256 real |
| GET | `/api/role-history` | HU-15 | `?roleId=&changedBy=`, filtrado por entidad |
| GET/POST | `/api/tenants` | HU-08 | Rechaza nombre duplicado; crear requiere `users:write` |
| GET | `/api/sla` | HU-13 | Tenant siempre sale del JWT |
| GET | `/api/sla/trend` | HU-18 | Tenant siempre sale del JWT |
| GET/PUT | `/api/security-policy/:tenantId` | HU-01, HU-11, HU-19 | 403 si `:tenantId` no es el propio (HU-09) |
| GET | `/api/sessions` | HU-16 | |
| DELETE | `/api/sessions/:id` | HU-16 | Invalida esa sesión de verdad |
| POST | `/api/sessions/close-all` | HU-16 | |

## Seguridad — auditoría interna hecha sobre este backend

Después de la primera versión, se hizo una revisión y se encontraron y corrigieron varios problemas de aislamiento entre entidades (multi-tenant) y de permisos:

- `GET /api/sla` y `/api/sla/trend` aceptaban un `tenantId` por query
  string que sobreescribía el del token: cualquier admin podía ver el
  SLA de otra entidad. Ahora el tenant sale siempre del JWT.

- `GET /api/role-history` no filtraba por entidad.

- Asignar rol (`PUT /users/:id/role`), revocar (`POST /users/:id/revoke`)
  y editar rol (`PUT /roles/:id`) no verificaban que el recurso
  perteneciera a la entidad de quien hacía el pedido.

- El backend no verificaba permisos en ningún endpoint, el frontend ocultaba 
  botones según el permiso del rol, pero eso erapuramente cosmético; con un token
  válido de cualquier rol se podía crear roles, entidades, o reasignar 
  usuarios igual. Se agregó `middleware/permission.middleware.ts` (`requirePermission`)
  aplicado a todas las rutas de escritura y a las de auditoría (`audit:read`).

- El contador de intentos fallidos (HU-14) tenía un fallo que lo hacía
  reiniciarse en cada intento en vez de solo cuando el bloqueo
  realmente expiraba, lo que hacía que el bloqueo nunca se llegaba a activar.
  Se corrigió y verificó con un test que fuerza, 5 fallos reales.

- `role_change_entries.roleId` no tenía foreign key hacia `roles`
  (a diferencia de todas las demás tablas), se agregó en una
  migración nueva (`20260810020000_role_history_fk`).

- Los errores de validación de `zod` no se traducían bien y caían
  como 500 genérico en vez de 422 con el motivo corregido en el
  middleware de errores central

- **Revocar un usuario (HU-05) no cerraba su sesión activa.** Solo
  marcaba `isActive=false` en la base; si el usuario ya estaba
  logueado, seguía teniendo acceso completo hasta que su token
  expirara solo (8h), lo que contradecía la HU correspondiente
  `userService.revoke` ahora también revoca todas sus sesiones activas; 
  verificado con un test que revoca a un usuario logueado y confirma que 
  su siguiente petición con el mismo token se rechaza al instante

- El `Pool` de `pg` no tenía un listener de `error`, si Postgres se
  reinicia o hay un corte de red mientras un cliente queda inactivo en
  el pool, Node trata ese error como no capturado y cierra todo el
  proceso. Se agregó el listener en `db/pool.ts` y se verificó reiniciando Postgres 
  con el servidor corriendo: el proceso sobrevive y las peticiones siguientes
  funcionan normal

## Qué NO quedó implementado

- **HU-17 (Notificaciones)**: la pantalla del frontend existe pero es
  decorativa — no hay tabla ni endpoint. Si se quiere implementar en un futuro,
  hace falta una tabla de preferencias + hacer el envío desde `role.service.ts`
  cuando se edita un rol crítico.

- **Envío real de correo**: el reset de contraseña genera un token
  real pero no lo manda por correo (no hay proveedor de email
  configurado). En dev el token viaja en la respuesta (`devToken`).

- **Segundo factor (MFA) real**: el login valida contraseña, bloqueo y
  sesión, pero el código de 6 dígitos del segundo paso sigue
  siendo una simulación de UI en el frontend (código fijo `123456`).
  Implementar TOTP/SMS real quedó fuera de alcance de este avance.

- **HU-11 (desactivación automática)**: `GET /api/users/inactive-count`
  calcula en vivo cuántas cuentas se desactivarían con la política
  actual, pero no hay ningún cron/job que las desactive de verdad
  La desactivación real solo pasa hoy vía revocación manual (HU-05).
  Para que sea automática hace falta un scheduler (ej. `node-cron`) corriendo
  server-side, que quedó fuera de alcance de este pase.

- **Contacto de "Nueva entidad"**: el formulario de creación de tenant
  (frontend) valida un correo de contacto, pero el modelo `Tenant`
  solo tiene `id`/`name` — el backend no lo guarda todavía.

## Pruebas y calidad

```
npm test                  # 19 pruebas unitarias (auth.service, role.service) — con mocks
npm run test:coverage     # lo mismo, con reporte de cobertura
npm run lint               # análisis estático (ESLint) — 0 errores

# Pruebas de integración: requieren una base Postgres de pruebas
# aparte (no tocan la base de desarrollo). Una sola vez:
docker exec -it securebanksolutions-db-1 psql -U postgres -c "CREATE DATABASE securebank_test;"
# Con DATABASE_URL apuntando a securebank_test:
npm run migrate
npm run test:integration  # 9 pruebas — app real + Postgres real, sin mocks
```

Cobertura actual en los servicios críticos (auth/roles, el eje de
seguridad del sistema): `auth.service.ts` 74%, `role.service.ts` 90%.

## CI/CD

El pipeline (`.github/workflows/ci.yml`, en la raíz del repo) corre
en cada push/PR a `main`, `develop` y ramas `full-project*`. Levanta
un contenedor de Postgres real como servicio y ejecuta, para el
backend: lint → build → pruebas unitarias con cobertura → migración
→ pruebas de integración. Para el frontend: lint → build. Nada de
esto es manual, si algún paso falla, el pipeline se marca en rojo.

## Estructura

```
prisma/
  schema.prisma        documentación del modelo de datos
  migrations/           SQL versionado a mano
  seed.sql              datos de demo
src/
  db/           pool de conexión (con listener de error) + runners de migrate y seed
  types/        idénticos al frontend/src/types/shared.ts para conectar todo
  repositories/ SQL parametrizado, una por entidad
  services/     lógica de negocio (reglas de cada HU)
  controllers/  arman la respuesta con el envelope
  routes/       montan los controllers + authMiddleware/requirePermission
  middleware/   auth (JWT + sesión), permission (RBAC), error, 404
  utils/        errores tipados (errors.ts) y armado del envelope (response.ts)
  test/         helpers de pruebas de integración (reset/seed de la BD de test)
```