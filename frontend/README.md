# SecureBank — Frontend

React + TypeScript + Vite + Tailwind + React Router. Conectado al
backend real, sin mocks.

## Stack

- React 18 + TypeScript + Vite
- React Router 6 (rutas protegidas por sesión y por permiso)
- TailwindCSS + PostCSS + Autoprefixer
- `zod` para validación de formularios
- ESLint (`@typescript-eslint` + `react-hooks`) + Prettier

## Arquitectura

Interfaz única (no hay una app por entidad bancaria): el contexto de
sesión (`AuthContext`) resuelve la entidad activa a partir del token,
y toda la UI se adapta según el rol y los permisos reales que devuelve
el backend. No hay lógica de roles hardcodeada en el frontend, ni
un modo admin separado por build.

Flujo de datos: `src/api/client.ts` es el único punto de llamada al
backend, respeta siempre el envelope `{ success, data }` /
`{ success, error }` y adjunta el token guardado. 
Las páginas nunca llaman a `fetch` directamente.

## Correr el Frontend

Con el backend corriendo en `http://localhost:3000` (ver
`backend/README.md`):

```
npm install
cp .env.example .env
npm run dev
```

## Login de demo

```
Correo:      ana.solano@bancocr.fi.cr                   (permisos: roles:write, users:write, audit:read)
Correo:      jorge.vindas@bancocr.fi.cr                  (permisos: audit:read)
Correo:      carlos.fernandez@securebanksolutions.com     (staff SecureBank, ve todas las entidades)
Contraseña:  SecureBank123!
Código MFA:  123456 (segundo factor simulado — ver nota abajo)
```

## Qué es real y qué sigue siendo mock up

**Real (contra el backend/Postgres):** login con bloqueo tras 5
intentos, roles y permisos, asignar/revocar acceso, auditoría con
filtros, exportación con hash sha256 real, historial de cambios de
roles, SLA y su tendencia, política de seguridad por entidad (con
aislamiento multi-tenant real — un admin no puede tocar la política de
otra entidad), sesiones (cerrar una la invalida de verdad en el
backend), reset de contraseña con token de un solo uso, alta de
entidades bancarias nuevas (`/tenants/new`).

**Sigue siendo demo/UI:**
- El código de 6 dígitos del login (segundo factor) es un paso de
  interfaz fijo (`123456`), el backend sí valida la contraseña real, pero
  no hay un segundo factor real (TOTP/SMS) implementado.

- HU-17 (Notificaciones, `/notifications`) no tiene backend — la
  pantalla existe pero no persiste ni envía nada.

- El correo de contacto en "Nueva entidad" se valida en el formulario
  pero el backend todavía no lo guarda (el modelo `Tenant` solo tiene
  `id`/`name`).

## Rutas y pantallas

Todas las rutas (salvo `/login` y `/reset-password`) están detrás de
`ProtectedRoute` (exige sesión) y algunas además exigen un permiso
específico del rol (`roles:write` o `users:write`).

| Ruta | Página | Permiso requerido |
|---|---|---|
| `/login` | `pages/auth/Login.tsx` | — (pública) |
| `/reset-password` | `pages/auth/ResetPassword.tsx` | — (pública) |
| `/dashboard/sla` | `pages/dashboard/SlaMonitoring.tsx` | sesión |
| `/audit/log` | `pages/audit/AuditLog.tsx` | sesión |
| `/audit/reports` | `pages/audit/AuditReports.tsx` | sesión |
| `/audit/role-history` | `pages/audit/RoleChangeHistory.tsx` | sesión |
| `/sessions` | `pages/sessions/MySessions.tsx` | sesión |
| `/notifications` | `pages/notifications/NotificationSettings.tsx` | sesión |
| `/security/password-policy` | `pages/security/PasswordPolicy.tsx` | `roles:write` |
| `/security/alerts` | `pages/security/FailedLoginAlerts.tsx` | `roles:write` |
| `/security/inactivity` | `pages/security/InactivityPolicy.tsx` | `roles:write` |
| `/security/tenant-params` | `pages/security/TenantSecurityParams.tsx` | `roles:write` |
| `/roles` | `pages/roles/RolesList.tsx` | `roles:write` |
| `/roles/assign` | `pages/roles/AssignRoles.tsx` | `users:write` |
| `/tenants/new` | `pages/tenants/TenantOnboarding.tsx` | `users:write` |
| `*` | `pages/misc/NotFound.tsx` | — |

## Estructura

```
src/
  api/
    client.ts            único punto de llamada al backend (envelope { success, data })
    errorMessage.ts       traduce códigos de error del backend a mensajes de UI
  router/
    routes.tsx             árbol de rutas completo, con las protecciones por permiso
  context/
    AuthContext.tsx        sesión real: guarda solo el token en localStorage,
                            todo lo demás (usuario, entidad, rol) se revalida
                            contra GET /api/auth/me al cargar la app
    ToastContext.tsx       notificaciones de éxito/error que son reutilizables
  constants/
    permissions.ts         nombres de permisos usados por RoleGate/ProtectedRoute
  components/
    layout/
      AppLayout.tsx         Sidebar + Topbar
      Sidebar.tsx / Topbar.tsx
      ProtectedRoute.tsx    bloquea rutas sin sesión y por permiso (requiredPermission)
      RoleGate.tsx          oculta elementos de UI según el permiso del rol activo
      ErrorBoundary.tsx     captura errores de render inesperados
    ui/
      LoadingState.tsx / EmptyState.tsx / ErrorState.tsx   estados reutilizables
      Modal.tsx / PageHeader.tsx / TrendSparkline.tsx / RiskBadge.tsx
  hooks/
    useAsyncData.ts         loading/error/data estándar para listas
    useAsyncAction.ts        loading/error/toast estándar para submits
  pages/                    una carpeta por épica, un archivo por HU
  types/shared.ts            idéntico a backend/src/types/shared.ts
  utils/errors.ts
```

## Pruebas

```
npm run lint    # análisis estático (ESLint) — 0 errores, 0 warnings
npm run build   # build de producción (tsc + vite) — verificado sin errores
```

El pipeline de CI/CD (`.github/workflows/ci.yml`, en la raíz del
repo) corre lint y build del frontend en cada push/PR, junto con
las pruebas del backend.
