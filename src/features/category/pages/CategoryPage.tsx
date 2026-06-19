import { useEffect, useMemo, useRef, useState } from 'react';
import { Space, Modal as AntModal, Checkbox, Typography, Flex } from 'antd';
import dayjs from 'dayjs';
import { Table, Button, PageHeader, Tag, DeleteConfirmButton, colors, SummaryCard , AppIcons } from '@design-system';
import type { ColumnType } from '@design-system';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../react-query';
import type { Category, CreateCategoryDto } from '../types';

const { Text } = Typography;

export function CategoryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  const { data, isLoading, refetch, isFetching } = useCategories({ page: 1, limit: 500 });
  const categories = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? categories.length;

  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const rootCount = useMemo(() => categories.filter((c) => !c.parentId).length, [categories]);
  const subCount = useMemo(() => categories.filter((c) => !!c.parentId).length, [categories]);

  const descendantsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const parentToChildren = new Map<string, string[]>();
    categories.forEach((c) => {
      if (c.parentId) {
        if (!parentToChildren.has(c.parentId)) parentToChildren.set(c.parentId, []);
        parentToChildren.get(c.parentId)!.push(c.id);
      }
    });
    function collect(id: string, out: Set<string>) {
      (parentToChildren.get(id) ?? []).forEach((c) => {
        if (!out.has(c)) { out.add(c); collect(c, out); }
      });
    }
    categories.forEach((c) => {
      const set = new Set<string>();
      collect(c.id, set);
      map.set(c.id, set);
    });
    return map;
  }, [categories]);

  const parentOptions = useMemo(() => {
    const excluded = new Set<string>();
    if (selected) {
      excluded.add(selected.id);
      (descendantsMap.get(selected.id) ?? new Set()).forEach((id) => excluded.add(id));
    }
    return categories
      .filter((c) => !excluded.has(c.id))
      .map((c) => ({ label: c.name, value: c.id }));
  }, [categories, selected, descendantsMap]);

  async function handleSubmit(values: CreateCategoryDto) {
    if (selected) {
      await updateCat.mutateAsync({ id: selected.id, data: values });
    } else {
      await createCat.mutateAsync(values);
    }
    setModalOpen(false);
  }

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  function handleDeleteWithChildren(c: Category) {
    let deleteChild = false;
    // ลบแบบ cascade: backend ลบหมวดย่อยทั้งสายลึก (descendant) — แสดงรายชื่อทั้งหมดให้ผู้ใช้เห็นก่อนยืนยัน
    const descendantIds = Array.from(descendantsMap.get(c.id) ?? []);
    const descendantNames = descendantIds.map((id) => nameById.get(id) ?? id);
    AntModal.confirm({
      title: `ลบหมวดหมู่ "${c.name}"?`,
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            หมวดหมู่นี้มีหมวดหมู่ย่อยทั้งหมด {descendantNames.length} รายการ
            หากเลือกลบด้วย รายการต่อไปนี้จะถูกลบทั้งหมด:
          </p>
          <ul style={{ margin: '0 0 8px', paddingInlineStart: 18, maxHeight: 160, overflow: 'auto' }}>
            {descendantNames.map((name, i) => (
              <li key={descendantIds[i]}>
                <Text type="secondary">{name}</Text>
              </li>
            ))}
          </ul>
          <Checkbox onChange={(e) => { deleteChild = e.target.checked; }}>
            ลบหมวดหมู่ย่อยทั้งหมดด้วย (สินค้าในหมวดจะไม่ถูกลบ)
          </Checkbox>
        </div>
      ),
      okText: 'ลบ', okType: 'danger', cancelText: 'ยกเลิก',
      onOk: () => deleteCat.mutateAsync({ id: c.id, deleteChild }),
    });
  }

  type CatNode = Category & { children?: CatNode[] };
  const nestedCategories = useMemo<CatNode[]>(() => {
    const byId = new Map<string, CatNode>();
    categories.forEach((c) => byId.set(c.id, { ...c, children: undefined }));
    const roots: CatNode[] = [];
    byId.forEach((node) => {
      if (node.parentId && byId.has(node.parentId)) {
        const parent = byId.get(node.parentId)!;
        (parent.children = parent.children ?? []).push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [categories]);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const seenKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // หมวดที่เป็น "พ่อ" = id ที่ถูกอ้างเป็น parentId ของหมวดอื่น (childrenId จาก backend ไม่เคยถูก populate)
    const parentIds = new Set(
      categories.filter((c) => c.parentId).map((c) => c.parentId as string),
    );
    const allParentIds = categories.filter((c) => parentIds.has(c.id)).map((c) => c.id);
    const seen = seenKeysRef.current;
    if (seen.size === 0) {
      setExpandedKeys(allParentIds);
    } else {
      const newOnes = allParentIds.filter((k) => !seen.has(k));
      if (newOnes.length > 0) {
        setExpandedKeys((prev) => Array.from(new Set([...prev.map(String), ...newOnes])));
      }
    }
    categories.forEach((c) => seen.add(c.id));
  }, [categories]);

  const columns: ColumnType<CatNode>[] = [
    {
      title: 'ชื่อหมวดหมู่',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (v: string, r: CatNode) => (
        <Space size={6}>
          <Text strong>{v}</Text>
          {(r.children?.length ?? 0) > 0 && (
            <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
              {r.children!.length} หมวดย่อย
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'รหัส',
      dataIndex: 'id',
      width: 180,
      render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'description',
      ellipsis: true,
      render: (v?: string | null) => v || '-',
    },
    {
      title: 'อัปเดตล่าสุด',
      dataIndex: 'updatedAt',
      width: 160,
      sorter: (a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''),
      render: (v?: string) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: '',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: unknown, r: CatNode) => (
        <Space>
          <Button
            variant="ghost" size="small" icon={<AppIcons.edit />}
            onClick={() => { setSelected(r); setModalOpen(true); }}
          />
          {(r.children?.length ?? 0) > 0 ? (
            <Button
              variant="danger-ghost" size="small" icon={<AppIcons.delete />}
              onClick={() => handleDeleteWithChildren(r)}
            />
          ) : (
            <DeleteConfirmButton
              onConfirm={() => deleteCat.mutateAsync({ id: r.id })}
              loading={deleteCat.isPending}
              title={`ลบหมวดหมู่ "${r.name}"?`}
              description="ลบหมวดหมู่นี้ออกจากระบบ"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="จัดการหมวดหมู่"
        subtitle={`ทั้งหมด ${total} หมวดหมู่`}
        actions={
          <>
            <Button icon={<AppIcons.refresh />} onClick={() => refetch()} loading={isFetching}>
              รีเฟรช
            </Button>
            <Button variant="primary" icon={<AppIcons.add />} onClick={() => { setSelected(null); setModalOpen(true); }}>
              เพิ่มหมวดหมู่
            </Button>
          </>
        }
      />

      <Flex gap={12} wrap style={{ marginBottom: 16 }}>
        <SummaryCard title="หมวดหมู่ทั้งหมด" value={total} suffix="หมวด" color={colors.brand.primary} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="หมวดหมู่หลัก" value={rootCount} suffix="หมวด" color={colors.semantic.success} style={{ flex: 1, minWidth: 140 }} />
        <SummaryCard title="หมวดย่อย" value={subCount} suffix="หมวด" color={colors.text.secondary} style={{ flex: 1, minWidth: 140 }} />
      </Flex>

      <Table<CatNode>
        rowKey="id"
        columns={columns}
        dataSource={nestedCategories}
        loading={isLoading}
        expandable={{
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: (keys) => setExpandedKeys([...keys]),
          rowExpandable: (r) => (r.children?.length ?? 0) > 0,
        }}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />

      <CategoryFormModal
        open={modalOpen}
        category={selected}
        parentOptions={parentOptions}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createCat.isPending || updateCat.isPending}
      />
    </div>
  );
}
