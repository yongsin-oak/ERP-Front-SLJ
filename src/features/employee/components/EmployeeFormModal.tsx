import { Form, Modal, Input, Select, DatePicker, Row, Col } from "antd";
import { useEffect } from "react";
import { employeeFormFields } from "./EmployeeForm.config";
import type { Employee, CreateEmployeeDto } from "../types";
import dayjs from "dayjs";

interface EmployeeFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateEmployeeDto) => Promise<void>;
  editingEmployee?: Employee | null;
  loading?: boolean;
}

export const EmployeeFormModal = ({
  open,
  onCancel,
  onSubmit,
  editingEmployee,
  loading,
}: EmployeeFormModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && editingEmployee) {
      form.setFieldsValue({
        ...editingEmployee,
        startDate:
          editingEmployee.startDate ? dayjs(editingEmployee.startDate) : null,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editingEmployee, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        startDate:
          values.startDate ? dayjs(values.startDate).format("YYYY-MM-DD") : "",
      };
      await onSubmit(submitData);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={editingEmployee ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงาน"}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      okText={editingEmployee ? "บันทึก" : "เพิ่ม"}
      cancelText="ยกเลิก"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          {employeeFormFields.map((field) => (
            <Col span={field.span} key={field.name}>
              <Form.Item
                name={field.name}
                label={field.label}
                rules={[
                  {
                    required: field.required,
                    message: `กรุณากรอก${field.label}`,
                  },
                ]}
              >
                {field.inputComponent === "select" ?
                  <Select
                    placeholder={field.inputProps?.placeholder}
                    options={field.inputProps?.options}
                  />
                : field.inputComponent === "datePicker" ?
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder={field.inputProps?.placeholder}
                    format={field.inputProps?.format}
                  />
                : <Input placeholder={field.inputProps?.placeholder} />}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
};
