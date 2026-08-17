export type RiskLevel = 'low' | 'medium' | 'high';

export interface Tenant {
  id: string;
  name: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  roleId: string;
  tenantId: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  tenantId: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  result: 'success' | 'failure';
  ipAddress: string;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface RoleChangeEntry {
  id: string;
  roleId: string;
  changedBy: string;
  previousState: string;
  newState: string;
  createdAt: string;
}

export interface SlaMetric {
  tenantId: string;
  availability: number;
  avgResponseMs: number;
  breached: boolean;
}

export interface SecurityPolicy {
  tenantId: string;
  minLength: number;
  expirationDays: number;
  requireComplexity: boolean;
  inactivityDays: number;
  lockoutMinutes: number;
}

export interface Session {
  id: string;
  userId: string;
  userAgent: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: { code: string; message: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
