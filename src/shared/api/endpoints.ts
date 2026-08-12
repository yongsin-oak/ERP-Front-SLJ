/**
 * ทะเบียนเส้น API ทั้งหมด — แหล่งความจริงเดียวของ URL path ฝั่ง frontend
 *
 * กฎ:
 * - `services.ts` ของทุก feature ต้องอ้าง path จากที่นี่ ห้ามประกอบ string เอง
 * - path ต้องตรงกับ `@Controller({ path })` + route decorator ของ backend (E:\ERP-Back-SLJ)
 * - ที่นี่เก็บ "path" อย่างเดียว — request/response type อยู่กับ service ของแต่ละ feature
 *   (ถ้าย้าย type มารวมด้วย จะทำให้ import feature เดียวลาก type ทั้งระบบตามมา = bundle บวม)
 * - path ที่รับ parameter เขียนเป็นฟังก์ชัน เพื่อให้ TypeScript บังคับว่าต้องส่ง param ครบ
 */

const AUTH = '/auth';
const PRODUCT = '/product';
const STOCK_ENTRY = '/stock-entry';
const ORDER = '/order';

export const API = {
  /** การยืนยันตัวตน — backend: auth/auth.controller.ts */
  auth: {
    /** GET — public: รายชื่อ terminal ที่ isActive สำหรับ dropdown หน้า login (คืนแค่ code/name/role) */
    terminals: `${AUTH}/terminals`,
  },

  /** สินค้า — backend: modules/product/product.controller.ts */
  product: {
    /** GET (list) · POST (create) */
    root: PRODUCT,
    /** GET · PATCH · DELETE — key คือ barcode ไม่ใช่ id */
    byBarcode: (barcode: string) => `${PRODUCT}/${barcode}`,
    /** GET — คืนแค่ barcode + name ไม่ join brand/category (ใช้ตอนสแกนบันทึกออเดอร์) */
    byBarcodeRef: (barcode: string) => `${PRODUCT}/${barcode}/ref`,
    /** POST (bulkCreate) · PATCH (bulkUpdate) · DELETE (bulkDelete) */
    bulk: `${PRODUCT}/bulk`,
    /** GET — shape ย่อสำหรับ dropdown (barcode, name, remaining, sellPrice, costPrice) */
    dropdownSearch: `${PRODUCT}/dropdown-search`,
    /** POST — เช็คว่า barcode ไหนมี/ไม่มีในระบบ */
    checkExist: `${PRODUCT}/check-exist`,
    /** GET — ไฟล์ xlsx (responseType: 'blob') */
    export: `${PRODUCT}/export`,
    /** GET (list) · POST (create) — ราคาต่อร้านของสินค้า */
    shopPrices: (barcode: string) => `${PRODUCT}/${barcode}/shop-price`,
    /** PATCH · DELETE — ราคาต่อร้านรายตัว */
    shopPrice: (barcode: string, shopId: string) => `${PRODUCT}/${barcode}/shop-price/${shopId}`,
  },

  /** ความเคลื่อนไหวสต็อก — backend: modules/stock-entry/stock-entry.controller.ts */
  stockEntry: {
    /** GET (list) · POST (create) */
    root: STOCK_ENTRY,
    /** POST — รับเข้าหลายรายการในคำขอเดียว */
    bulk: `${STOCK_ENTRY}/bulk`,
    /** POST — ปรับสต็อกจากการนับจริงหลายรายการ */
    bulkAdjust: `${STOCK_ENTRY}/bulk-adjust`,
    /** GET — ไฟล์ xlsx (responseType: 'blob') */
    export: `${STOCK_ENTRY}/export`,
  },

  /** คำสั่งซื้อ — backend: modules/order/order.controller.ts */
  order: {
    /** GET (list) · POST (create) */
    root: ORDER,
    /** GET · PATCH · DELETE */
    byId: (id: string) => `${ORDER}/${id}`,
    /** DELETE — ลบหลายรายการในคำขอเดียว */
    bulk: `${ORDER}/bulk`,
    /** POST — เช็คว่า order id ไหนมี/ไม่มีในระบบ */
    checkExist: `${ORDER}/check-exist`,
    /** GET — ไฟล์ xlsx (responseType: 'blob') */
    export: `${ORDER}/export`,
  },
} as const;
