import * as React from 'react';
import { Alert, type AlertType } from '../Alert';
import { Button } from '../Button';
import { AppIcons } from '../../icons';
import { cn } from '@/lib/utils';

/**
 * Banner — สถานะที่ "ยังมีผลอยู่บนหน้า" (ไม่หายเอง) เช่น โหมดออฟไลน์, draft ค้าง,
 * subscription ใกล้หมด. ต่างจาก Toast (แจ้งผลชั่วคราวแล้วหาย) และ Dialog (บังคับตัดสินใจ).
 *
 * เป็น wrapper บาง ๆ ของ Alert: เปิดไอคอนเป็น default + ปุ่มปิด (X) เมื่อ closable.
 * ถ้าต้องการให้ "จำว่าผู้ใช้ปิดไปแล้ว" ใช้ useLocalStorage flag ฝั่งผู้เรียก (ดู skill ux-persistence).
 */
export interface BannerProps {
  type?: AlertType;
  /** ข้อความหลัก */
  message?: React.ReactNode;
  /** alias ของ message (antd compat) */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** ปุ่ม action เช่น อัปเกรด / ล้างและเริ่มใหม่ */
  action?: React.ReactNode;
  showIcon?: boolean;
  /** แสดงปุ่มปิด (X) — จับคู่กับ onClose */
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Banner({
  type = 'info',
  message,
  title,
  description,
  action,
  showIcon = true,
  closable = false,
  onClose,
  className,
}: BannerProps) {
  const trailing =
    action != null || closable ? (
      <div className="flex items-center gap-1">
        {action}
        {closable && (
          <Button
            variant="ghost"
            size="small"
            aria-label="ปิด"
            icon={<AppIcons.close />}
            onClick={onClose}
          />
        )}
      </div>
    ) : undefined;

  return (
    <Alert
      type={type}
      message={message}
      title={title}
      description={description}
      showIcon={showIcon}
      action={trailing}
      className={cn('rounded-none border-x-0 border-r-0 px-4 py-3 shadow-none', className)}
    />
  );
}
