/**
 * ตัวจัดรูปแบบค่าที่แสดงในตาราง — เป็น "ฟังก์ชันคืน string" ไม่ใช่ component
 *
 * ทำไมไม่เป็น component: หน้าเพจประกอบ markup เองทั้งหมดแล้ว สิ่งที่ต้องใช้ร่วมกันจริงๆ
 * เหลือแค่ "กฎการจัดรูปแบบ" (วันที่ผิด format คนละแบบในแต่ละหน้า = อ่านข้ามหน้าไม่ได้)
 * ส่วนหน้าตาให้ใช้ CELL_NUM / CELL_CODE จาก styles.ts ครอบเอง
 */

import dayjs from 'dayjs';

/** ค่าที่ไม่มี — ใช้ตัวเดียวกันทั้งระบบ ช่องว่างทำให้แถวดูเหมือนโหลดไม่เสร็จ */
export const EMPTY_VALUE = '—';

export const DATE_FORMAT = {
  dateTime: 'DD/MM/YYYY HH:mm',
  date: 'DD/MM/YYYY',
  time: 'HH:mm',
  monthYear: 'MM/YYYY',
} as const;

/** วันที่ในตาราง — คืน '—' เมื่อไม่มีค่าหรือ parse ไม่ได้ ไม่ปล่อย "Invalid Date" ออกจอ */
export function formatDate(
  value?: string | null,
  format: string = DATE_FORMAT.dateTime,
): string {
  if (!value) return EMPTY_VALUE;
  const d = dayjs(value);
  return d.isValid() ? d.format(format) : EMPTY_VALUE;
}

/** จำนวนเงิน — ทศนิยม 2 ตำแหน่งเสมอ ให้หลักตรงกันทุกแถว */
export function formatMoney(
  value?: number | null,
  decimals = 2,
  prefix = '฿',
): string {
  if (value == null) return EMPTY_VALUE;
  return `${prefix}${value.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** จำนวนนับ — ไม่มีทศนิยม มีตัวคั่นหลักพัน */
export function formatNumber(value?: number | null): string {
  if (value == null) return EMPTY_VALUE;
  return value.toLocaleString('th-TH');
}

/** จำนวนสินค้า + หน่วย */
export function formatQuantity(value?: number | null, unit?: string): string {
  if (value == null) return EMPTY_VALUE;
  return unit ? `${value.toLocaleString('th-TH')} ${unit}` : value.toLocaleString('th-TH');
}

/**
 * สีของจำนวนคงเหลือ — เตือนด้วยสีก่อนที่ของจะหมด
 * คืน class ไม่ใช่ hex เพื่อให้ dark mode สลับตามโทเคน
 */
export function quantityTone(
  value: number,
  lowThreshold = 10,
  criticalThreshold = 3,
): string {
  if (value <= criticalThreshold) return 'text-error-text font-medium';
  if (value <= lowThreshold) return 'text-warning-text font-medium';
  return 'text-success-text';
}
