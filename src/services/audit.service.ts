import { AuditLog, CreateAuditLogDto } from "../types/audit.types";

export const auditService = {
  createLog: async (logData: CreateAuditLogDto): Promise<AuditLog> => {
    // TODO: Reemplazar con llamada a BD
    const newLog: AuditLog = {
      id: "log_" + Date.now(),
      ...logData,
      timestamp: new Date()
    };
    return newLog;
  },

  getAll: async (): Promise<AuditLog[]> => {
    // TODO: Reemplazar con consulta a BD
    return [];
  },

  getById: async (id: string): Promise<AuditLog | null> => {
    // TODO: Reemplazar con consulta a BD por ID
    return null;
  }
};
