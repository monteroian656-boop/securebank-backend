export interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
}

export type CreatePermissionDto = Omit<Permission, "id">;
export type UpdatePermissionDto = Partial<CreatePermissionDto>;
