import { ApiClientError } from './client';

// Traduce cualquier error a un mensaje para mostrar en <ErrorState />
export function toUserMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    return err.message;
  }
  if (err instanceof TypeError) {
    return 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.';
  }
  return 'Ocurrió un error inesperado.';
}
