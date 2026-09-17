/** ผลการอ่านไฟล์ Excel/CSV หนึ่งไฟล์ — ใช้ร่วมกันทั้ง 3 ขั้นของการนำเข้า */
export interface SheetData {
  fileName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

/** ช่องข้อมูลฝั่งเราที่คอลัมน์ในไฟล์จะถูกจับคู่เข้าไป */
export interface DbFieldDef {
  key: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean';
}

/** คอลัมน์ในไฟล์ → ช่องข้อมูลฝั่งเรา (null = ไม่นำเข้าคอลัมน์นี้) */
export interface ColumnMapping {
  sheetColumn: string;
  dbField: string | null;
}
