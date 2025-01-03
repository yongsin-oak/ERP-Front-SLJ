import { Flex } from "antd";
import Table from "../../components/Table";
import Text from "../../components/Text";

const Employee = () => {
  const columns = [
    {
      title: "ชื่อ-สกุล",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ตำแหน่ง",
      dataIndex: "position",
      key: "position",
    },
  ];
  const data = [
    {
      name: "ยงศิลป์ ลิ้มวิไลกุล",
      position: "Developer",
    },
    {
      name: "Jim Green",
      position: "Developer",
    },
    {
      name: "Joe Black",
    },
  ];
  return (
    <Flex vertical gap={8}>
      <Text h3 semiBold>รายชื่อพนักงาน</Text>
      <Table columns={columns} dataSource={data} />
    </Flex>
  );
};

export default Employee;
