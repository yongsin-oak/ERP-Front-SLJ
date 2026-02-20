import { Flex, Form, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import { ColumnType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import FormInputs from "@components/Form/FormInputs";
import MButton from "@components/common/MButton";
import MTable from "@components/tableComps/MTable";
import Text from "@components/common/Text";
import req from "@lib/config/req";
import { EmployeeType } from "@types";
import { addEmployeeInputFields } from "./inputField";
import { Role } from "../types";

const Employee = () => {
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [visibleAddEmployeeModal, setVisibleAddEmployeeModal] = useState(false);
  const [form] = useForm();

  const onEditModalEmployee = (record: EmployeeType) => {
    console.log(record);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      nickname: record.nickname,
      phoneNumber: record.phoneNumber,
      department: record.department,
      startDate: dayjs(record.startDate),
    });
    setVisibleAddEmployeeModal(true);
  };

  const columns: ColumnType<EmployeeType>[] & { information?: string }[] = [
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
      render: (_, record: EmployeeType) => (
        <Flex gap={8}>
          <MButton type="link" onClick={() => onEditModalEmployee(record)}>
            แก้ไข
          </MButton>
        </Flex>
      ),
      width: 80,
    },
  ];

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
  const onPostEmployee = async (values: {
    firstName: string;
    lastName: string;
    nickname: string;
    phoneNumber: string;
    startDate: dayjs.Dayjs;
    department: {
      label: string;
      value: Role;
    };
  }) => {
    try {
      const res = await req.post("/employee", {
        ...values,
        department: values.department.value,
        startDate: values.startDate.toISOString(),
      });
      setVisibleAddEmployeeModal(false);
      onGetEmployee();
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    onGetEmployee();
  }, []);
  return (
    <Flex vertical gap={8}>
      <Text h3 semiBold>
        รายชื่อพนักงาน
      </Text>
      <Flex justify="space-between" gap={8}>
        <MButton onClick={() => setVisibleAddEmployeeModal(true)}>
          เพิ่มพนักงาน
        </MButton>
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
            gutter={[16, 16]}
            inputFields={addEmployeeInputFields}
          >
            <Flex justify="end" gap={8}>
              <MButton htmlType="submit">เพิ่มพนักงาน</MButton>
              <MButton
                onClick={() => setVisibleAddEmployeeModal(false)}
                type="default"
              >
                ยกเลิก
              </MButton>
            </Flex>
          </FormInputs>
        </Form>
      </Modal>
      <MTable<EmployeeType>
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
