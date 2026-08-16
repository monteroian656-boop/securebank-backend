import { LoginCredentials, AuthResponse } from "../types/auth.types";
import { auditService } from "./audit.service";

export const authService = {
  login: async (credentials: LoginCredentials, ipAddress?: string): Promise<AuthResponse> => {
    const { email, password } = credentials;

    // TODO: 1. Buscar usuario por email en la base de datos
    // TODO: 2. Verificar contraseña con bcrypt (bcrypt.compare)
    // TODO: 3. Generar token JWT firmado

    await auditService.createLog({
      action: "USER_LOGIN",
      resource: "AUTH",
      details: { email },
      ipAddress
    });

    return {
      token: "mock_jwt_token",
      user: {
        id: "user_123",
        username: "demo_user",
        email,
        roleId: "role_admin",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  },

  logout: async (userId: string, ipAddress?: string): Promise<{ success: boolean }> => {
    // TODO: Si usas lista negra de tokens o refresh tokens, invalidarlo aquí

    await auditService.createLog({
      userId,
      action: "USER_LOGOUT",
      resource: "AUTH",
      ipAddress
    });

    return { success: true };
  }
};
