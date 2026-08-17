import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/securityPolicy.repository', () => ({
  securityPolicyRepository: {
    findByTenant: vi.fn(),
    upsert: vi.fn(),
  },
}));

import { securityPolicyService } from './securityPolicy.service';
import { securityPolicyRepository } from '../repositories/securityPolicy.repository';
import { ValidationError } from '../utils/errors';

const TENANT = 'tenant-1';

describe('securityPolicyService.get (HU-01, HU-19)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve valores por defecto cuando la entidad nunca configuró una política', async () => {
    vi.mocked(securityPolicyRepository.findByTenant).mockResolvedValue(null);

    const policy = await securityPolicyService.get(TENANT);

    expect(policy).toEqual({
      tenantId: TENANT,
      minLength: 10,
      expirationDays: 90,
      requireComplexity: true,
      inactivityDays: 60,
      lockoutMinutes: 15,
    });
  });

  it('devuelve la política guardada cuando existe', async () => {
    const stored = { tenantId: TENANT, minLength: 12, expirationDays: 60, requireComplexity: true, inactivityDays: 45, lockoutMinutes: 30 };
    vi.mocked(securityPolicyRepository.findByTenant).mockResolvedValue(stored as any);

    const policy = await securityPolicyService.get(TENANT);

    expect(policy).toEqual(stored);
  });
});

describe('securityPolicyService.update (HU-01, HU-11, HU-19)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('HU-01: rechaza una longitud mínima de contraseña menor a 8 (estándar NIST SP800-63B)', async () => {
    await expect(securityPolicyService.update(TENANT, { minLength: 6 })).rejects.toThrow(ValidationError);
  });

  it('acepta una longitud mínima igual a 8', async () => {
    vi.mocked(securityPolicyRepository.upsert).mockResolvedValue({} as any);

    await expect(securityPolicyService.update(TENANT, { minLength: 8 })).resolves.toBeDefined();
  });

  it('rechaza un tiempo de bloqueo fuera del rango 1-120 minutos', async () => {
    await expect(securityPolicyService.update(TENANT, { lockoutMinutes: 0 })).rejects.toThrow(ValidationError);
    await expect(securityPolicyService.update(TENANT, { lockoutMinutes: 121 })).rejects.toThrow(ValidationError);
  });

  it('HU-11: rechaza días de inactividad menores o iguales a 0', async () => {
    await expect(securityPolicyService.update(TENANT, { inactivityDays: 0 })).rejects.toThrow(ValidationError);
  });

  it('rechaza días de expiración menores o iguales a 0', async () => {
    await expect(securityPolicyService.update(TENANT, { expirationDays: -5 })).rejects.toThrow(ValidationError);
  });

  it('guarda el patch cuando todos los valores son válidos', async () => {
    vi.mocked(securityPolicyRepository.upsert).mockResolvedValue({ tenantId: TENANT, minLength: 12 } as any);

    const result = await securityPolicyService.update(TENANT, { minLength: 12, lockoutMinutes: 20 });

    expect(securityPolicyRepository.upsert).toHaveBeenCalledWith(TENANT, { minLength: 12, lockoutMinutes: 20 });
    expect(result).toEqual({ tenantId: TENANT, minLength: 12 });
  });
});
