import crypto from 'crypto';
import { auditRepository } from '../repositories/audit.repository';

export const auditService = {
  // HU-06: registro con filtros; HU-10 reusa esto filtrando result='failure' en el controller.
  async list(tenantId: string, filters: { userId?: string; from?: string; to?: string }) {
    return auditRepository.findByTenant(tenantId, filters);
  },

  // HU-07 / HU-20: exporta y firma con un hash (sha256) del contenido exportado para que se pueda
  // verificar la integridad de los archivos
  async exportSigned(tenantId: string, filters: { from?: string; to?: string }) {
    const entries = await auditRepository.findByTenant(tenantId, filters);
    const payload = JSON.stringify(entries);
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    return { entries, hash: `sha256:${hash}` };
  },
};
