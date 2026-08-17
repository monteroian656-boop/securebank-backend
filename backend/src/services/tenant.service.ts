import crypto from 'crypto';
import { tenantRepository } from '../repositories/tenant.repository';
import { ConflictError, ValidationError } from '../utils/errors';

export const tenantService = {
  async list() {
    return tenantRepository.findAll();
  },

  // HU-08: incorporar entidad sin afectar a las demás, rechaza nombre duplicado.
  async create(name: string) {
    if (!name || name.trim().length < 2) {
      throw new ValidationError('El nombre de la entidad es obligatorio.');
    }
    const existing = await tenantRepository.findByName(name.trim());
    if (existing) {
      throw new ConflictError('Ya existe una entidad registrada con ese nombre.');
    }
    return tenantRepository.create(crypto.randomUUID(), name.trim());
  },
};
