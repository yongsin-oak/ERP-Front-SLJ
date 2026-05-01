import { Result } from 'antd';
import { useAuth } from '@features/auth/hooks';
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
      <Result
        status="403"
        title="ไม่มีสิทธิ์เข้าถึง"
        subTitle={`หน้านี้สำหรับบทบาท: ${roles.join(', ')} เท่านั้น`}
        extra={<Button variant="primary" onClick={() => navigate('/dashboard')}>กลับหน้าหลัก</Button>}
      />
    );
  }

  return <>{children}</>;
}
