import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { AppIcons } from '@/lib/icons';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  // selector ทีละค่า — `useAuth()` เปล่าๆ subscribe ทั้ง store แล้ว re-render ทุกครั้งที่ field ใดก็ตามเปลี่ยน
  // (และ `(s) => ({ a, b })` ก็ใช้ไม่ได้ ต้องสร้าง object ใหม่ทุกรอบ ต้องพึ่ง useShallow)
  const isAuth = useAuth((s) => s.isAuth);
  const isLoadingUser = useAuth((s) => s.isLoadingUser);
  const location = useLocation();

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="กำลังโหลด">
        <span className="flex size-11 items-center justify-center rounded-full border border-border bg-surface-100">
          <AppIcons.loading spin className="size-4 text-primary" />
        </span>
      </div>
    );
  }
  if (!isAuth) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return <>{children}</>;
}
