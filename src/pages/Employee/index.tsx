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
      key: "1",
      name: "ยงศิลป์ ลิ้มวิไลกุล",
      position: "Developer",
    },
    {
      key: "2",
      name: "Jim Green",
      position: "Developer",
    },
    {
      key: "3",
      name: "Joe Black",
      position: "Developer",
    },
  ];
  return (
    <Flex vertical gap={8}>
      <Text h3 semiBold>
        รายชื่อพนักงาน
      </Text>
      <Table columns={columns} dataSource={data} />
    </Flex>
  );
};

export default Employee;
