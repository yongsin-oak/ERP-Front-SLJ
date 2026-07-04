import { useAuth } from '@features/auth';
import { Button } from '@design-system';
import type { Role } from '@features/auth/types';
import { useNavigate } from 'react-router-dom';

interface RoleGuardProps {
  roles: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <div className="text-6xl font-bold text-foreground-subtle">403</div>
        <div className="text-lg font-semibold text-foreground">ไม่มีสิทธิ์เข้าถึง</div>
        <div className="text-sm text-muted-foreground">
          หน้านี้สำหรับบทบาท: {roles.join(', ')} เท่านั้น
        </div>
        <Button variant="primary" className="mt-2" onClick={() => navigate('/dashboard')}>
          กลับหน้าหลัก
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
