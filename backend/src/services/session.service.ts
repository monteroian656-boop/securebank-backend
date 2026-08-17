import { sessionRepository } from '../repositories/session.repository';
import { ForbiddenError, NotFoundError } from '../utils/errors';

export const sessionService = {
  // HU-16: listar sesiones activas del usuario.
  async listActive(userId: string) {
    return sessionRepository.findActiveByUser(userId);
  },

  async closeOne(sessionId: string, requestingUserId: string) {
    const session = await sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('Sesión no encontrada.');
    if (session.userId !== requestingUserId) {
      throw new ForbiddenError('No podés cerrar la sesión de otro usuario.');
    }
    await sessionRepository.revoke(sessionId, requestingUserId);
  },

  async closeAll(userId: string) {
    await sessionRepository.revokeAllForUser(userId);
  },
};
