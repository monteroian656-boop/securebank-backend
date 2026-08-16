export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: Date;
}

export type CreateAuditLogDto = Omit<AuditLog, "id" | "timestamp">;
