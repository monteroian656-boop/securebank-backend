import { roleHistoryRepository } from '../repositories/roleHistory.repository';

export const roleHistoryService = {
  // HU-15: filtro por rol y/o por quién hizo el cambio
  async list(tenantId: string, filters: { roleId?: string; changedBy?: string }) {
    return roleHistoryRepository.findAllByTenant(tenantId, filters);
  },
};
