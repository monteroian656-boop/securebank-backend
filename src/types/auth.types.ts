import { User } from "./user.types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, "passwordHash">;
}

export interface JWTPayload {
  userId: string;
  roleId: string;
  permissions: string[];
}
