import { useState } from "react";
import { Card, Button, Flex, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { EmployeeTable, EmployeeFormModal } from "../components";
import { useEmployee } from "../hooks";
import { useAuth } from "@features/auth/services";
import { Role } from "../types/enums";
import type { Employee, CreateEmployeeDto } from "../types";

const { Title } = Typography;

const EmployeePage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    employees,
    loading,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployee();
  const { user } = useAuth();

  // Check if user can edit (SuperAdmin only)
  const canEdit = user?.role === Role.SuperAdmin;

  const handleOpenModal = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (values: CreateEmployeeDto) => {
    setSubmitting(true);
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, values);
      } else {
        await createEmployee(values);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEmployee(id);
  };

  const handleRefresh = () => {
    fetchEmployees();
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: 24 }}
        >
          <Title level={3} style={{ margin: 0 }}>
            จัดการพนักงาน
          </Title>
          <Flex gap={8}>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              รีเฟรช
            </Button>
            {canEdit && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenModal}
              >
                เพิ่มพนักงาน
              </Button>
            )}
          </Flex>
        </Flex>

        <EmployeeTable
          employees={employees}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canEdit={canEdit}
        />
      </Card>

      <EmployeeFormModal
        open={modalOpen}
        onCancel={handleCloseModal}
        onSubmit={handleSubmit}
        editingEmployee={editingEmployee}
        loading={submitting}
      />
    </div>
  );
};

export default EmployeePage;
