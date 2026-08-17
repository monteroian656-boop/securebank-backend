import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';
import { sessionRepository } from '../repositories/session.repository';

export interface AuthContext {
  userId: string;
  tenantId: string;
  roleId: string;
  sessionId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

// Valida el JWT Y que la sesión siga activa en la base
export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Falta el token de autenticación');
  }

  const token = header.slice('Bearer '.length);
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch {
    throw new UnauthorizedError('Token inválido o expirado');
  }

  const sessionId = payload.jti as string;
  const session = sessionId ? await sessionRepository.findById(sessionId) : null;
  if (!session || session.revokedAt) {
    throw new UnauthorizedError('La sesión fue cerrada. Iniciá sesión de nuevo.');
  }

  req.auth = {
    userId: payload.userId,
    tenantId: payload.tenantId,
    roleId: payload.roleId,
    sessionId,
  };
  next();
}
