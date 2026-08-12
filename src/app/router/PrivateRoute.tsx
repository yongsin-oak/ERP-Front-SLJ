import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Spinner } from '@design-system';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  // selector ทีละค่า — `useAuth()` เปล่าๆ subscribe ทั้ง store แล้ว re-render ทุกครั้งที่ field ใดก็ตามเปลี่ยน
  // (และ `(s) => ({ a, b })` ก็ใช้ไม่ได้ ต้องสร้าง object ใหม่ทุกรอบ ต้องพึ่ง useShallow)
  const isAuth = useAuth((s) => s.isAuth);
  const isLoadingUser = useAuth((s) => s.isLoadingUser);
  const location = useLocation();

  if (isLoadingUser) return <Spinner fullPage />;
  if (!isAuth) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return <>{children}</>;
}
