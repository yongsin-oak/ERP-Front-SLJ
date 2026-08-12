export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * Response shape ของ `/<entity>/dropdown-search` — **แยกจาก `Paginated<T>` โดยตั้งใจ**
 *
 * dropdown ถูกใช้แบบเลื่อนไปเรื่อยๆ จนหมด ไม่มีการกระโดดไปหน้า 7 และไม่เคยโชว์
 * "1–20 จาก 340" ดังนั้น `page`/`total`/`totalPages` ไม่มีใครอ่าน แถม `total` ยัง
 * แลกมาด้วย `COUNT(*)` ทุกครั้งที่พิมพ์ — cursor ตัดทิ้งทั้งหมดนั้น
 *
 * ที่สำคัญกว่าคือความถูกต้อง: offset นับจากหัวลิสต์ ถ้ามีคนเพิ่ม/ลบข้อมูลระหว่างที่
 * ผู้ใช้เลื่อนอยู่ ขอบเขตหน้าจะเลื่อนตาม → แถวถูกข้ามหรือโผล่ซ้ำ ส่วน cursor คีย์บน
 * `(name, id)` ของแถวสุดท้าย จึงกลับมาต่อจุดเดิมได้เสมอ
 *
 * `nextCursor` เป็นค่าทึบ (base64) — ห้าม decode หรือคาดเดารูปแบบฝั่ง client
 * แค่ส่งกลับไปเป็น `cursor` ของหน้าถัดไป · `null` = หมดลิสต์แล้ว
 *
 * ตารางยังใช้ `Paginated<T>` ตามเดิม — เส้นหนึ่งเส้นให้แค่รูปแบบเดียว ไม่ผสม
 */
export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}

/** Query params ของทุกเส้น dropdown — คู่กับ `CursorPage<T>` */
export interface DropdownParams {
  search?: string;
  /** `nextCursor` จากหน้าก่อน — ไม่ส่ง = หน้าแรก */
  cursor?: string;
  limit?: number;
}

/**
 * แถวมาตรฐานของ dropdown (ตรงกับ `DropdownItemDto` ฝั่ง backend)
 * ใช้ร่วมกันใน brand / category / supplier — feature ที่ option ต้องการฟิลด์เพิ่ม
 * (shop มี platform, employee แยกชื่อ 3 ส่วน) ประกาศ type ของตัวเองใน
 * `features/<feature>/types/index.ts` ไม่ต้องมาขยายตัวนี้
 */
export interface DropdownOption {
  id: string;
  name: string;
}

export interface ApiData<T> {
  data: T;
}

/**
 * Base for all paginated list query params.
 * Feature-specific params interfaces should extend this.
 *
 * interface ProductParams extends PageParams { search?: string; brandId?: string }
 */
export interface PageParams {
  page: number;
  limit: number;
}

/**
 * Derives an update DTO from a create DTO:
 * makes all fields optional and strips immutable keys K.
 *
 * type UpdateProductDto = UpdateDto<CreateProductDto, 'barcode'>
 * type UpdateBrandDto   = UpdateDto<CreateBrandDto>           // K defaults to never
 */
export type UpdateDto<T, K extends keyof T = never> = Partial<Omit<T, K>>;
