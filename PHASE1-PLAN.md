# Phase 1 — แผนปิดงาน (Implementation Plan)

> เป้าหมาย Phase 1: **migrate สินค้าจาก Google Sheet → นำไปบันทึกออเดอร์ → บันทึกออเดอร์รายวัน โดยระบุว่าใครบันทึก บนเครื่อง Terminal**
> โมเดลที่เลือก: **Terminal login + PIN (Actor)** — ดูรายละเอียด flow ที่ [`AUTH-FLOW.md`](AUTH-FLOW.md)
> ครอบคลุม 2 repo: `ERP-Front-SLJ` (FE) และ `ERP-Back-SLJ` (BE) — ปรับปรุง 2026-07-05

**สถานะ 4 เสาหลัก**

| เสา | ตอนนี้ | เหลืออะไร |
|---|---|---|
| 1. Migrate สินค้า | ✅ ใช้ได้ (barcode/ชื่อ/สต็อก/ราคา) | Workstream C (ถ้าต้องการ SKU/แบรนด์/หมวด + dedup) |
| 2. บันทึกออเดอร์ด้วยสินค้า | ✅ ใช้ได้ | Workstream B (carton, เลขออเดอร์) — polish |
| 3. ระบุว่าใครบันทึก | ⚠️ เลือกเองจาก dropdown | **Workstream A** (แกนหลัก) |
| 4. เข้าระบบด้วยบัญชี+Terminal | ⚠️ สร้างไว้ ยังไม่ต่อ | **Workstream A** (แกนหลัก) |

> **Workstream A คือหัวใจที่ทำให้ Phase 1 "ยังไม่เสร็จ"** — B และ C เป็น polish/ขยายผล ตัดสินใจได้ว่าจะรวมใน Phase 1 หรือดันไป Phase 1.1

---

## 🔑 Decisions — เคาะแล้ว ✅ (2026-07-05)

| # | คำถาม | ✅ เลือก |
|---|---|---|
| **D1** | อายุ actorToken / การกรอก PIN ซ้ำ | **สั้น 30 นาที + re-prompt PIN อัตโนมัติเมื่อหมดอายุ** (ตั้ง `ACTOR_TOKEN_EXPIRES_IN=30m`) |
| **D2** | Office user สร้างออเดอร์ได้ไหม | **เฉพาะ Terminal + PIN เท่านั้น** — user session สร้างออเดอร์ไม่ได้ |
| **D3** | Scope Phase 1 | **A + B + C ครบ** (รวม import SKU/แบรนด์/หมวด + dedup) |
| **D4** | `orderNumber` เป็น field จริงไหม | **(b) เพิ่มเป็น column จริงใน BE** (อยู่ใน scope B, ทำให้ครบ) |

---

## Workstream A — ผูก "ใครบันทึก + Terminal" เข้ากับออเดอร์ (แกนหลัก)

> ผลลัพธ์: เครื่อง Terminal ล็อกอิน → พนักงานกด PIN ยืนยันตัว → ทุกออเดอร์ถูกเซ็นด้วย employee + terminal จาก **server** (client ปลอมไม่ได้)

### 🔵 Backend (`ERP-Back-SLJ`)

- [ ] **A-BE1** ใส่ `ActorGuard` ให้ `POST /order`
  - `order.controller.ts:36` — เพิ่ม `ActorGuard` ต่อจาก `JwtAuthGuard, RolesGuard` (เฉพาะ `@Post()` create; หรือทั้ง controller ถ้าทุก write ต้องมี actor)
  - สร้าง param decorator `@Actor()` (อ่าน `req.actor`) แบบเดียวกับที่ controller อื่นอ่าน `req.user`
- [ ] **A-BE2** ให้ `recordBy` + `terminalId` มาจาก **actor ไม่ใช่ body**
  - `order.controller.ts` `createOrder` → ส่ง `req.actor` เข้า service
  - `order.service.ts:89-106` `create()` — เปลี่ยน `dto.recordBy` → `actor.employeeId`, `dto.terminalId` → `actor.terminalId` (server-authoritative)
- [ ] **A-BE3** ปรับ `create-order.dto.ts` — เอา `recordBy` (required) ออกจาก client contract (ให้เป็น server-derived) และเอา `terminalId` ออก · เหลือ `shopId`, `note`, `status?`, `details`
  - ⚠️ **Breaking change** ของ API — FE ต้องแก้คู่กัน (A-FE4)
