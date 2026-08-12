# Skill: Design System — Components

> All `@design-system` wrapper components and ERP composite patterns (Tailwind v4 + Radix — no antd).
> Back to parent: [design-system](../SKILL.md) · [icons](../icons/SKILL.md) · **which feedback component for which purpose → [feedback](../feedback/SKILL.md)**
> ทุก component มี story: `bun run storybook` → หมวด "Design System"

---

## Trigger

Use this skill when picking a UI component or implementing a page/table/modal/form pattern.

## Atlassian reference contract

- ตรวจ component/pattern ที่เกี่ยวข้องใน [Atlassian components](https://atlassian.design/components) ก่อนตัดสินใจเรื่อง hierarchy, state, content และ accessibility
- ใช้หลัก composability จาก [layout primitives](https://atlassian.design/foundations/spacing/primitives/) และเลือก feedback ตามระดับการขัดจังหวะ
- อ้างเฉพาะ behavior/guidance; implement ด้วย Tailwind CSS + Radix + component ที่มีใน `@design-system` เท่านั้น ห้าม Emotion, `css` prop, `styled()` และ `@atlaskit/*`

---

## Catalog

| กลุ่ม | Components |
| --- | --- |
| Layout | `Stack` `Inline` `Grid` `Divider` `Card` |
| Form controls | `Input` `InputPassword` `InputSearch` `Textarea` `InputNumber` `Select` `Checkbox` `Radio` `Switch` `Segmented` `DatePicker` `DateRangePicker` `DateRangePresets` |
| Form system | `Form` (`Form.useForm`/`Form.Item` บน RHF) `FormModal` `Field` `TextField` `TextareaField` |
| Smart inputs | `PriceInput` `QuantityInput` `QuantityStepper` `ScanInput` `InlineEdit` `SearchableSelect` `InfiniteSearchSelect` |
| Table | `Table` (+`Table.Summary`) `DateCell` `MoneyCell` `CodeCell` `QuantityCell` `ActionCell` `ActionMenu` `BulkSelectionBar` |
| Overlay | `Modal` `Drawer` `ConfirmDrawer` `DeleteConfirmButton` `Tooltip` `FormModal` |
| Feedback | `Alert` `Banner` `Tag`/`StatusTag` `Badge` `Spinner` `Empty` `notify.*` (Sonner: `success`/`error`/`warning`/`loading`/`action`/`undo`/`retry`) — [decision guide](../feedback/SKILL.md) |
| Page | `PageShell` `PageHeader` `FilterBar` `StatsCard` `SummaryCard` `Tabs` `Typography` (`Text`/`Title`/`PageTitle`) |
| Sheet import | `DropZoneSheet` `SheetColumnMapper` `SheetTable` `SheetImportModal` |

---

## Core components

### Button

```tsx
// variant: 'primary' | 'secondary' | 'danger' | 'danger-ghost' | 'ghost' | 'link'
<Button variant="primary" onClick={handleSave}>บันทึก</Button>
<Button variant="ghost" icon={<AppIcons.edit />} aria-label="แก้ไข" />  // icon-only ต้องมี aria-label
<Button variant="primary" loading={mutation.isPending}>บันทึก</Button>
```

### Table

```tsx
const columns: ColumnType<Order>[] = [
  { title: 'รหัส', dataIndex: 'sku', searchable: true },          // เพิ่ม search dropdown ในหัวคอลัมน์
  { title: 'สถานะ', dataIndex: 'status', filters: [...], onFilter },
  { title: 'ราคา', dataIndex: 'price', sorter: (a, b) => a.price - b.price, align: 'right' },
];

// >100 แถวโดยไม่แบ่งหน้า → ต้อง virtual + scroll.y (virtualize จริงด้วย react-virtual)
<Table dataSource={rows} columns={columns} rowKey="id" virtual scroll={{ y: 480 }} pagination={false} />
```

#### สูตรคอลัมน์ — ตารางที่ไม่เสียทรง

อ้างอิงแนวปฏิบัติ data table ระดับ enterprise ([Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables) ·
[UX Design World](https://uxdworld.com/data-table-design-best-practices/)) แล้ว map เข้ากับ `Table` ตัวนี้:

| กติกา | ทำยังไงกับ `Table` |
| --- | --- |
| **ข้อความชิดซ้าย · ตัวเลขเชิงปริมาณชิดขวา + mono** | `align: 'right'` + `font-mono tabular-nums` (จำนวน/เงิน) — วันที่/รหัสถือเป็นตัวเลขเชิงคุณภาพ ชิดซ้ายได้ |
| **หนึ่งบรรทัดต่อช่อง** | ห้ามยัด 2 บรรทัดในช่องเดียว แถวสูงไม่เท่ากันแล้วกวาดสายตาไม่ได้ · ข้อมูลรองไปอยู่ใน `expandedRowRender` |
| **คอลัมน์ยืดได้แค่คอลัมน์เดียว** | คอลัมน์นั้นใส่ `ellipsis: true` **ไม่ต้องใส่ `width`** ที่เหลือกำหนด `width` คงที่ทุกตัว |
| **ตัดคำแล้วต้อง hover อ่านเต็มได้** | `ellipsis: true` + ให้ `render` คืน **string ล้วน** → `Table` ใส่ `title` ให้เอง |
| **หัวคอลัมน์บอกหน่วยแล้ว ในช่องไม่ต้องซ้ำ** | หัวว่า "รายการ" → ในช่องใส่แค่ `12` ไม่ใช่ `12 รายการ` |

> **`ellipsis` ไม่ใช่แค่จุดไข่ปลา — มันคือตัวบังคับ `width` ให้มีผลจริง**
> `width` ที่ `<th>` เป็นแค่ข้อเสนอแนะใน `table-layout: auto` เนื้อหายาวๆ ดันคอลัมน์บานได้
> ตัวที่บังคับจริงคือ `max-w-0 truncate` ที่ `ellipsis` ใส่ให้ `<td>`
> **คอลัมน์ที่ตั้ง `width` แล้วเนื้อหาอาจยาวเกิน ต้องใส่ `ellipsis: true` เสมอ**

ข้อยกเว้น: **คอลัมน์แรกของตารางที่มี `expandable` ห้ามใส่ `ellipsis`** — ปุ่มขยายแถวถูก render
อยู่ในช่องนั้น `truncate` จะกินปุ่มได้ ให้เลือกคอลัมน์แรกเป็นอะไรที่ความยาวคงที่แทน (เวลา/รหัส)

เนื้อหาใน `render` ของคอลัมน์ที่ `ellipsis` ต้องเป็น **inline** (`<span>`, fragment ของ span)
ถ้าเป็น `flex`/`block` จะหลุดจาก `truncate` ของ `<td>`

`scroll={{ x }}` ตั้งให้ ≈ ผลรวม `width` ทุกคอลัมน์ ไม่ใช่ตั้งเผื่อ — ตั้งเกินจะบังคับให้เลื่อน
แนวนอนทั้งที่จอกว้างพอ · ความสูงแถว: `size="small"` 33px · `middle` 41px (ดีฟอลต์) · `large` 49px

- `rowSelection={{ selectedRowKeys, onChange, preserveSelectedRowKeys: true }}` — `preserveSelectedRowKeys` ทำงานจริง: cache record ที่เคยเลือกไว้ให้ bulk action ข้ามหน้า
- client-side pagination clamp หน้าให้เองเมื่อ filter แล้วจำนวนหน้าลด
- `virtual` ใช้ไม่ได้ร่วมกับ `expandable` — จะ fallback เป็น render ปกติ
- `expandable` มี 2 โหมด: **panel** `expandedRowRender: (record) => ReactNode` (แสดงเนื้อหาเต็มความกว้างใต้แถว) หรือ **tree** ผ่าน `childrenColumnName`; คุม expandable รายแถวด้วย `rowExpandable: (record) => boolean`
- `render(value, record, index)` — index เป็น index ในหน้าปัจจุบัน (ตรงกับ antd)

### Modal

```tsx
<Modal title="แก้ไขออเดอร์" open={open} onCancel={onClose} onOk={handleSave} confirmLoading={m.isPending}>
```

- `onOk` คืน `Promise` ได้ → ปุ่มตกลง loading + กันกดซ้ำ + **บล็อค Escape/คลิกนอก/ปุ่ม X ระหว่างรอ**
- `maskClosable={false}` กันปิดด้วยคลิกนอก
- `destroyOnHidden`/`destroyOnClose` = deprecated no-op (Radix unmount ตอนปิดเสมอ)

### Form + FormModal

```tsx
const [form] = Form.useForm<ProductFormValues>();

useEffect(() => { if (open && item) form.setFieldsValue(item); }, [open, item, form]);

<FormModal open={open} onClose={onClose} title="เพิ่มสินค้า" form={form}
  onFinish={(v) => mutation.mutateAsync(v)} loading={mutation.isPending}>
  <Form.Item name="name" label="ชื่อสินค้า" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</FormModal>
```

FormModal จัดการ: footer มาตรฐาน, `validateFields()` ก่อน submit, `resetFields()` ตอนปิด, แยก validation error (เงียบ — RHF โชว์ใต้ field) จาก runtime error (log ใน dev)

### Field / TextField (inline form pattern — ใช้เมื่อไม่ต้องการ Form.Item)

```tsx
<TextField label="ชื่อสินค้า" hint="ตามที่ลูกค้าเห็น" error={errors.name?.message} required {...register('name')} />
```

---

## ERP Composite Components

### DeleteConfirmButton — ทุกการลบต้อง confirm

```tsx
<DeleteConfirmButton onConfirm={() => del.mutateAsync(id)} />
// onConfirm คืน Promise ได้ → ปุ่มลบ loading + popover ปิดเมื่อ settle + กันกดซ้ำ
<DeleteConfirmButton onConfirm={handleDelete} title="ลบสินค้า?" description="สต็อกจะหายด้วย">
  <Button variant="danger">ลบ</Button>
</DeleteConfirmButton>
```

### ActionCell — เมนู kebab ท้ายแถว table

action ท้ายแถวเป็น **ปุ่มสามจุดปุ่มเดียว** ไม่ใช่ปุ่มเรียงกัน — ประหยัดความกว้าง และไม่วางปุ่มลบ
ไว้ปลายนิ้วทุกแถว ลำดับในเมนูคงที่เสมอ: `actions` → แก้ไข → *(เส้นคั่น)* → **ลบ (แดง ท้ายสุด)**

```tsx
{ title: '', key: 'actions', fixed: 'right', width: 56, align: 'center',
  render: (_: unknown, record: Product) => (
    <ActionCell onEdit={() => openEdit(record)} onDelete={() => del.mutate(record.id)} isDeleting={del.isPending} />
  ) }
```

เพิ่ม action อื่นผ่าน `actions` — ตัวที่ `danger: true` ถูกดันไปท้ายให้เอง ไม่ต้องจัดลำดับเอง:

```tsx
<ActionCell
  actions={[
    { key: 'view', label: 'ดูรายละเอียด', icon: <AppIcons.view />, onSelect: () => open(record) },
    { key: 'void', label: 'ยกเลิกบิล', icon: <AppIcons.close />, danger: true,
      onSelect: () => voidOrder.mutateAsync(record.id),
      confirm: { title: 'ยกเลิกบิลนี้?', description: 'สต็อกจะถูกคืนอัตโนมัติ' } },
  ]}
  onEdit={() => openEdit(record)}
  onDelete={() => del.mutate(record.id)}
/>
```

### ActionMenu — kebab menu นอกตาราง

ตัวเดียวกับที่ `ActionCell` ใช้ภายใน เรียกตรงได้เมื่อต้องการเมนู action ที่มุมการ์ด/หัวหน้า:

```tsx
<ActionMenu size="middle" label="ตัวเลือกใบสั่งซื้อ" items={[...]} />
```

- `confirm` บน item ใดเปิดโมดัลยืนยันให้เอง (`danger` → ปุ่มยืนยันเป็นสีแดง) — **action ที่ย้อนกลับไม่ได้ต้องใส่ `confirm` เสมอ**
- `onSelect` คืน Promise ได้ → โมดัลขึ้น loading จนกว่าจะ settle
- `DeleteConfirmButton` ยังใช้ต่อสำหรับปุ่มลบเดี่ยวๆ ที่ไม่ได้อยู่ในเมนู (เช่นใน `BulkSelectionBar`)

### BulkSelectionBar

```tsx
{selectedKeys.length > 0 && (
  <BulkSelectionBar count={selectedKeys.length} onDelete={handleBulkDelete}
    onClear={() => setSelectedKeys([])} isDeleting={bulk.isPending} itemLabel="สินค้า" />
)}
```

### PageShell — ทุกหน้า list ต้องครบ loading / empty / error

```tsx
<PageShell isLoading={isLoading} isError={isError} errorMessage={getErrorMessage(error)}
  onRetry={refetch} isEmpty={!data?.length} emptyDescription="ยังไม่มีสินค้า"
  emptyAction={<Button variant="primary" onClick={onAdd}>เพิ่มสินค้าแรก</Button>}>
  <Table … />
</PageShell>
```

### PageHeader

```tsx
<PageHeader title="คลังสินค้า" subtitle="จัดการสต็อกทุกสาขา"
  actions={<Button variant="primary" icon={<AppIcons.add />}>เพิ่มสินค้า</Button>} />
```

### FilterBar — แถบกรองเหนือตาราง (debounce ให้เอง 300ms สำหรับ search)

```tsx
<FilterBar
  items={[
    { key: 'q', label: 'ค้นหา', type: 'search' },
    { key: 'status', label: 'สถานะ', type: 'select', options: STATUS_OPTIONS },
    { key: 'range', label: 'ช่วงวันที่', type: 'daterange' },
  ]}
  values={filters} onChange={setFilters} />
```

### Table Cell Helpers

```tsx
{ title: 'รหัส', dataIndex: 'sku', render: (v: string) => <CodeCell>{v}</CodeCell> },
{ title: 'ราคา', dataIndex: 'price', render: (v: number) => <MoneyCell value={v} /> },
{ title: 'สต็อก', dataIndex: 'stock', render: (v: number) => <QuantityCell value={v} lowThreshold={10} criticalThreshold={3} /> },
{ title: 'อัปเดต', dataIndex: 'updatedAt', render: (v: string) => <DateCell value={v} /> },
// null → "—" ทุกตัว · DateCell กัน invalid date → "—" · QuantityCell ไล่สี เขียว→ส้ม→แดง
```

### StatsCard / SummaryCard

```tsx
// StatsCard — การ์ดสถิติมี delta/icon (dashboard)
<StatsCard label="ยอดขายวันนี้" value={sales} prefix="฿" delta={12.5} deltaLabel="จากเมื่อวาน" icon={<AppIcons.report />} />

// SummaryCard — แถบสรุปเหนือ filter บนหน้า list
<Inline gap={3}>
  <SummaryCard title="ทั้งหมด" value={total} suffix="รายการ" style={{ flex: 1 }} />
  <SummaryCard title="มูลค่ารับเข้า" value={income} prefix="฿" formatter={(v) => Number(v).toLocaleString()} style={{ flex: 1 }} />
</Inline>
```

### ScanInput — ช่องยิงบาร์โค้ด (Operator/Warehouse)

```tsx
<ScanInput onScan={async (code) => { await addItem(code); }} loading={m.isPending} />
// Enter = ยิง · เคลียร์ค่า + คืนโฟกัสเองเสมอ (แม้ onScan throw หรือเพิ่งหาย disabled/loading)
```

### QuantityStepper — ช่องจำนวนพร้อมปุ่ม − / +

```tsx
<QuantityStepper size="large" label="จำนวนแพ็ค" value={qty} onChange={setQty} />
// พิมพ์เองก็ได้ กดปุ่มก็ได้ · −/+ ถูก disable อัตโนมัติเมื่อถึง min (default 0) / max
// size="large" = control 38px; ถ้าเป็นจอสัมผัสให้เพิ่ม hit area ด้วย wrapper/min-h-11 โดยไม่เปลี่ยน control contract
// label ใช้ประกอบ aria-label ของปุ่ม ("เพิ่มจำนวนแพ็ค") — ใส่เสมอเมื่ออยู่ในตาราง
```

เลือกตัวไหน:

| ต้องการ | ใช้ |
| --- | --- |
| จำนวนที่ปรับทีละ 1 บ่อยๆ ด้วยนิ้ว | `QuantityStepper` |
| จำนวน + หน่วย (ชิ้น/กล่อง/แพ็ค) | `QuantityInput` |
| ตัวเลขทั่วไป (ราคา, ค่า config) | `InputNumber` |

### ConfirmDrawer — flow 2 ขั้น (กรอก → ยืนยัน) สำหรับงานเสี่ยง

```tsx
<ConfirmDrawer open={open} onClose={close} title="ปรับสต็อก" formContent={<…/>}
  summary={<…/>} confirmTitle="ยืนยันการปรับสต็อก 50 รายการ?"
  onConfirm={() => adjust.mutateAsync(payload)} loading={adjust.isPending} />
// onConfirm throw → ค้างที่หน้ายืนยัน กดซ้ำได้ (error โดน toast โดย handleError อยู่แล้ว)
```

### Sheet import suite

`SheetImportModal` = flow ครบ 3 ขั้น (อัพโหลด → จับคู่คอลัมน์ → ตรวจสอบ+นำเข้า) ประกอบจาก `DropZoneSheet` (ตรวจชนิดไฟล์ .xlsx/.xls/.csv รวมถึงลากวาง) + `SheetColumnMapper` + `SheetTable` — ดู story `SheetImportModal` เป็นตัวอย่างการต่อ `dbFields`/`validateRow`/`transformRow`/`onImport`

---

## Conventions ที่ทุก component ทำตาม

### controlled ตัดสินจาก "ส่ง prop `value` มาไหม" ไม่ใช่ค่าของมัน

```tsx
// ❌ พัง — ทุกหน้าเขียน value={status || undefined} พอเคลียร์ตัวกรอง ค่าเป็น '' → undefined
//    component สลับไป uncontrolled เงียบๆ แล้วโชว์ internal ที่ค้างค่าเดิม
//    (อาการที่ผู้ใช้เจอ: "ล้างตัวกรองแล้วต้องกดอีกรอบถึงจะหาย")
const selected = value !== undefined ? value : internal;

// ✅ ถูก — เช็คว่า key มีอยู่ใน props จริงไหม
export function Select(props: SelectProps) {
  const { value, defaultValue, onChange } = props;
  const [internal, setInternal] = React.useState(defaultValue);
  const isControlled = 'value' in props;
  const selected = isControlled ? value : internal;

  function pick(v: string) {
    if (!isControlled) setInternal(v);   // controlled → ห้ามแตะ internal
    onChange?.(v);
  }
}
```

ต้องรับ props เป็นก้อน (`props: XProps`) แล้ว destructure ข้างในถึงจะเช็ค `'value' in props` ได้ —
destructure ที่ signature จะไม่เหลือ object ให้เช็ค

ทำแล้วใน: `Input` · `Select` · `DatePicker` · `Segmented` · `Checkbox.Group`
**component ใหม่ที่มี internal state ต้องทำตามนี้ด้วย** และตอนอยู่ใน `Form.Item`
จะเป็น controlled เสมอ (`Form.Item` inject `value` ให้ผ่าน `cloneElement`) ซึ่งถูกต้องแล้ว

`DateRangePicker` ไม่มีปัญหานี้ — label บนปุ่มอ่านจาก `value` ตรงๆ ส่วน state ภายในเป็นแค่
สถานะระหว่างเลือกในปฏิทิน และ resync ทุกครั้งที่เปิด

- Async callback (`onOk`/`onConfirm`) คืน Promise ได้ → loading + กันกดซ้ำอัตโนมัติ
- `null`/`undefined` ใน cell formatter → "—" ไม่ crash
- Popover/dropdown ปิดด้วย Escape, โฟกัสวนใน overlay, ปุ่มมี `focus-visible` ring
- Error จาก mutation ให้ toast ผ่าน `handleError` ฝั่งผู้เรียก — component ไม่ toast เอง
