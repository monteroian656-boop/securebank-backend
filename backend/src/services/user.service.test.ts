import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/user.repository', () => ({
  userRepository: {
    findAllByTenant: vi.fn(),
    updateRole: vi.fn(),
    revoke: vi.fn(),
    findInactiveSince: vi.fn(),
  },
}));
vi.mock('../repositories/role.repository', () => ({
  roleRepository: { findById: vi.fn() },
}));
vi.mock('../repositories/securityPolicy.repository', () => ({
  securityPolicyRepository: { findByTenant: vi.fn() },
}));
vi.mock('../repositories/session.repository', () => ({
  sessionRepository: { revokeAllForUser: vi.fn() },
}));

import { userService } from './user.service';
import { userRepository } from '../repositories/user.repository';
import { roleRepository } from '../repositories/role.repository';
import { securityPolicyRepository } from '../repositories/securityPolicy.repository';
import { sessionRepository } from '../repositories/session.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

const TENANT = 'tenant-1';

describe('userService.assignRole (HU-05)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rechaza si el rol no existe', async () => {
    vi.mocked(roleRepository.findById).mockResolvedValue(null);

    await expect(userService.assignRole(TENANT, 'user-1', 'role-x')).rejects.toThrow(ValidationError);
  });

  it('rechaza si el rol pertenece a otra entidad (aislamiento multi-tenant)', async () => {
    vi.mocked(roleRepository.findById).mockResolvedValue({ id: 'role-1', tenantId: 'otro-tenant' } as any);

    await expect(userService.assignRole(TENANT, 'user-1', 'role-1')).rejects.toThrow(ValidationError);
  });

  it('rechaza si el usuario no existe en la entidad', async () => {
    vi.mocked(roleRepository.findById).mockResolvedValue({ id: 'role-1', tenantId: TENANT } as any);
    vi.mocked(userRepository.updateRole).mockResolvedValue(null as any);

    await expect(userService.assignRole(TENANT, 'user-x', 'role-1')).rejects.toThrow(NotFoundError);
  });

  it('asigna el rol cuando el rol y el usuario pertenecen a la entidad', async () => {
    vi.mocked(roleRepository.findById).mockResolvedValue({ id: 'role-1', tenantId: TENANT } as any);
    vi.mocked(userRepository.updateRole).mockResolvedValue({ id: 'user-1', roleId: 'role-1' } as any);

    const result = await userService.assignRole(TENANT, 'user-1', 'role-1');

    expect(userRepository.updateRole).toHaveBeenCalledWith('user-1', TENANT, 'role-1');
    expect(result).toEqual({ id: 'user-1', roleId: 'role-1' });
  });
});

describe('userService.revoke (HU-05)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rechaza si el usuario no existe en la entidad', async () => {
    vi.mocked(userRepository.revoke).mockResolvedValue(null as any);

    await expect(userService.revoke(TENANT, 'user-x')).rejects.toThrow(NotFoundError);
  });

  it('revoca todas las sesiones activas del usuario al revocar su acceso (defecto corregido)', async () => {
    vi.mocked(userRepository.revoke).mockResolvedValue({ id: 'user-1', isActive: false } as any);

    await userService.revoke(TENANT, 'user-1');

    // Este es el bug real que se encontró y corrigió: revocar el acceso
    // debía cerrar también la sesión activa del usuario, no solo marcar
    // isActive=false en la base.
    expect(sessionRepository.revokeAllForUser).toHaveBeenCalledWith('user-1');
  });
});

describe('userService.wouldDeactivateCount (HU-11)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('usa el umbral de inactividad configurado en la política de la entidad', async () => {
    vi.mocked(securityPolicyRepository.findByTenant).mockResolvedValue({ inactivityDays: 30 } as any);
    vi.mocked(userRepository.findInactiveSince).mockResolvedValue([{}, {}] as any);

    const count = await userService.wouldDeactivateCount(TENANT);

    expect(count).toBe(2);
    const cutoffArg = vi.mocked(userRepository.findInactiveSince).mock.calls[0][1] as Date;
    const daysDiff = Math.round((Date.now() - cutoffArg.getTime()) / (24 * 60 * 60 * 1000));
    expect(daysDiff).toBe(30);
  });

  it('usa 60 días por defecto cuando la entidad no configuró una política', async () => {
    vi.mocked(securityPolicyRepository.findByTenant).mockResolvedValue(null);
    vi.mocked(userRepository.findInactiveSince).mockResolvedValue([]);

    await userService.wouldDeactivateCount(TENANT);

    const cutoffArg = vi.mocked(userRepository.findInactiveSince).mock.calls[0][1] as Date;
    const daysDiff = Math.round((Date.now() - cutoffArg.getTime()) / (24 * 60 * 60 * 1000));
    expect(daysDiff).toBe(60);
  });
});
