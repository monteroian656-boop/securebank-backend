import crypto from 'crypto';
import { roleRepository } from '../repositories/role.repository';
import { roleHistoryRepository } from '../repositories/roleHistory.repository';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

export const roleService = {
  async list(tenantId: string) {
    return roleRepository.findAllByTenant(tenantId);
  },

  // HU-04: crear rol con permisos específicos.
  async create(tenantId: string, name: string, permissions: string[]) {
    if (!name || name.trim().length < 2) {
      throw new ValidationError('El nombre del rol debe tener al menos 2 caracteres.');
    }
    if (!permissions || permissions.length === 0) {
      throw new ValidationError('Seleccioná al menos un permiso.');
    }
    const existing = await roleRepository.findByName(tenantId, name.trim());
    if (existing) {
      throw new ConflictError('Ya existe un rol con ese nombre en esta entidad.');
    }
    return roleRepository.create(crypto.randomUUID(), name.trim(), permissions, tenantId);
  },

  // HU-04 + HU-15: cada edición deja un registro de auditoría
  // HU-09: solo se puede editar un rol de la propia entidad a la vez.
  async update(tenantId: string, id: string, changedBy: string, name: string, permissions: string[]) {
    const existing = await roleRepository.findById(id);
    if (!existing || existing.tenantId !== tenantId) {
      throw new NotFoundError('Rol no encontrado en tu entidad.');
    }
    if (!name || name.trim().length < 2) {
      throw new ValidationError('El nombre del rol debe tener al menos 2 caracteres.');
    }
    if (!permissions || permissions.length === 0) {
      throw new ValidationError('Seleccioná al menos un permiso.');
    }

    const updated = await roleRepository.update(id, name.trim(), permissions);

    await roleHistoryRepository.create({
      id: crypto.randomUUID(),
      roleId: id,
      changedBy,
      previousState: existing.permissions.join(', '),
      newState: permissions.join(', '),
    });

    return updated;
  },
};
