import { useState } from 'react';
import { AlertDialog, Checkbox, DropdownMenu, Tabs, Tooltip } from 'radix-ui';
import { useSearchState, showError, notify, downloadFile } from '@shared';
import { BrandSearchSelect } from '@features/brand/components/BrandSearchSelect';
import { CategorySearchSelect } from '@features/category/components/CategorySearchSelect';
import { AppIcons } from '@/lib/icons';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  BULK_BAR,
  CELL_CODE,
  CHECKBOX,
  DIALOG_CONTENT,
  DIALOG_DESC,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  DOT,
  DOT_BASE,
  DOT_TONE,
  INPUT,
  MENU_CONTENT,
  MENU_ITEM,
  MENU_ITEM_DANGER,
  MENU_SEPARATOR,
  PAGE_HEADER,
  PAGE_SIZE_SELECT,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  PAGER,
  SEARCH_CLEAR,
  SEARCH_ICON,
  SEARCH_INPUT,
  statusPill,
  TABLE,
  TABLE_EMPTY,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
  TABS_LIST,
  TABS_TRIGGER,
  tag,
  TEXT,
  TOOLTIP_CONTENT,
} from '@/lib/styles';
import {
  useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useBulkDeleteProduct,
  inventoryExportService,
} from '../react-query';
import { ProductFormModal } from '../components/ProductFormModal';
import { ProductImportModal } from '../components/ProductImportModal';
import { StockEntryModal } from '../components/StockEntryModal';
import { ShopPriceModal } from '../components/ShopPriceModal';
import { StockHistoryTab } from '../components/StockHistoryTab';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';

