import { utils, writeFile, read } from 'xlsx';

export interface SheetColumn<T> {
  /** Header ที่แสดงใน Excel/Sheet */
  label: string;
  /** key ของ object T */
  key: keyof T;
  /** optional — แปลงค่าก่อน export */
  format?: (value: T[keyof T], row: T) => string | number | boolean | null;
  /** optional — แปลงค่ากลับตอน import */
  parse?: (raw: string) => T[keyof T];
}

export interface UseSheetOptions<T> {
  columns: SheetColumn<T>[];
  sheetName?: string;
  fileName?: string;
}

export function useSheet<T extends object>(options: UseSheetOptions<T>) {
  const { columns, sheetName = 'Sheet1', fileName = 'export' } = options;

  /** Export array of T → .xlsx file */
  function exportToExcel(data: T[], customFileName?: string) {
    const rows = data.map((row) =>
      Object.fromEntries(
        columns.map((col) => {
          const raw = (row as Record<string, unknown>)[col.key as string];
          const value = col.format ? col.format(raw as T[keyof T], row) : raw;
          return [col.label, value ?? ''];
        }),
      ),
    );

    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, sheetName);
    writeFile(wb, `${customFileName ?? fileName}.xlsx`);
  }

  /** Export array of T → .csv file */
  function exportToCsv(data: T[], customFileName?: string) {
    const rows = data.map((row) =>
      Object.fromEntries(
        columns.map((col) => {
          const raw = (row as Record<string, unknown>)[col.key as string];
          const value = col.format ? col.format(raw as T[keyof T], row) : raw;
          return [col.label, value ?? ''];
        }),
      ),
    );

    const ws = utils.json_to_sheet(rows);
    const csv = utils.sheet_to_csv(ws);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Thai
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customFileName ?? fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import จากไฟล์ → array of T
   * พร้อม column mapping — user เลือกว่า header ใน file ตรงกับ key ไหนของ T
   */
  function parseFile(file: File): Promise<ImportResult<T>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const wb = read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rawRows = utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
          const fileHeaders = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
          resolve({ rawRows, fileHeaders });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Apply column mapping (fileHeader → column key) แล้วแปลงเป็น T[]
   * mapping: { [fileHeader]: keyof T }
   */
  function applyMapping(
    rawRows: Record<string, string>[],
    mapping: Partial<Record<string, keyof T>>,
  ): T[] {
    return rawRows.map((raw) => {
      const obj: Partial<T> = {};
      for (const [fileHeader, key] of Object.entries(mapping)) {
        if (!key) continue;
        const col = columns.find((c) => c.key === key);
        const raw_val = raw[fileHeader] ?? '';
        (obj as Record<string, unknown>)[key as string] = col?.parse
          ? col.parse(raw_val)
          : raw_val;
      }
      return obj as T;
    });
  }

  /** Download template .xlsx ที่มีแค่ header row */
  function downloadTemplate(customFileName?: string) {
    const ws = utils.json_to_sheet([Object.fromEntries(columns.map((c) => [c.label, '']))]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, sheetName);
    writeFile(wb, `${customFileName ?? fileName}_template.xlsx`);
  }

  return { exportToExcel, exportToCsv, parseFile, applyMapping, downloadTemplate, columns };
}

export interface ImportResult<T> {
  rawRows: Record<string, string>[];
  fileHeaders: string[];
  /** populated หลัง applyMapping */
  mapped?: T[];
}
