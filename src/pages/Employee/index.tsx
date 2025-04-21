import { Button, Flex, Form, Modal, SelectProps } from "antd";
import Table from "../../components/Table";
import Text from "../../components/Text";
import { useEffect, useState } from "react";
import req from "../../utils/req";
import { ColumnType } from "antd/es/table";
import dayjs from "dayjs";
import ExcelUpload from "../../components/ExcelUpload";
import FormInputs from "../../components/FormInputs";
import { addEmployeeInputFields } from "./inputField";
import { isEmpty } from "lodash";
import { useForm } from "antd/es/form/Form";
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phoneNumber: string;
  startDate: string;
  department: string;
  bankName: string;
  bankAccount: string;
}
const Employee = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [visibleAddEmployeeModal, setVisibleAddEmployeeModal] = useState(false);
  const [bankNames, setBankNames] = useState<SelectProps["options"]>([]);
  const [form] = useForm();
  const columns: ColumnType[] &
    {
      information?: string;
    }[] = [
    {
      title: "ชื่อ - นามสกุล",
      dataIndex: "name",
      key: "name",
      render(_value, record) {
        return `${record.firstName} ${record.lastName}`;
      },
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
      title: "วันที่เริ่มงาน",
      dataIndex: "startDate",
      key: "startDate",
      information: "ตัวอย่าง: 01/01/2564",
      render: (val) => dayjs(val).format("DD/MM/BBBB"),
    },
    {
      title: "แผนก",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Flex gap={8}>
          <Button type="link">แก้ไข</Button>
        </Flex>
      ),
      width: 80,
    },
  ];
  const onGetBankName = async () => {
    try {
      const res = await req.get("/bankNames");
      setBankNames(
        Object.keys(res.data.data.th).map((key: string) => ({
          label: res.data.data.th[key].thai_name,
          value: key,
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };
  const onGetEmployee = async () => {
    try {
      const res = await req.get("/employee", {
        params: {
          limit: 10,
          page: 1,
        },
      });
      setEmployees(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const onPostEmployee = async (values: any) => {
    try {
      console.log(values);
      const res = await req.post("/employee", values);
      setVisibleAddEmployeeModal(false);
      onGetEmployee();
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (visibleAddEmployeeModal && !isEmpty(form.getFieldsValue())) {
      form.resetFields();
    }
  }, [visibleAddEmployeeModal, form]);
  useEffect(() => {
    onGetEmployee();
    onGetBankName();
  }, []);
  return (
    <Flex vertical gap={8}>
      <Text h3 semiBold>
        รายชื่อพนักงาน
      </Text>
      <Flex justify="space-between" gap={8}>
        <ExcelUpload
          onSave={() => {}}
          columns={[
            {
              title: "ชื่อจริง",
              key: "firstName",
            },
            {
              title: "นามสกุล",
              key: "lastName",
            },
            ...columns.filter((c) => c.key !== "action" && c.key !== "name"),
          ]}
        />
        <Button type="primary" onClick={() => setVisibleAddEmployeeModal(true)}>
          เพิ่มพนักงาน
        </Button>
      </Flex>
      <Modal
        open={visibleAddEmployeeModal}
        footer={null}
        closable={false}
        title="เพิ่มพนักงาน"
      >
        <Form form={form} onFinish={onPostEmployee} layout="vertical">
          <FormInputs
            formProps={form}
            onFinish={(vals) => {
              console.log(vals);
            }}
            gutter={[16, 16]}
            inputFields={[
              ...addEmployeeInputFields,
              {
                name: "bank",
                label: "ชื่อธนาคาร",
                span: 24,
                inputComponent: "select",
                inputProps: {
                  options: bankNames,
                  placeholder: "ชื่อธนาคาร",
                },
              },
              {
                name: "bankAccount",
                label: "เลขบัญชี",
                span: 24,
                inputProps: {
                  placeholder: "เลขบัญชี",
                },
              },
            ]}
          >
            <Flex justify="end" gap={8}>
              <Button htmlType="submit" type="primary">
                เพิ่มพนักงาน
              </Button>
              <Button
                onClick={() => setVisibleAddEmployeeModal(false)}
                type="default"
              >
                ยกเลิก
              </Button>
            </Flex>
          </FormInputs>
        </Form>
      </Modal>
      <Table
        columns={columns}
        dataSource={employees}
        bordered
        rowKey="id"
        size="small"
      />
    </Flex>
  );
};

export default Employee;