type ActiveTab = 'products' | 'history';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');

  // Product tab state
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [stockEntryOpen, setStockEntryOpen] = useState(false);
  const [stockEntryBarcode, setStockEntryBarcode] = useState<string | undefined>();
  const [selected, setSelected] = useState<Product | null>(null);
  const [tableState, setTableState] = useSearchState('inventory-list', {
    search: '', brandId: '', categoryId: '', isActive: '', lowStock: false, page: 1, pageSize: 20,
  });
  const { search, brandId, categoryId, isActive, lowStock, page, pageSize } = tableState;
  const [searchText, setSearchText] = useState(search);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [shopPriceBarcode, setShopPriceBarcode] = useState<string | null>(null);
  const [deletingBarcode, setDeletingBarcode] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const params = {
    page, limit: pageSize,
    search: search || undefined,
    brandId: brandId || undefined,
    categoryId: categoryId || undefined,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    lowStock: lowStock || undefined,
  };
  const { data, isLoading, refetch } = useProducts(params);

  const products = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const bulkDelete = useBulkDeleteProduct();

  const allSelected = products.length > 0 && products.every((r) => selectedKeys.includes(r.barcode));
  const someSelected = selectedKeys.length > 0 && !allSelected;

  async function handleSubmit(values: CreateProductDto | UpdateProductDto) {
    if (selected) {
      await updateProduct.mutateAsync({ barcode: selected.barcode, data: values as UpdateProductDto });
    } else {
      await createProduct.mutateAsync(values as CreateProductDto);
    }
    setModalOpen(false);
  }

  async function handleBulkDelete() {
    await bulkDelete.mutateAsync(selectedKeys);
    setSelectedKeys([]);
    setBulkConfirmOpen(false);
  }

  async function handleDeleteProduct(barcode: string) {
    setDeletingBarcode(barcode);
    try {
      await deleteProduct.mutateAsync(barcode);
    } finally {
      setDeletingBarcode(null);
    }
  }

  async function handleExport() {
    setExporting(true);
    const key = notify.loading('กำลังส่งออก Excel สินค้า...');
    try {
      const res = await inventoryExportService.exportProducts({
        search: search || undefined,
        brandId: brandId || undefined,
        categoryId: categoryId || undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        lowStock: lowStock || undefined,
      });
      downloadFile(res.data as unknown as Blob, 'สินค้า.xlsx');
      notify.resolve(key, 'success', 'ส่งออก Excel สินค้า สำเร็จ');
    } catch (err) {
      notify.dismiss(key);
      showError(err, 'ส่งออก Excel สินค้า');
    } finally {
      setExporting(false);
    }
  }

  function openStockEntry(barcode?: string) {
    setStockEntryBarcode(barcode);
    setStockEntryOpen(true);
  }

  function toggleAll(checked: boolean) {
    const pageIds = products.map((r) => r.barcode);
    setSelectedKeys((keys) =>
      checked ? [...new Set([...keys, ...pageIds])] : keys.filter((k) => !pageIds.includes(k)),
    );
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <div>
        <div className={`${PAGE_HEADER} mb-4`}>
          <div className="min-w-0">
            <h1 className={PAGE_TITLE}>สินค้าคงคลัง</h1>
            <p className={PAGE_SUBTITLE}>
              {activeTab === 'products' ? `ทั้งหมด ${total} รายการ` : 'ประวัติการเคลื่อนไหวสต็อก'}
            </p>
          </div>
          {activeTab === 'products' && (
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btn()} onClick={() => refetch()}>
                <AppIcons.refresh />
                รีเฟรช
              </button>
              <button type="button" className={btn()} onClick={handleExport} disabled={exporting}>
                {exporting ? <AppIcons.loading spin /> : <AppIcons.exportFile />}
                Export Excel
              </button>
              <button type="button" className={btn()} onClick={() => setImportOpen(true)}>
                <AppIcons.importFile />
                นำเข้า Excel
              </button>
              <button type="button" className={btn()} onClick={() => openStockEntry()}>
                <AppIcons.inbox />
                รับสินค้าเข้า
              </button>
              <button
                type="button"
                className={btn('primary')}
                onClick={() => {
                  setSelected(null);
                  setModalOpen(true);
                }}
              >
                <AppIcons.add />
                เพิ่มสินค้า
              </button>
            </div>
          )}
        </div>

        <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)}>
          <Tabs.List className={cn(TABS_LIST, 'mb-4')}>
            <Tabs.Trigger value="products" className={TABS_TRIGGER}>
              สินค้า
            </Tabs.Trigger>
            <Tabs.Trigger value="history" className={TABS_TRIGGER}>
              ประวัติการเคลื่อนไหว
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="products" className="outline-none">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="relative w-65">
                <AppIcons.search className={SEARCH_ICON} />
                <input
                  className={SEARCH_INPUT}
                  placeholder="ค้นหาชื่อ, barcode..."
                  aria-label="ค้นหาสินค้า"
                  value={searchText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchText(val);
                    if (val === '') setTableState({ ...tableState, search: '', page: 1 });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setTableState({ ...tableState, search: searchText, page: 1 });
                    }
                  }}
                />
                {searchText && (
                  <button
                    type="button"
                    aria-label="ล้างคำค้น"
                    className={SEARCH_CLEAR}
                    onClick={() => {
                      setSearchText('');
                      setTableState({ ...tableState, search: '', page: 1 });
                    }}
                  >
                    <AppIcons.close className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="w-40">
                <BrandSearchSelect
                  allowClear
                  placeholder="แบรนด์"
                  value={brandId || undefined}
                  onChange={(v) => setTableState({ ...tableState, brandId: v ?? '', page: 1 })}
                />
              </div>

              <div className="w-40">
                <CategorySearchSelect
                  allowClear
                  placeholder="หมวดหมู่"
                  value={categoryId || undefined}
                  onChange={(v) => setTableState({ ...tableState, categoryId: v ?? '', page: 1 })}
                />
              </div>

              <select
                aria-label="สถานะสินค้า"
                value={isActive}
                onChange={(e) => setTableState({ ...tableState, isActive: e.target.value, page: 1 })}
                className={cn(INPUT, 'w-30')}
              >
                <option value="">ทุกสถานะ</option>
                <option value="true">ใช้งาน</option>
                <option value="false">ปิด</option>
              </select>

              <button
                type="button"
                aria-pressed={lowStock}
                className={btn(lowStock ? 'primary' : 'ghost')}
                onClick={() => setTableState({ ...tableState, lowStock: !lowStock, page: 1 })}
              >
                สต็อกต่ำ
              </button>
            </div>

            {selectedKeys.length > 0 && (
              <div className={`${BULK_BAR} mb-3 justify-between`}>
                <span className={TEXT.muted}>เลือก {selectedKeys.length} รายการ</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={btn('danger', 'sm')}
                    onClick={() => setBulkConfirmOpen(true)}
                    disabled={bulkDelete.isPending}
                  >
                    {bulkDelete.isPending ? <AppIcons.loading spin /> : <AppIcons.delete />}
                    ลบที่เลือก
                  </button>
                  <button
                    type="button"
                    className={btn('ghost', 'sm')}
                    onClick={() => setSelectedKeys([])}
                    disabled={bulkDelete.isPending}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}

            <div className={TABLE_WRAP}>
              <table className={cn(TABLE, 'min-w-225')}>
                <thead>
                  <tr>
                    <th className={cn(TABLE_TH, 'w-10')}>
                      <Checkbox.Root
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={(c) => toggleAll(c === true)}
                        aria-label="เลือกทุกแถวในหน้านี้"
                        className={CHECKBOX}
                      >
                        <Checkbox.Indicator className="flex items-center justify-center">
                          {someSelected ?
                            <AppIcons.minus className="size-3" />
                          : <AppIcons.check className="size-3" />}
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                    </th>
                    <th className={cn(TABLE_TH, 'w-38')}>Barcode</th>
                    <th className={TABLE_TH}>ชื่อสินค้า</th>
                    <th className={cn(TABLE_TH, 'w-30')}>หมวดหมู่</th>
                    <th className={cn(TABLE_TH, 'w-33 text-right')}>ราคาขาย/แพ็ค</th>
                    <th className={cn(TABLE_TH, 'w-23 text-right')}>คงเหลือ</th>
                    <th className={cn(TABLE_TH, 'w-23')}>สถานะ</th>
                    <th className={cn(TABLE_TH, 'w-14 text-center')}>
                      <span className="sr-only">ตัวเลือก</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ?
                    <tr>
                      <td colSpan={8} className={TABLE_EMPTY}>
                        <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                      </td>
                    </tr>
                  : products.length === 0 ?
                    <tr>
                      <td colSpan={8} className={TABLE_EMPTY}>
                        {search || brandId || categoryId || isActive || lowStock ?
                          'ไม่พบสินค้าที่ตรงกับตัวกรอง — ลองล้างตัวกรองดู'
                        : 'ยังไม่มีสินค้า — กด “เพิ่มสินค้า” เพื่อเริ่ม'}
                      </td>
                    </tr>
                  : products.map((r) => {
                      const checked = selectedKeys.includes(r.barcode);
                      const pack = r.sellPrice?.pack;
                      const carton = r.sellPrice?.carton;
                      const noPrice = !pack && !carton;
                      const stockTone =
                        r.remaining === 0 ? 'error'
                        : r.minStock && r.remaining <= r.minStock ? 'warning'
                        : 'success';
                      return (
                        <tr key={r.barcode} data-selected={checked} className={TABLE_TR}>
                          <td className={TABLE_TD}>
                            <Checkbox.Root
                              checked={checked}
                              onCheckedChange={(c) =>
                                setSelectedKeys((keys) =>
                                  c === true ?
                                    [...keys, r.barcode]
                                  : keys.filter((k) => k !== r.barcode),
                                )
                              }
                              aria-label={`เลือก ${r.name}`}
                              className={CHECKBOX}
                            >
                              <Checkbox.Indicator className="flex items-center justify-center">
                                <AppIcons.check className="size-3" />
                              </Checkbox.Indicator>
                            </Checkbox.Root>
                          </td>
                          <td className={TABLE_TD}>
                            <code className={CELL_CODE}>{r.barcode}</code>
                          </td>
                          <td className={TABLE_TD}>
                            <div className="font-medium">{r.name}</div>
                            {r.sku && (
                              <div className="text-[11px] text-foreground-subtle">{r.sku}</div>
                            )}
                            {r.brand?.name && (
                              <div className="text-xs text-foreground-subtle">{r.brand.name}</div>
                            )}
                          </td>
                          <td className={TABLE_TD}>
                            {r.category?.name ?
                              <span className={tag('neutral')}>{r.category.name}</span>
                            : '-'}
                          </td>
                          <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                            <span className="inline-flex items-center gap-1">
                              {noPrice && (
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <span
                                      tabIndex={0}
                                      aria-label="ยังไม่ตั้งราคาขาย"
                                      className="inline-flex cursor-help"
                                    >
                                      <AppIcons.warningFilled className="size-3.5 text-warning" />
                                    </span>
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      side="top"
                                      sideOffset={6}
                                      className={TOOLTIP_CONTENT}
                                    >
                                      ยังไม่ตั้งราคาขาย
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                              )}
                              <span>{pack != null ? formatMoney(pack) : '-'}</span>
                            </span>
                          </td>
                          <td className={cn(TABLE_TD, 'text-right')}>
                            <span className={statusPill(stockTone)}>
                              {r.remaining?.toLocaleString()}
                            </span>
                          </td>
                          <td className={TABLE_TD}>
                            <span className={DOT_BASE}>
                              <span
                                className={cn(DOT, r.isActive ? DOT_TONE.success : DOT_TONE.default)}
                              />
                              {r.isActive ? 'ใช้งาน' : 'ปิด'}
                            </span>
                          </td>
                          <td className={cn(TABLE_TD, 'text-center')}>
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button
                                  type="button"
                                  aria-label="ตัวเลือกของแถวนี้"
                                  className={btnIcon('ghost', 'sm')}
                                  disabled={deletingBarcode === r.barcode}
                                >
                                  {deletingBarcode === r.barcode ?
                                    <AppIcons.loading spin />
                                  : <AppIcons.more />}
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                  align="end"
                                  sideOffset={4}
                                  className={MENU_CONTENT}
                                >
                                  <DropdownMenu.Item
                                    className={MENU_ITEM}
                                    onSelect={() => openStockEntry(r.barcode)}
                                  >
                                    รับสินค้าเข้า
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item
                                    className={MENU_ITEM}
                                    onSelect={() => setShopPriceBarcode(r.barcode)}
                                  >
                                    ราคาร้านค้าเฉพาะ
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item
                                    className={MENU_ITEM}
                                    onSelect={() => {
                                      setSelected(r);
                                      setModalOpen(true);
                                    }}
                                  >
                                    แก้ไข
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Separator className={MENU_SEPARATOR} />
                                  <DropdownMenu.Item
                                    className={MENU_ITEM_DANGER}
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setPendingDelete(r);
                                    }}
                                  >
                                    ลบ
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>

            <div className={PAGER}>
              <span className={TEXT.subtle}>
                แสดง {products.length ? (page - 1) * pageSize + 1 : 0}–
                {(page - 1) * pageSize + products.length} จาก {total.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="inventory-page-size" className="sr-only">
                  จำนวนแถวต่อหน้า
                </label>
                <select
                  id="inventory-page-size"
                  value={pageSize}
                  onChange={(e) =>
                    setTableState({ ...tableState, page: 1, pageSize: Number(e.target.value) })
                  }
                  className={PAGE_SIZE_SELECT}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n} / หน้า
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label="หน้าก่อนหน้า"
                  className={btnIcon('secondary', 'sm')}
                  disabled={page <= 1}
                  onClick={() => setTableState({ ...tableState, page: page - 1 })}
                >
                  <AppIcons.arrowLeft />
                </button>
                <span className={cn(TEXT.subtle, 'tabular-nums')}>
                  {page} / {lastPage}
                </span>
                <button
                  type="button"
                  aria-label="หน้าถัดไป"
                  className={btnIcon('secondary', 'sm')}
                  disabled={page >= lastPage}
                  onClick={() => setTableState({ ...tableState, page: page + 1 })}
                >
                  <AppIcons.arrowRight />
                </button>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="history" className="outline-none">
            <StockHistoryTab active={activeTab === 'history'} />
          </Tabs.Content>
        </Tabs.Root>

        <ProductFormModal
          open={modalOpen}
          product={selected}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          loading={createProduct.isPending || updateProduct.isPending}
        />

        <StockEntryModal
          open={stockEntryOpen}
          onClose={() => {
            setStockEntryOpen(false);
            setStockEntryBarcode(undefined);
          }}
          initialBarcode={stockEntryBarcode}
        />

        <ProductImportModal open={importOpen} onClose={() => setImportOpen(false)} />

        {shopPriceBarcode && (
          <ShopPriceModal
            open={!!shopPriceBarcode}
            barcode={shopPriceBarcode}
            productName={
              products.find((p) => p.barcode === shopPriceBarcode)?.name ?? shopPriceBarcode
            }
            onClose={() => setShopPriceBarcode(null)}
          />
        )}

        <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className={DIALOG_OVERLAY} />
            <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
              <AlertDialog.Title className={DIALOG_TITLE}>ลบสินค้านี้?</AlertDialog.Title>
              <AlertDialog.Description className={DIALOG_DESC}>
                “{pendingDelete?.name}” จะถูกลบออกจากระบบ
              </AlertDialog.Description>
              <div className={DIALOG_FOOTER}>
                <AlertDialog.Cancel asChild>
                  <button type="button" className={btn()}>
                    ยกเลิก
                  </button>
                </AlertDialog.Cancel>
                <button
                  type="button"
                  className={btn('danger')}
                  onClick={() => {
                    if (pendingDelete) void handleDeleteProduct(pendingDelete.barcode);
                    setPendingDelete(null);
                  }}
                >
                  ลบ
                </button>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

        <AlertDialog.Root open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className={DIALOG_OVERLAY} />
            <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
              <AlertDialog.Title className={DIALOG_TITLE}>
                ลบ {selectedKeys.length} รายการที่เลือก?
              </AlertDialog.Title>
              <AlertDialog.Description className={DIALOG_DESC}>
                ไม่สามารถยกเลิกการดำเนินการนี้ได้
              </AlertDialog.Description>
              <div className={DIALOG_FOOTER}>
                <AlertDialog.Cancel asChild>
                  <button type="button" className={btn()}>
                    ยกเลิก
                  </button>
                </AlertDialog.Cancel>
                <button
                  type="button"
                  className={btn('danger')}
                  disabled={bulkDelete.isPending}
                  onClick={() => void handleBulkDelete()}
                >
                  {bulkDelete.isPending && <AppIcons.loading spin />}
                  ลบที่เลือก
                </button>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
    </Tooltip.Provider>
  );
}
