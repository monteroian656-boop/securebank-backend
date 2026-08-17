import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/session.repository', () => ({
  sessionRepository: {
    findActiveByUser: vi.fn(),
    findById: vi.fn(),
    revoke: vi.fn(),
    revokeAllForUser: vi.fn(),
  },
}));

import { sessionService } from './session.service';
import { sessionRepository } from '../repositories/session.repository';
import { ForbiddenError, NotFoundError } from '../utils/errors';

describe('sessionService.listActive (HU-16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delega en el repositorio para listar las sesiones activas del usuario', async () => {
    vi.mocked(sessionRepository.findActiveByUser).mockResolvedValue([{ id: 's1' }] as any);

    const result = await sessionService.listActive('user-1');

    expect(sessionRepository.findActiveByUser).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([{ id: 's1' }]);
  });
});

describe('sessionService.closeOne (HU-16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rechaza si la sesión no existe', async () => {
    vi.mocked(sessionRepository.findById).mockResolvedValue(null);

    await expect(sessionService.closeOne('session-x', 'user-1')).rejects.toThrow(NotFoundError);
  });

  it('rechaza cerrar la sesión de otro usuario', async () => {
    vi.mocked(sessionRepository.findById).mockResolvedValue({ id: 'session-1', userId: 'otro-usuario' } as any);

    await expect(sessionService.closeOne('session-1', 'user-1')).rejects.toThrow(ForbiddenError);
  });

  it('cierra la sesión cuando pertenece al usuario que la solicita', async () => {
    vi.mocked(sessionRepository.findById).mockResolvedValue({ id: 'session-1', userId: 'user-1' } as any);

    await sessionService.closeOne('session-1', 'user-1');

    expect(sessionRepository.revoke).toHaveBeenCalledWith('session-1', 'user-1');
  });
});

describe('sessionService.closeAll (HU-16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delega en el repositorio para cerrar todas las sesiones del usuario', async () => {
    await sessionService.closeAll('user-1');

    expect(sessionRepository.revokeAllForUser).toHaveBeenCalledWith('user-1');
  });
});
