import { ReactNode } from 'react';
import { useGetCallerUserRole } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Loader2 } from 'lucide-react';

interface RequireRoleProps {
  role: 'admin' | 'user';
  children: ReactNode;
}

export default function RequireRole({ role, children }: RequireRoleProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userRole, isLoading } = useGetCallerUserRole();

  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!identity) {
    return <AccessDeniedScreen requiredRole={role} />;
  }

  const hasPermission = role === 'admin' ? userRole === 'admin' : userRole === 'admin' || userRole === 'user';

  if (!hasPermission) {
    return <AccessDeniedScreen requiredRole={role} />;
  }

  return <>{children}</>;
}
