import { User, CreateUserDto, UpdateUserDto } from "../types/user.types";
import { auditService } from "./audit.service";

export const usersService = {
  getAll: async (): Promise<Omit<User, "passwordHash">[]> => {
    // TODO: Consulta BD excluyendo el passwordHash
    return [];
  },

  getById: async (id: string): Promise<Omit<User, "passwordHash"> | null> => {
    // TODO: Consulta BD por ID
    return null;
  },

  create: async (data: CreateUserDto, performedByUserId?: string): Promise<Omit<User, "passwordHash">> => {
    // TODO: 1. Validar email único
    // TODO: 2. Hashear la contraseña (ej: bcrypt.hash)
    // TODO: 3. Guardar en BD
    
    const { password, ...userData } = data;
    const newUser: User = {
      id: "usr_" + Date.now(),
      ...userData,
      passwordHash: "hashed_password_mock",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await auditService.createLog({
      userId: performedByUserId,
      action: "CREATE_USER",
      resource: "USERS",
      details: { createdUserId: newUser.id }
    });

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  },

  update: async (id: string, data: UpdateUserDto, performedByUserId?: string): Promise<Omit<User, "passwordHash"> | null> => {
    // TODO: Actualizar en BD

    await auditService.createLog({
      userId: performedByUserId,
      action: "UPDATE_USER",
      resource: "USERS",
      details: { targetUserId: id, updatedFields: Object.keys(data) }
    });

    return null;
  },

  delete: async (id: string, performedByUserId?: string): Promise<boolean> => {
    // TODO: Borrado lógico o físico en BD

    await auditService.createLog({
      userId: performedByUserId,
      action: "DELETE_USER",
      resource: "USERS",
      details: { targetUserId: id }
    });

    return true;
  }
};
