# SecureBank Backend

Backend de la aplicación SecureBank desarrollado con Node.js, TypeScript y Express.

## Tecnologías

- Node.js
- TypeScript
- Express
- CORS
- dotenv
- ts-node-dev

## Estructura del proyecto

```text
src/
├── controllers/
│   ├── auth.controller.ts
│   ├── users.controller.ts
│   ├── roles.controller.ts
│   ├── permissions.controller.ts
│   └── audit.controller.ts
│
├── middleware/
│   ├── error.middleware.ts
│   └── notFound.middleware.ts
│
├── routes/
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── roles.routes.ts
│   ├── permissions.routes.ts
│   └── audit.routes.ts
│
├── services/
│   ├── auth.service.ts
│   ├── users.service.ts
│   ├── roles.service.ts
│   ├── permissions.service.ts
│   └── audit.service.ts
│
├── types/
├── utils/
├── app.ts
└── server.ts