- [ ] **A-BE4** *(ตาม D1)* ปรับ `ACTOR_TOKEN_EXPIRES_IN` ใน `.env` / `.env.example` (เช่น `30m`)
- [ ] **A-BE5** *(แนะนำ)* ให้ `POST /order` ตอบ 401 ที่ FE แยกออกได้ว่า "actor หมดอายุ" (ActorGuard โยน `UnauthorizedException` อยู่แล้ว — เช็คว่า message สื่อพอให้ FE เปิด PIN ใหม่)
- [ ] **A-BE6** *(ตรวจ)* `PATCH /order/:id` (แก้ออเดอร์) — จะบังคับ actor ด้วยไหม หรือให้ user session แก้ได้ (D2)

### 🟢 Frontend (`ERP-Front-SLJ`)

- [ ] **A-FE1** เพิ่ม **actor session store** (token + employee + expiresAt) — เก็บ actorToken หลัง PIN ผ่าน
  - ขยาย `useActorModal.ts` หรือสร้าง `useActor.ts` — เก็บ `{ actorToken, employee, expiresAt }`, มี `getValidToken()` / `clear()`
- [ ] **A-FE2** axios **request interceptor** แนบ header `X-Actor-Token`
  - `axiosInstance.ts:29-36` (ตอนนี้ว่าง) — ถ้ามี actorToken ที่ยังไม่หมดอายุ ใส่ `config.headers['X-Actor-Token']`
- [ ] **A-FE3** ต่อ `ActorModal` เข้า flow จริง — "พนักงานปัจจุบัน" บนหน้า Order
  - เรียก `useActorModal().request()` เพื่อเปิด PIN → เก็บผลลง store (A-FE1)
  - แสดง banner "กำลังบันทึกโดย: <ชื่อ> | เปลี่ยนคน" บน `OrderEntryPage`
- [ ] **A-FE4** `OrderEntryPage.tsx:96-114` — เลิกส่ง `recordBy`/`terminalId` ใน payload; ลบ dropdown "พนักงานผู้บันทึก" (`:142-154`) แทนด้วย actor identity
  - payload เหลือ `{ shopId, details, note }` (ตาม A-BE3)
  - อัปเดต type `CreateOrderDto` ใน `order/types/index.ts:58-67`
- [ ] **A-FE5** จัดการ **actor หมดอายุ** — เมื่อ `POST /order` ได้ 401 (actor) → เปิด PIN modal, ให้ยืนยันใหม่, แล้ว retry บันทึก (อย่าเด้ง /login)
  - ⚠️ ต้องแยกจาก 401 ปกติ (session หมด) ใน `axiosInstance` response interceptor
- [ ] **A-FE6** *(bug fix แถม)* `config/env.ts:4` — `VITE_BYPASS_AUTH === true` เทียบ string กับ boolean = false เสมอ → แก้เป็น `=== 'true'` ให้ dev bypass ทำงานตรงกับ BE
- [ ] **A-FE7** LoginPage — ตรวจว่า flow "ล็อกอิน Terminal → เข้าหน้า Order → PIN" ลื่นไหลสำหรับผู้ใช้ non-tech (ปุ่มใหญ่, ขั้นตอนเดียว)

---

## Workstream B — ความครบของการบันทึกออเดอร์ (polish)

- [ ] **B1** *(ตาม D?)* ช่องกรอกจำนวน **ลัง (carton)** ใน `OrderItemsEditor` — ตอนนี้ hardcode `quantityCarton: 0` (`OrderEntryPage.tsx:106`). BE รองรับ pack+carton อยู่แล้ว (`order.service.ts:108-126`) · หรือจงใจล็อกไว้แค่แพ็คแล้วลบ hardcode ทิ้ง
- [ ] **B2** *(ตาม D4)* `orderNumber` เป็น field จริง
  - ถ้าเลือก D4(b): BE เพิ่ม column `orderNumber` ใน `Order` entity + DTO + filter; FE ส่งตรงแทนยัดใน `note` (`OrderEntryPage.tsx:99,108` + `OrderHistoryPage.tsx:170-181`)
