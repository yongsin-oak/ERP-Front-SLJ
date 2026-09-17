import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { AppIcons } from '@/lib/icons';
import { btn } from '@/lib/styles';
import { canAccess, getRequiredRoles, getLandingPath, ROLE_LABEL } from '@config/access';

/**
 * กั้น route ตาม `ROUTE_ROLES` — อ่าน path ปัจจุบันเอง ไม่ต้องส่ง roles เข้ามา
 * ถูกพันไว้ใน `<Page>` ของ router แล้ว จึงครอบทุกหน้าอัตโนมัติ (ไม่มีทางลืม gate)
 */
export function RoleGuard({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (canAccess(user?.role, pathname)) return <>{children}</>;

  const allowed = getRequiredRoles(pathname).map((r) => ROLE_LABEL[r]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-error-bg text-error-text [&_svg]:size-8">
        <AppIcons.lock />
      </div>
      <div className="text-lg font-semibold text-foreground">ไม่มีสิทธิ์เข้าถึง</div>
      <div className="max-w-md text-sm text-muted-foreground">
        {allowed.length ?
          <>
            หน้านี้สำหรับ <span className="font-medium text-foreground">{allowed.join(' · ')}</span> เท่านั้น
            {user && <> — บัญชีของคุณคือ {ROLE_LABEL[user.role]}</>}
          </>
        : 'หน้านี้ยังไม่ได้เปิดสิทธิ์ให้บทบาทใด หากต้องการใช้งานกรุณาติดต่อผู้ดูแลระบบ'}
      </div>
      <button
        type="button"
        className={`${btn('primary')} mt-2`}
        onClick={() => navigate(getLandingPath(user), { replace: true })}
      >
        กลับหน้าหลัก
      </button>
    </div>
  );
}
