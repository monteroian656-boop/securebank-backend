import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/role.repository', () => ({
  roleRepository: {
    findAllByTenant: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('../repositories/roleHistory.repository', () => ({
  roleHistoryRepository: { create: vi.fn() },
}));

import { roleService } from './role.service';
import { roleRepository } from '../repositories/role.repository';
import { roleHistoryRepository } from '../repositories/roleHistory.repository';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

const TENANT = 'tenant-1';

describe('roleService.create (HU-04)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rechaza nombre vacío o muy corto', async () => {
    await expect(roleService.create(TENANT, 'A', ['users:read'])).rejects.toThrow(ValidationError);
  });

  it('rechaza rol sin permisos seleccionados', async () => {
    await expect(roleService.create(TENANT, 'Auditor', [])).rejects.toThrow(ValidationError);
  });

  it('rechaza nombre duplicado dentro de la misma entidad', async () => {
    vi.mocked(roleRepository.findByName).mockResolvedValue({ id: 'role-x' } as any);

    await expect(roleService.create(TENANT, 'Auditor', ['audit:read'])).rejects.toThrow(ConflictError);
  });

  it('crea el rol cuando los datos son válidos', async () => {
    vi.mocked(roleRepository.findByName).mockResolvedValue(null);
    vi.mocked(roleRepository.create).mockResolvedValue({ id: 'role-new', name: 'Auditor' } as any);

    const result = await roleService.create(TENANT, '  Auditor  ', ['audit:read']);

    // El nombre debe guardarse ya sin espacios sobrantes.
    expect(roleRepository.create).toHaveBeenCalledWith(expect.any(String), 'Auditor', ['audit:read'], TENANT);
    expect(result).toEqual({ id: 'role-new', name: 'Auditor' });
  });
});

describe('roleService.update (HU-04 editar, HU-09, HU-15)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('HU-09: rechaza editar un rol de otra entidad', async () => {
    vi.mocked(roleRepository.findById).mockResolvedValue({
      id: 'role-1',
      tenantId: 'otro-tenant',
      permissions: ['users:read'],
    } as any);

    await expect(
      roleService.update(TENANT, 'role-1', 'user-1', 'Auditor', ['audit:read']),
    ).rejects.toThrow(NotFoundError);
  });

  it('rechaza rol inexistente', async () => {
    vi.mocked(roleRepository.findById).mockResolvedValue(null);

    await expect(
      roleService.update(TENANT, 'role-x', 'user-1', 'Auditor', ['audit:read']),
    ).rejects.toThrow(NotFoundError);
  });

  it('rechaza actualización sin permisos', async () => {
    vi.mocked(roleRepository.findById).mockResolvedValue({
      id: 'role-1',
      tenantId: TENANT,
      permissions: ['users:read'],
    } as any);

    await expect(
      roleService.update(TENANT, 'role-1', 'user-1', 'Auditor', []),
    ).rejects.toThrow(ValidationError);
  });

  it('HU-15: registra el historial con el estado previo y el nuevo al editar', async () => {
    vi.mocked(roleRepository.findById).mockResolvedValue({
      id: 'role-1',
      tenantId: TENANT,
      permissions: ['users:read'],
    } as any);
    vi.mocked(roleRepository.update).mockResolvedValue({
      id: 'role-1',
      name: 'Auditor Senior',
      permissions: ['users:read', 'audit:read'],
    } as any);

    await roleService.update(TENANT, 'role-1', 'user-changer', 'Auditor Senior', ['users:read', 'audit:read']);

    expect(roleHistoryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: 'role-1',
        changedBy: 'user-changer',
        previousState: 'users:read',
        newState: 'users:read, audit:read',
      }),
    );
  });
});
