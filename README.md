# SecureBank Solutions

Plataforma de gestión de accesos, roles, permisos y auditoría para
entidades bancarias, con arquitectura multi-tenant. Full-stack
(React + Node.js + PostgreSQL) con pruebas automatizadas,
análisis estático y pipeline de integración continua.

## Aspectos destacados

- **Arquitectura multi-tenant** con aislamiento de datos por entidad, verificado a nivel de código y de pruebas
- **RBAC (control de acceso basado en roles)** con permisos granulares y middleware de autorización centralizado
- **28 pruebas automatizadas** (unitarias + integración) corriendo contra PostgreSQL
- **Pipeline de CI/CD** en GitHub Actions: análisis estático, build y pruebas en cada push
- **Auditoría de seguridad interna documentada**, con hallazgos, correcciones y verificación de cada uno (ver `backend/README.md`)
- **Trazabilidad completa** de historias de usuario a endpoints, pantallas y pruebas

## Stack

| Capa | Tecnologías |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router, TailwindCSS |
| Backend | Node.js, Express, TypeScript, PostgreSQL (`pg`), JWT, bcrypt, Zod |
| Pruebas | Vitest, Supertest |
| Calidad | ESLint (`@typescript-eslint`) |
| CI/CD | GitHub Actions |
| Infraestructura | Docker Compose |

## Arquitectura

Multi-tenant por columna: una sola aplicación y una sola base de
datos sirven a todas las entidades bancarias clientes, con cada
registro operativo (usuarios, roles, políticas, sesiones, auditoría,
SLA) asociado a un `tenantId` que se resuelve siempre desde el JWT
del usuario autenticado, nunca desde un parámetro de la petición.

```
routes/        define cada endpoint + middleware de auth y permisos
controllers/   interpretan la petición, delegan al service, arman la respuesta
services/      lógica de negocio y reglas del dominio
repositories/  acceso a datos, SQL parametrizado por entidad
db/            conexión a PostgreSQL, migraciones y seed
```

## Correr el proyecto

```
docker compose up -d              # levanta PostgreSQL

cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev                       # http://localhost:3000

cd ../frontend                    # en otra terminal
npm install
cp .env.example .env
npm run dev                       # http://localhost:5173
```

Documentación detallada de cada módulo (endpoints, rutas, decisiones
de diseño): [`backend/README.md`](backend/README.md) ·
[`frontend/README.md`](frontend/README.md)

## Acceso de prueba

```
Correo:      ana.solano@bancocr.fi.cr                   (Administrador)
Correo:      jorge.vindas@bancocr.fi.cr                  (Auditor)
Correo:      carlos.fernandez@securebanksolutions.com     (Staff, acceso multi-entidad)
Contraseña:  SecureBank123!
Código MFA:  123456
```

## Pruebas y calidad

```
cd backend && npm test              # 19 pruebas unitarias
cd backend && npm run test:coverage # con reporte de cobertura
cd backend && npm run test:integration  # 9 pruebas de integración
cd backend && npm run lint          # análisis estático
cd frontend && npm run lint         # análisis estático
```

Cobertura en los servicios de autenticación y control de acceso:
`auth.service.ts` 74%, `role.service.ts` 90%.

## CI/CD

`.github/workflows/ci.yml` ejecuta en cada push/PR: análisis estático,
build, pruebas unitarias con cobertura, migración y pruebas de
integración contra una instancia de PostgreSQL real levantada como
servicio del pipeline. Ver pestaña **Actions** del repositorio.

## Estructura

```
backend/             API REST — ver backend/README.md
frontend/             interfaz React — ver frontend/README.md
docker-compose.yml    orquestación de PostgreSQL
.github/workflows/    pipeline de CI/CD
```

## Equipo

Victor Rodríguez Sibaja · Lukas Leiva Cordero · Sebastián Ortiz
Carranza · Ian Daniel Montero Rodríguez · Zahid Torres Fonseca
