import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/tenant.repository', () => ({
  tenantRepository: {
    findAll: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
  },
}));

import { tenantService } from './tenant.service';
import { tenantRepository } from '../repositories/tenant.repository';
import { ConflictError, ValidationError } from '../utils/errors';

describe('tenantService.create (HU-08)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rechaza un nombre vacío', async () => {
    await expect(tenantService.create('')).rejects.toThrow(ValidationError);
  });

  it('rechaza un nombre de un solo caracter', async () => {
    await expect(tenantService.create('A')).rejects.toThrow(ValidationError);
  });

  it('rechaza una entidad con nombre duplicado', async () => {
    vi.mocked(tenantRepository.findByName).mockResolvedValue({ id: 'tenant-x', name: 'Banco Central' } as any);

    await expect(tenantService.create('Banco Central')).rejects.toThrow(ConflictError);
  });

  it('crea la entidad con el nombre recortado cuando no existe duplicado', async () => {
    vi.mocked(tenantRepository.findByName).mockResolvedValue(null);
    vi.mocked(tenantRepository.create).mockResolvedValue({ id: 'tenant-new', name: 'Banco Nuevo' } as any);

    const result = await tenantService.create('  Banco Nuevo  ');

    expect(tenantRepository.create).toHaveBeenCalledWith(expect.any(String), 'Banco Nuevo');
    expect(result).toEqual({ id: 'tenant-new', name: 'Banco Nuevo' });
  });
});

describe('tenantService.list', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delega en el repositorio para listar todas las entidades', async () => {
    vi.mocked(tenantRepository.findAll).mockResolvedValue([{ id: 't1' }, { id: 't2' }] as any);

    const result = await tenantService.list();

    expect(result).toHaveLength(2);
  });
});