- [ ] **B3** *(Phase 2?)* ส่ง `costPrice` ไปเก็บด้วย (ตอนนี้ทิ้ง `OrderItemsEditor.tsx:59`) — จำเป็นตอนทำ P&L; ประเมินว่าอยู่ Phase ไหน

---

## Workstream C — Migrate สินค้าให้ครบ/ทนทาน (ตาม D3)

- [ ] **C1** เพิ่มคอลัมน์ import: `sku` (BE `CreateProductDto` รองรับอยู่แล้ว) — เพิ่มใน `ProductImportModal.tsx:6-17` (`DB_FIELDS`)
- [ ] **C2** import **แบรนด์/หมวดหมู่จากชื่อ** (ชีตเก็บชื่อ, DB ต้องการ id)
  - ต้องมี name→id resolution: BE endpoint `find-or-create` แบรนด์/หมวด, หรือ FE resolve ก่อน bulk-create
  - ⚠️ งานจริง — ประเมินก่อนรับเข้า Phase 1
- [ ] **C3** **dedup/upsert ตาม barcode** — ตอนนี้ `POST /product/bulk` เป็น create ล้วน (import ซ้ำ = ชน)
  - ใช้ `POST /product/check-exist` (`services.ts:54-57`, มีแล้วแต่ไม่ถูกเรียก) แสดง preview "ใหม่ X / ซ้ำ Y" ก่อน import · หรือ BE ทำ upsert
- [ ] **C4** รายงาน **error รายแถว / partial success** จาก `/product/bulk` (ให้ BE ตอบ `{created, errors[]}` แบบ bulkDelete) แทน error ก้อนเดียว
- [ ] **C5** เก็บกวาด feature flag `sheetImport:false` "Phase 2" (`featureFlags.config.ts`) — ปัจจุบันประกาศไว้แต่ไม่ถูกใช้ (ฟีเจอร์เปิดจริง) → ลบ flag หรือบังคับใช้ให้ตรง

---

## ลำดับการทำ (แนะนำ)

1. **เคาะ D1–D4** (โดยเฉพาะ D1, D2 ที่ล็อกดีไซน์ Workstream A)
2. **Workstream A backend** (A-BE1→A-BE3) — เปิด contract ใหม่
3. **Workstream A frontend** (A-FE1→A-FE5) — ต่อ PIN + interceptor + แก้ payload
4. ทดสอบ end-to-end (ดู Test plan)
5. Workstream B (ถ้าอยู่ scope) → Workstream C (ตาม D3)

## Test plan (E2E ของ Workstream A)

- ล็อกอิน Terminal (`terminalCode`+`password`) → เข้า `/order`
- ยังไม่กด PIN → กดบันทึกออเดอร์ต้อง**ถูกบล็อก** + เปิด PIN
- กด PIN ถูก → ยิงสินค้า → บันทึก → ตรวจใน `/order/history` ว่า `recordBy` = พนักงานที่ยืนยัน + `terminal` = เครื่องที่ล็อกอิน
- ปล่อยจน actorToken หมดอายุ → บันทึกอีก → ต้อง re-prompt PIN แล้วบันทึกต่อได้ (ไม่เด้ง /login)
- ลอง PIN ผิด → error ชัดเจน (backend คืน "รหัส PIN ไม่ถูกต้อง")
- ⚠️ ระวังตอนเทสต์: **BE `.env` ตอนนี้ `BYPASS_AUTH=true`** (ActorGuard/JwtAuthGuard ปล่อยผ่านด้วย actor ปลอม `dev-bypass`) — ต้องตั้ง `BYPASS_AUTH=false` เพื่อเทสต์ flow จริง และ **FE ต้องแก้ A-FE6** ให้ bypass ตรงกัน

## หมายเหตุความเสี่ยง

- **A-BE3 เป็น breaking change** ของ `POST /order` — ต้อง deploy FE+BE พร้อมกัน หรือทำ backward-compatible (รับทั้ง actor และ body ชั่วคราว)
- actorToken ใน `ActorGuard` ตรวจลายเซ็นเอง (HMAC manual, `actor.guard.ts:43-58`) ไม่ผ่าน `JwtService.verify` — ระวังเรื่อง `exp` และ base64url ตอนแก้
- Terminal ไม่มี refreshToken → token เครื่อง 24h/cookie 10h หมดแล้วต้องล็อกอินเครื่องใหม่ (ยอมรับได้สำหรับเครื่องประจำที่)
