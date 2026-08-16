export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  roleId: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserDto = Omit<User, "id" | "createdAt" | "updatedAt" | "status"> & {
  password: string;
};

export type UpdateUserDto = Partial<Omit<User, "id" | "passwordHash" | "createdAt" | "updatedAt">>;
