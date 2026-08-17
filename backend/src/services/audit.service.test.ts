import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

vi.mock('../repositories/audit.repository', () => ({
  auditRepository: { findByTenant: vi.fn() },
}));

import { auditService } from './audit.service';
import { auditRepository } from '../repositories/audit.repository';

const TENANT = 'tenant-1';

describe('auditService.list (HU-06)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pasa los filtros de fecha y usuario al repositorio', async () => {
    vi.mocked(auditRepository.findByTenant).mockResolvedValue([] as any);

    await auditService.list(TENANT, { userId: 'user-1', from: '2026-01-01', to: '2026-01-31' });

    expect(auditRepository.findByTenant).toHaveBeenCalledWith(TENANT, {
      userId: 'user-1',
      from: '2026-01-01',
      to: '2026-01-31',
    });
  });
});

describe('auditService.exportSigned (HU-07, HU-20)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('firma la exportación con un hash sha256 que corresponde exactamente al contenido exportado', async () => {
    const entries = [{ id: 'log-1', action: 'LOGIN' }, { id: 'log-2', action: 'ROLE_UPDATE' }];
    vi.mocked(auditRepository.findByTenant).mockResolvedValue(entries as any);

    const result = await auditService.exportSigned(TENANT, {});

    const expectedHash = crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex');
    expect(result.hash).toBe(`sha256:${expectedHash}`);
    expect(result.entries).toEqual(entries);
  });

  it('genera un hash distinto si el contenido exportado cambia (garantiza integridad)', async () => {
    vi.mocked(auditRepository.findByTenant).mockResolvedValueOnce([{ id: 'log-1' }] as any);
    const first = await auditService.exportSigned(TENANT, {});

    vi.mocked(auditRepository.findByTenant).mockResolvedValueOnce([{ id: 'log-1' }, { id: 'log-2' }] as any);
    const second = await auditService.exportSigned(TENANT, {});

    expect(first.hash).not.toBe(second.hash);
  });
});
