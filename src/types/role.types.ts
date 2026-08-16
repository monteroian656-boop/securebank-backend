export interface Role {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  createdAt: Date;
}

export type CreateRoleDto = Omit<Role, "id" | "createdAt">;
export type UpdateRoleDto = Partial<CreateRoleDto>;
