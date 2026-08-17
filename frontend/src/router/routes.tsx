import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Login } from '@/pages/auth/Login';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { PasswordPolicy } from '@/pages/security/PasswordPolicy';
import { FailedLoginAlerts } from '@/pages/security/FailedLoginAlerts';
import { InactivityPolicy } from '@/pages/security/InactivityPolicy';
import { TenantSecurityParams } from '@/pages/security/TenantSecurityParams';
import { RolesList } from '@/pages/roles/RolesList';
import { AssignRoles } from '@/pages/roles/AssignRoles';
import { AuditLog } from '@/pages/audit/AuditLog';
import { AuditReports } from '@/pages/audit/AuditReports';
import { RoleChangeHistory } from '@/pages/audit/RoleChangeHistory';
import { TenantOnboarding } from '@/pages/tenants/TenantOnboarding';
import { SlaMonitoring } from '@/pages/dashboard/SlaMonitoring';
import { MySessions } from '@/pages/sessions/MySessions';
import { NotificationSettings } from '@/pages/notifications/NotificationSettings';
import { NotFound } from '@/pages/misc/NotFound';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/reset-password', element: <ResetPassword /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard/sla" replace /> },
          { path: 'dashboard/sla', element: <SlaMonitoring /> },
          { path: 'audit/log', element: <AuditLog /> },
          { path: 'audit/reports', element: <AuditReports /> },
          { path: 'audit/role-history', element: <RoleChangeHistory /> },
          { path: 'sessions', element: <MySessions /> },
          { path: 'notifications', element: <NotificationSettings /> },

          {
            element: <ProtectedRoute requiredPermission="roles:write" />,
            children: [
              { path: 'security/password-policy', element: <PasswordPolicy /> },
              { path: 'security/alerts', element: <FailedLoginAlerts /> },
              { path: 'security/inactivity', element: <InactivityPolicy /> },
              { path: 'security/tenant-params', element: <TenantSecurityParams /> },
              { path: 'roles', element: <RolesList /> },
            ],
          },
          {
            element: <ProtectedRoute requiredPermission="users:write" />,
            children: [
              { path: 'roles/assign', element: <AssignRoles /> },
              { path: 'tenants/new', element: <TenantOnboarding /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
