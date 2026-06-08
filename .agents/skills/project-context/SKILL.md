# Skill: Project Context — SLJ Supply Center ERP

> Load this skill at the start of every task. It defines who uses this system, how the business works, and what UX bar every screen must meet.

---

## Trigger

Load this skill when:
- Starting any new task in this repo
- Designing any new page, modal, or flow
- Making a decision about role access, screen complexity, or error messages

---

## 1. Business Overview

**Company:** SLJ Supply Center
**Business:** Buys packaging materials in bulk (multiple cartons from suppliers), sells retail.

**Sales channels — online-first (~90%):**
- **Shopee, Lazada, TikTok** — multiple shops per platform. Owner can add/remove shops.
- **LINE MAN** — retail listings
- **Offline** — walk-in retail

**Core daily operations:**
1. **Stock-in** — Purchasing receives bulk goods from suppliers. Records quantity per SKU.
2. **Order shooting** — Operators scan/process items in each customer order. System records `employeeId + terminalId` on every order transaction.
3. **Fulfillment** — Pickers pull items; Packers pack and dispatch.
4. **Stock-out tracking** — Sale, damage, return — all recorded with reason + employee.
5. **Revenue / P&L** — Daily revenue by shop/platform, COGS from purchasing price, profit margins.

---

## 2. Roles & Access

| Role | Slug | What they do | Screen complexity |
|---|---|---|---|
| SuperAdmin / Manager | `SuperAdmin` | Full access, owns all config | Dense — can handle complexity |
| Admin | `Admin` | Manages shops, responds to customers | Moderate |
| Operator | `Operator` | Shoots orders (scans items, processes daily orders) | **Simple — fast, minimal clicks** |
| Warehouse | `Warehouse` | Picks items, packs, receives stock-in | **Simple — large targets, one action at a time** |
| Purchasing | (role TBD) | Stock-in from suppliers, supplier management | Moderate |
| HR | `HR` | Employee management | Moderate |
| Accountant | `Accountant` | Revenue reports, P&L | Dense — data-heavy |
| Marketing / Sales | `Marketing`, `Sales` | Shop analytics | Read-only mostly |

**Design implication:** Operator and Warehouse staff may have minimal computer experience. Every screen they touch must pass the "non-tech user" bar: zero guessing, large touch targets, clear one-action-at-a-time flow.

---

## 3. Key Domain Entities

| Entity | Notes |
|---|---|
| **Product** | SKU, name, brand, category, purchase price, selling price, current stock, dimensions, weight |
| **Stock Entry** | Type: `in` / `adjust` / `return` — always records `employeeId`, `timestamp`, qty delta |
| **Order** | Platform, shop, items[], totalAmount, status, `operatorId` (who shot it), `terminalId` |
| **Order Item** | productId, qty, unitPrice, subtotal |
| **Shop** | Platform (Shopee/Lazada/TikTok/LineMan/Offline), name, isActive |
| **Supplier** | name, contact, address |
| **Employee** | name, department, position |
| **Terminal** | Device used for order shooting — terminalCode, isActive |
| **User** | System login account — linked to Employee, has Role |

---

## 4. Backend Error Contract

Backend returns errors in this shape (NestJS standard):

```ts
interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];  // human-readable, can be validation array
  error: string;               // HTTP error type
  timestamp: string;
  path: string;
}
```

**Rule:** Always surface `data.message` to the user. Use `getErrorMessage(err)` from `@lib` — it handles array join, network errors, and status fallbacks. Use `handleError('context')` as `onError` in every mutation.

```ts
// Every mutation must have:
onError: handleError('Create product'),   // "Create product failed — <backend message>"
onSuccess: () => message.success('Product created'),
```

---

## 5. UX Bar — Non-Negotiable for Every Screen

1. **Always three states**: loading skeleton / empty state with CTA / error with retry
2. **Feedback on every action**: `loading` prop on submit button, `message.success` on success, `handleError` on failure
3. **Confirm before destructive**: `DeleteConfirmButton` or `Modal.confirm` before any delete
4. **Specific error messages**: Surface backend `message` field — never show "An error occurred"
5. **Touch targets ≥ 44px** on Operator/Warehouse-facing screens
6. **Max 400ms interaction latency** — use optimistic updates or loading state
7. **One primary action per screen section** — never two blue buttons side by side

---

## 6. Platform Constants

```ts
// Already defined in shop feature — Platform enum:
type Platform = 'shopee' | 'lazada' | 'tiktok' | 'line_man' | 'offline' | 'line_oa'
```

---

## 7. Stock Entry Types

```ts
type StockEntryType = 'in' | 'adjust' | 'return'
// 'in'     → goods received from supplier
// 'adjust' → manual correction / stocktake reconciliation
// 'return' → customer return back into stock
```

---

## 8. Order Status Values

```ts
// Reference from order feature types — verify against backend before using
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'
```

---

## Quick Reference

```
Primary users of Operator/Warehouse screens → minimal computer experience → simple UI
Backend error shape → ApiErrorBody.message (string | string[])
Error utility → getErrorMessage(err), handleError('context') from @lib
All mutations → onError: handleError('Action name')
All pages → loading / empty (with CTA) / error state
All deletes → DeleteConfirmButton or Modal.confirm
```
