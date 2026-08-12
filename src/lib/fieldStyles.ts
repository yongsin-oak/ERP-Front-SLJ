/**
 * สูตรเส้นขอบ control — จุดเดียวที่นิยาม "ทุก state ของ field" ในระบบ
 *
 * ทำไมต้องรวมไว้ที่เดียว: input / textarea / select / datepicker / number อยู่คนละไฟล์
 * แต่ต้องมี rest → hover → focus → open → invalid → disabled เหมือนกันเป๊ะ
 * ก่อนหน้านี้แต่ละตัวเขียนเอง เลยหลุดคนละชุด (บางตัวไม่มี focus, บางตัว hover ไม่เห็นผล)
 *
 * ลำดับ state ที่ตั้งใจ:
 *   rest      border-control    (เข้มกว่าขอบแผงหนึ่งขั้น ให้ field อ่านออกว่าเป็นช่องกรอก)
 *   hover     border-stronger
 *   focus     border-stronger + outline เทาจาก :focus-visible global ใน index.css
 *   open      border-stronger   (trigger ที่เปิด popover/dropdown อยู่)
 *   invalid   destructive — และต้องชนะ hover/focus จึงต้องเขียน compound variant กำกับ
 *             (`aria-invalid:hover:` มี specificity สูงกว่า `hover:` ไม่ต้องพึ่งลำดับใน bundle)
 *   disabled  ขอบจางลงเป็น border ปกติ + พื้น disabled
 */

/** ใช้กับ element ที่รับโฟกัสเอง — `<input>` `<textarea>` `<button>` ที่เป็น trigger */
export const FIELD_BORDER = [
  'border border-border-control transition-colors duration-(--duration-fast)',
  'hover:border-border-stronger',
  'focus-visible:border-border-stronger',
  'data-[state=open]:border-border-stronger',
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg disabled:text-disabled',
  'aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:outline-destructive',
].join(' ');

/**
 * ใช้กับ `<div>` ที่ห่อ `<input>` ไว้ข้างใน (โฟกัสเกิดที่ลูก ไม่ใช่ที่กล่อง)
 * กล่องต้องมี `data-disabled` เมื่อ disabled เพราะ `<div>` ไม่มี `:disabled`
 */
export const FIELD_BORDER_WITHIN = [
  'border border-border-control transition-colors duration-(--duration-fast)',
  'hover:border-border-stronger',
  'focus-within:border-border-stronger',
  'aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-within:border-destructive aria-invalid:focus-within:outline-destructive',
  'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:border-border data-disabled:bg-disabled-bg data-disabled:text-disabled',
].join(' ');

/** status="warning" ของ DS field — เตือนแต่ยังกรอกต่อได้ (ไม่ใช่ invalid) */
export const FIELD_BORDER_WARNING =
  'border-warning hover:border-warning focus-within:border-warning focus-visible:border-warning';
