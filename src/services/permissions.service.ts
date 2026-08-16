import { Permission, CreatePermissionDto, UpdatePermissionDto } from "../types/permission.types";

export const permissionsService = {
  getAll: async (): Promise<Permission[]> => {
    // TODO: Consulta BD
    return [];
  },

  getById: async (id: string): Promise<Permission | null> => {
    // TODO: Consulta BD por ID
    return null;
  },

  create: async (data: CreatePermissionDto): Promise<Permission> => {
    // TODO: Crear en BD
    return { id: "perm_" + Date.now(), ...data };
  },

  update: async (id: string, data: UpdatePermissionDto): Promise<Permission | null> => {
    // TODO: Actualizar en BD
    return null;
  },

  delete: async (id: string): Promise<boolean> => {
    // TODO: Eliminar en BD
    return true;
  }
};
