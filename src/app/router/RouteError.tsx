import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button } from '@design-system';
import { getErrorMessage, getErrorStatus } from '@shared';

export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  let status = getErrorStatus(error);
  let title = 'เกิดข้อผิดพลาด';
  let subtitle = getErrorMessage(error, 'มีบางอย่างผิดพลาด — กรุณาลองใหม่');

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (error.status === 404) {
      title = 'ไม่พบหน้านี้';
      subtitle = 'ลิงก์อาจถูกย้ายหรือลบไปแล้ว';
    }
  }

  if (status === 403) title = 'ไม่มีสิทธิ์เข้าถึง';
  if (status === 401) title = 'กรุณาเข้าสู่ระบบใหม่';

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="text-6xl font-bold text-foreground-subtle">{status || '!'}</div>
        <div className="text-lg font-semibold text-foreground">{title}</div>
        <div className="max-w-md text-sm text-muted-foreground">{subtitle}</div>
        <div className="mt-2 flex gap-2">
          <Button onClick={() => window.location.reload()}>โหลดใหม่</Button>
          <Button variant="primary" onClick={() => navigate('/')}>
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    </div>
  );
}
