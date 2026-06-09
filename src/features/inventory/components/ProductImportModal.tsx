import { SheetImportModal } from '@design-system';
import type { DbFieldDef } from '@design-system';
import { useBulkCreateProducts } from '../react-query';
import type { CreateProductDto } from '../types';

const DB_FIELDS: DbFieldDef[] = [
  { key: 'barcode',         label: 'บาร์โค้ด',      required: true, type: 'text' },
  { key: 'name',            label: 'ชื่อสินค้า',     required: true, type: 'text' },
  { key: 'remaining',       label: 'สต็อก',          required: true, type: 'number' },
  { key: 'costPricePack',   label: 'ราคาทุน/แพ็ค',  type: 'number' },
  { key: 'costPriceCarton', label: 'ราคาทุน/ลัง',   type: 'number' },
  { key: 'sellPricePack',   label: 'ราคาขาย/แพ็ค', type: 'number' },
  { key: 'sellPriceCarton', label: 'ราคาขาย/ลัง',  type: 'number' },
  { key: 'minStock',        label: 'สต็อกขั้นต่ำ',  type: 'number' },
  { key: 'piecesPerPack',   label: 'ชิ้น/แพ็ค',    type: 'number' },
  { key: 'packPerCarton',   label: 'แพ็ค/ลัง',     type: 'number' },
];

function validateRow(row: Record<string, unknown>): string[] {
  const errs: string[] = [];
  if (!row['barcode'] || String(row['barcode']).trim() === '') {
    errs.push('บาร์โค้ดห้ามว่าง');
  }
  if (!row['name'] || String(row['name']).trim() === '') {
    errs.push('ชื่อสินค้าห้ามว่าง');
  }
  if (row['remaining'] === undefined || row['remaining'] === null || row['remaining'] === '') {
    errs.push('สต็อกห้ามว่าง');
  } else {
    const rem = Number(row['remaining']);
    if (!Number.isFinite(rem) || rem < 0) {
      errs.push('สต็อกต้องเป็นตัวเลข ≥ 0');
    }
  }
  return errs;
}

function transformRow(row: Record<string, unknown>): CreateProductDto {
  const toNum = (v: unknown): number | undefined => {
    if (v === undefined || v === null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const toInt = (v: unknown): number | undefined => {
    const n = toNum(v);
    return n !== undefined ? Math.round(n) : undefined;
  };

  const costPack = toNum(row['costPricePack']);
  const costCarton = toNum(row['costPriceCarton']);
  const sellPack = toNum(row['sellPricePack']);
  const sellCarton = toNum(row['sellPriceCarton']);

  return {
    barcode: String(row['barcode'] ?? '').trim(),
    name: String(row['name'] ?? '').trim(),
    remaining: toInt(row['remaining']) ?? 0,
    ...(costPack != null || costCarton != null
      ? { costPrice: { pack: costPack ?? costCarton ?? 0, carton: costCarton ?? costPack ?? 0 } }
      : {}),
    ...(sellPack != null || sellCarton != null
      ? { sellPrice: { pack: sellPack ?? sellCarton ?? 0, carton: sellCarton ?? sellPack ?? 0 } }
      : {}),
    ...(toInt(row['minStock']) !== undefined ? { minStock: toInt(row['minStock'])! } : {}),
    ...(toInt(row['piecesPerPack']) !== undefined ? { piecesPerPack: toInt(row['piecesPerPack'])! } : {}),
    ...(toInt(row['packPerCarton']) !== undefined ? { packPerCarton: toInt(row['packPerCarton'])! } : {}),
  };
}

interface ProductImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProductImportModal({ open, onClose }: ProductImportModalProps) {
  const bulkCreate = useBulkCreateProducts();

  return (
    <SheetImportModal<CreateProductDto>
      open={open}
      onClose={onClose}
      title="นำเข้าสินค้าจาก Excel / CSV"
      dbFields={DB_FIELDS}
      validateRow={validateRow}
      transformRow={transformRow}
      onImport={(rows) => bulkCreate.mutateAsync(rows)}
      loading={bulkCreate.isPending}
    />
  );
}
