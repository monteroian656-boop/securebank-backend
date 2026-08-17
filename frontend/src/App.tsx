import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { router } from '@/router/routes';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
