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
| Table | `Table` (+`Table.Summary`) `DateCell` `MoneyCell` `CodeCell` `QuantityCell` `ActionCell` `BulkSelectionBar` |
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

### ActionCell — edit + delete ท้ายแถว table

```tsx
{ title: '', key: 'actions', fixed: 'right', width: 80,
  render: (_: unknown, record: Product) => (
    <ActionCell onEdit={() => openEdit(record)} onDelete={() => del.mutate(record.id)} isDeleting={del.isPending} />
  ) }
```

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

- Async callback (`onOk`/`onConfirm`) คืน Promise ได้ → loading + กันกดซ้ำอัตโนมัติ
- `null`/`undefined` ใน cell formatter → "—" ไม่ crash
- Popover/dropdown ปิดด้วย Escape, โฟกัสวนใน overlay, ปุ่มมี `focus-visible` ring
- Error จาก mutation ให้ toast ผ่าน `handleError` ฝั่งผู้เรียก — component ไม่ toast เอง
