import { Result } from 'antd';
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

  const resultStatus = status === 404 || status === 403 || status === 500 ? status : 'error';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Result
        status={resultStatus as 'error' | 404 | 403 | 500}
        title={title}
        subTitle={subtitle}
        extra={
          <>
            <Button onClick={() => window.location.reload()}>โหลดใหม่</Button>
            <Button variant="primary" onClick={() => navigate('/')}>กลับหน้าหลัก</Button>
          </>
        }
      />
    </div>
  );
}
