import { Role, CreateRoleDto, UpdateRoleDto } from "../types/role.types";

export const rolesService = {
  getAll: async (): Promise<Role[]> => {
    // TODO: Consulta BD
    return [];
  },

  getById: async (id: string): Promise<Role | null> => {
    // TODO: Consulta BD por ID
    return null;
  },

  create: async (data: CreateRoleDto): Promise<Role> => {
    // TODO: Validar nombre único y persistir
    return { id: "role_" + Date.now(), ...data, createdAt: new Date() };
  },

  update: async (id: string, data: UpdateRoleDto): Promise<Role | null> => {
    // TODO: Actualizar en BD
    return null;
  },

  delete: async (id: string): Promise<boolean> => {
    // TODO: Validar que ningún usuario tenga este rol asignado antes de borrar
    return true;
  }
};

