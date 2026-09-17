import { AppIcons } from '@/lib/icons';
import { EMPTY_TEXT, EMPTY_WRAP, PAGE_HEADER, PAGE_SUBTITLE, PAGE_TITLE } from '@/lib/styles';

export function RolePage() {
  return (
    <div>
      <div className={`${PAGE_HEADER} mb-4`}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>บทบาทผู้ใช้</h1>
          <p className={PAGE_SUBTITLE}>Coming soon</p>
        </div>
      </div>

      <div className={EMPTY_WRAP}>
        <AppIcons.roles className="size-8 text-foreground-subtle" />
        <p className={EMPTY_TEXT}>อยู่ระหว่างพัฒนา</p>
      </div>
    </div>
  );
}
