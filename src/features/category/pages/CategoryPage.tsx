import { useEffect, useMemo, useRef, useState } from 'react';
import { Space, Tabs, Tree, Empty, Card, Modal as AntModal, Checkbox, Typography, Skeleton } from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  AppstoreOutlined, UnorderedListOutlined, ApartmentOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Table, Button, PageHeader, Tag } from '@design-system';
import type { ColumnType } from '@design-system';
import { CategoryFormModal } from '../components/CategoryFormModal';
import {
  useCategories, useCategoryTree,
  useCreateCategory, useUpdateCategory, useDeleteCategory,
} from '../hooks';
import type { Category, CategoryTreeNode, CreateCategoryDto } from '../types';

const { Text } = Typography;

export function CategoryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);

  const { data, isLoading, refetch, isFetching } = useCategories({ page: 1, limit: 500 });
  const tree = useCategoryTree();
  const categories = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination?.total ?? categories.length;

  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  // descendants of `id` — สำหรับตัดออกจาก parent options ตอน edit
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
      const children = parentToChildren.get(id) ?? [];
      children.forEach((c) => {
        if (!out.has(c)) {
          out.add(c);
          collect(c, out);
        }
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

  function handleDelete(c: Category) {
    const hasChildren = (c.childrenId?.length ?? 0) > 0;
    if (!hasChildren) {
      AntModal.confirm({
        title: `ลบหมวดหมู่ "${c.name}"?`,
        okText: 'ลบ', okType: 'danger', cancelText: 'ยกเลิก',
        onOk: () => deleteCat.mutateAsync({ id: c.id }),
      });
      return;
    }
    let deleteChild = false;
    AntModal.confirm({
      title: `ลบหมวดหมู่ "${c.name}"?`,
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>หมวดหมู่นี้มีหมวดหมู่ย่อย {c.childrenId?.length} รายการ</p>
          <Checkbox onChange={(e) => { deleteChild = e.target.checked; }}>
            ลบหมวดหมู่ย่อยทั้งหมดด้วย
          </Checkbox>
        </div>
      ),
      okText: 'ลบ', okType: 'danger', cancelText: 'ยกเลิก',
      onOk: () => deleteCat.mutateAsync({ id: c.id, deleteChild }),
    });
  }

  // จัด categories เป็น nested ตาม parentId — Table render แบบ tree row อัตโนมัติ
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

  const [tableExpandedKeys, setTableExpandedKeys] = useState<React.Key[]>([]);
  const tableSeenKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const allParentIds: string[] = [];
    categories.forEach((c) => {
      if ((c.childrenId?.length ?? 0) > 0) allParentIds.push(c.id);
    });
    const seen = tableSeenKeysRef.current;
    if (seen.size === 0) {
      setTableExpandedKeys(allParentIds);
    } else {
      const newOnes = allParentIds.filter((k) => !seen.has(k));
      if (newOnes.length > 0) {
        setTableExpandedKeys((prev) =>
          Array.from(new Set([...prev.map(String), ...newOnes])),
        );
      }
    }
    categories.forEach((c) => seen.add(c.id));
  }, [categories]);

  const columns: ColumnType<CatNode>[] = [
    {
      title: 'ชื่อหมวดหมู่',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      searchable: true,
      defaultSortOrder: 'ascend',
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
      searchable: true,
      render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'description',
      ellipsis: true,
      render: (v?: string) => v || '-',
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
            variant="ghost" size="small" icon={<EditOutlined />}
            onClick={() => { setSelected(r); setModalOpen(true); }}
          />
          <Button
            variant="danger-ghost" size="small" icon={<DeleteOutlined />}
            onClick={() => handleDelete(r)}
          />
        </Space>
      ),
    },
  ];

  const treeData = useMemo(
    () => mapTreeNodes(tree.data ?? []),
    [tree.data],
  );

  // controlled expanded keys — แก้ปัญหา defaultExpandAll ไม่ทำงานเพราะ data มา async
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const seenKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!tree.data) return;
    const allKeys: string[] = [];
    const walk = (nodes: CategoryTreeNode[]) => {
      nodes.forEach((n) => {
        allKeys.push(n.id);
        if (Array.isArray(n.children) && n.children.length > 0) walk(n.children);
      });
    };
    walk(tree.data);

    // ครั้งแรกที่ data มา → expand ทั้งหมด
    // refetch ครั้งถัดไป → keep ของ user ที่เคย collapse + auto-expand node ใหม่ที่ยังไม่เคยเห็น
    const seen = seenKeysRef.current;
    if (seen.size === 0) {
      setExpandedKeys(allKeys);
    } else {
      const newKeys = allKeys.filter((k) => !seen.has(k));
      if (newKeys.length > 0) {
        setExpandedKeys((prev) => Array.from(new Set([...prev.map(String), ...newKeys])));
      }
    }
    allKeys.forEach((k) => seen.add(k));
  }, [tree.data]);

  return (
    <div>
      <PageHeader
        title="จัดการหมวดหมู่"
        subtitle={`ทั้งหมด ${total} หมวดหมู่`}
        actions={
          <>
            <Button icon={<ReloadOutlined />} onClick={() => { refetch(); tree.refetch(); }} loading={isFetching}>
              รีเฟรช
            </Button>
            <Button variant="primary" icon={<PlusOutlined />} onClick={() => { setSelected(null); setModalOpen(true); }}>
              เพิ่มหมวดหมู่
            </Button>
          </>
        }
      />

      <Tabs
        defaultActiveKey="list"
        items={[
          {
            key: 'list',
            label: <Space size={6}><UnorderedListOutlined /> รายการ</Space>,
            children: (
              <Table<CatNode>
                rowKey="id"
                columns={columns}
                dataSource={nestedCategories}
                loading={isLoading}
                expandable={{
                  expandedRowKeys: tableExpandedKeys,
                  onExpandedRowsChange: (keys) => setTableExpandedKeys([...keys]),
                  rowExpandable: (r) => (r.children?.length ?? 0) > 0,
                }}
                pagination={false}
              />
            ),
          },
          {
            key: 'tree',
            label: <Space size={6}><ApartmentOutlined /> โครงสร้างต้นไม้</Space>,
            children: (
              <Card>
                {tree.isLoading ? (
                  <Skeleton active paragraph={{ rows: 6 }} />
                ) : treeData.length === 0 ? (
                  <Empty description="ยังไม่มีหมวดหมู่" image={<AppstoreOutlined style={{ fontSize: 32 }} />} />
                ) : (
                  <Tree
                    treeData={treeData}
                    expandedKeys={expandedKeys}
                    onExpand={(keys) => setExpandedKeys(keys)}
                    showLine
                    blockNode
                  />
                )}
              </Card>
            ),
          },
        ]}
      />

      <CategoryFormModal
        open={modalOpen}
        category={selected}
        parentOptions={parentOptions}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function mapTreeNodes(nodes: CategoryTreeNode[] | undefined | null): DataNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((n) => {
    const kids = Array.isArray(n.children) ? n.children : [];
    return {
      key: n.id,
      title: (
        <Space size={6}>
          <Text strong>{n.name}</Text>
          {n.description && <Text type="secondary" style={{ fontSize: 12 }}>— {n.description}</Text>}
        </Space>
      ),
      children: kids.length > 0 ? mapTreeNodes(kids) : undefined,
    };
  });
}
