import { Table, Space, Button, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Employee } from "../types";
import { DepartmentLabels } from "../types/enums";
import dayjs from "dayjs";

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export const EmployeeTable = ({
  employees,
  loading,
  onEdit,
  onDelete,
  canEdit,
}: EmployeeTableProps) => {
  const columns: ColumnsType<Employee> = [
    {
      title: "ชื่อ-นามสกุล",
      key: "fullName",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: "ชื่อเล่น",
      dataIndex: "nickname",
      key: "nickname",
    },
    {
      title: "เบอร์โทร",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "แผนก",
      dataIndex: "department",
      key: "department",
      render: (department: string) => (
        <Tag color="blue">
          {DepartmentLabels[department as keyof typeof DepartmentLabels]}
        </Tag>
      ),
      filters: Object.entries(DepartmentLabels).map(([value, label]) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => record.department === value,
    },
    {
      title: "วันที่เริ่มงาน",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
    },
    {
      title: "การจัดการ",
      key: "action",
      fixed: "right" as const,
      width: 150,
      render: (_, record) =>
        canEdit ?
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            >
              แก้ไข
            </Button>
            <Popconfirm
              title="ยืนยันการลบ"
              description="คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?"
              onConfirm={() => onDelete(record.id)}
              okText="ใช่"
              cancelText="ไม่"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                ลบ
              </Button>
            </Popconfirm>
          </Space>
        : <span style={{ color: "#999" }}>-</span>,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={employees}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1000 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `ทั้งหมด ${total} รายการ`,
      }}
    />
  );
};
