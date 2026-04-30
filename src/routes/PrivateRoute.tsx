import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks';
import { Spinner } from '@design-system';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuth, isLoadingUser } = useAuth();
  const location = useLocation();

  if (isLoadingUser) return <Spinner fullPage />;
  if (!isAuth) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return <>{children}</>;
}
