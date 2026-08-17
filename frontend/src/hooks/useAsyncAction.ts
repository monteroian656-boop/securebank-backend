import { useState } from 'react';
import { toUserMessage } from '@/api/errorMessage';
import { useToast } from '@/context/ToastContext';
import { SilentValidationError } from '@/utils/errors';

// Estandariza el patrón de guardar usado por todos los formularios
// (HU-01, HU-04, HU-08, HU-11, HU-19)

export function useAsyncAction<Args extends unknown[]>(
  action: (...args: Args) => Promise<void>,
  successMessage: string,
) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (...args: Args) => {
    setLoading(true);
    setError(null);
    try {
      await action(...args);
      showToast(successMessage, 'success');
    } catch (err) {
      if (err instanceof SilentValidationError) {
        // El formulario ya muestra su propio mensaje de validación
      } else {
        const message = toUserMessage(err);
        setError(message);
        showToast(message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return { run, loading, error };
}
