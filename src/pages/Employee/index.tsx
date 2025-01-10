import { Button, Flex, Modal, SelectProps } from "antd";
import Table from "../../components/Table";
import Text from "../../components/Text";
import { useEffect, useState } from "react";
import req from "../../utils/req";
import { ColumnType } from "antd/es/table";
import dayjs from "dayjs";
import ExcelUpload from "../../components/ExcelUpload";
import FormInputs from "../../components/FormInputs";
import { addEmployeeInputFields } from "./inputField";

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
  const columns: ColumnType[] = [
    {
      title: "ชื่อจริง",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "นามสกุล",
      dataIndex: "lastName",
      key: "lastName",
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
      render: (val) => dayjs(val).format("DD/MM/BBBB"),
    },
    {
      title: "แผนก",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "บัญชีธนาคาร",
      dataIndex: "bankName",
      key: "bankName",
      render: (val, record) => `${val} ${record.bankAccount}`,
    },
  ];

  const onGetBankName = async () => {
    const res = await req.get("/bankNames");
    setBankNames(
      Object.keys(res.data.data.th).map((key: string) => ({
        label: res.data.data.th[key].thai_name,
        value: key,
      }))
    );
  };
  const onGetEmployees = async () => {
    const res = await req.get("/employees", {
      params: {
        limit: 10,
        page: 1,
      },
    });
    setEmployees(res.data.data);
  };
  useEffect(() => {
    onGetEmployees();
    onGetBankName();
  }, []);
  return (
    <Flex vertical gap={8}>
      <Text h3 semiBold>
        รายชื่อพนักงาน
      </Text>
      <Flex justify="end" gap={8}>
        <ExcelUpload onSave={() => {}}></ExcelUpload>
        <Button type="primary" onClick={() => setVisibleAddEmployeeModal(true)}>
          เพิ่มพนักงาน
        </Button>
      </Flex>
      <Modal
        open={visibleAddEmployeeModal}
        okText="เพิ่มพนักงาน"
        cancelText="ยกเลิก"
        onCancel={() => setVisibleAddEmployeeModal(false)}
        onOk={() => setVisibleAddEmployeeModal(false)}
        closable={false}
        title="เพิ่มพนักงาน"
      >
        <Flex vertical gap={16}>
          <FormInputs
            onFinish={(val) => console.log(val)}
            inputFields={[
              ...addEmployeeInputFields,
              {
                name: "bankName",
                label: "ชื่อธนาคาร",
                span: 24,
                selectInput: true,
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
            layout="horizontal"
          />
        </Flex>
      </Modal>
      <Table columns={columns} dataSource={employees} bordered rowKey="id" />
    </Flex>
  );
};

export default Employee;
