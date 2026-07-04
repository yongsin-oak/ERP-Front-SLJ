import type { ReactNode } from 'react';
import { Spinner } from '../Spinner';
import { Empty } from '../Empty';
import { Button } from '../Button';
import { AppIcons } from '../../icons';

export interface PageShellProps {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  /** แสดงปุ่ม "ลองใหม่" ในสถานะ error — ต่อกับ refetch ของ query */
  onRetry?: () => void;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  isLoading,
  isError,
  isEmpty,
  errorMessage = 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่',
  onRetry,
  emptyDescription,
  emptyAction,
  children,
}: PageShellProps) {
  if (isLoading) return <Spinner fullPage />;
  if (isError) {
    return (
      <Empty description={errorMessage}>
        {onRetry && (
          <Button variant="secondary" icon={<AppIcons.refresh />} onClick={onRetry}>
            ลองใหม่
          </Button>
        )}
      </Empty>
    );
  }
  if (isEmpty) return <Empty description={emptyDescription}>{emptyAction}</Empty>;
  return <>{children}</>;
}
