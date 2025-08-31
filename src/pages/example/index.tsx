import { Card, Flex } from "antd";
import TextExample from "./TextExample";
import MTable from "@components/tableComps/MTable";

const Example = () => {
  return (
    <Flex vertical>
      <Card>
        <TextExample />
      </Card>
      <Card>
        <MTable
          columns={[{ title: "ID", dataIndex: "id" }]}
          dataSource={[{ id: 1 }, { id: 2 }, { id: 3 }]}
          rowKey="id"
        />
      </Card>
    </Flex>
  );
};

export default Example;
