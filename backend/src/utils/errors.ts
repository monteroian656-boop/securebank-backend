// Error de negocio con código, mensaje y status HTTP, para que el
// middleware de errores lo traduzca directo al envelope (HU-01, HU-08)
export class AppError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, 'VALIDATION_ERROR', message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Credenciales inválidas') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tenés permiso para esta acción') {
    super(403, 'FORBIDDEN', message);
  }
}

export class LockedError extends AppError {
  constructor(message: string) {
    super(423, 'ACCOUNT_LOCKED', message);
  }
}
