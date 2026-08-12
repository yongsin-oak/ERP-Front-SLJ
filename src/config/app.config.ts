import { IS_DEV } from './env';

export const APP_CONFIG = {
  name: 'SLJ Supply Center',
  shortName: 'SLJ ERP',
  tagline: 'Management System',
  version: '1.0.0',
  isDev: IS_DEV,
  /**
   * โลโก้อยู่ใน `public/` จึงเสิร์ฟที่ root โดยตรง ไม่ผ่าน bundler
   * ไฟล์เป็น WebP ทึบ (พื้นขาวติดมาในภาพ ไม่มี alpha) — ที่ไหนที่เอาไปวางต้องครอบ
   * เป็นไทล์มีขอบ ไม่งั้นบน dark mode จะกลายเป็นสี่เหลี่ยมขาวลอย
   */
  logoSrc: '/slj-supply-logo.webp',
} as const;
