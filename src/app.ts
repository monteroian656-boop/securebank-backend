import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import rolesRoutes from "./routes/roles.routes";
import permissionsRoutes from "./routes/permissions.routes";
import auditRoutes from "./routes/audit.routes";

import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "SecureBank API funcionando"
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "SecureBank API funcionando correctamente"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/audit", auditRoutes);

// Middleware para rutas no encontradas
app.use(notFoundMiddleware);

// Middleware global de errores
app.use(errorMiddleware);

export default app;