import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/roleHistory.repository', () => ({
  roleHistoryRepository: { findAllByTenant: vi.fn() },
}));

import { roleHistoryService } from './roleHistory.service';
import { roleHistoryRepository } from '../repositories/roleHistory.repository';

const TENANT = 'tenant-1';

describe('roleHistoryService.list (HU-15, consulta)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta el historial siempre acotado a la entidad del solicitante', async () => {
    vi.mocked(roleHistoryRepository.findAllByTenant).mockResolvedValue([] as any);

    await roleHistoryService.list(TENANT, {});

    expect(roleHistoryRepository.findAllByTenant).toHaveBeenCalledWith(TENANT, {});
  });

  it('pasa el filtro por rol y por quién hizo el cambio', async () => {
    vi.mocked(roleHistoryRepository.findAllByTenant).mockResolvedValue([] as any);

    await roleHistoryService.list(TENANT, { roleId: 'role-1', changedBy: 'user-1' });

    expect(roleHistoryRepository.findAllByTenant).toHaveBeenCalledWith(TENANT, {
      roleId: 'role-1',
      changedBy: 'user-1',
    });
  });
});
