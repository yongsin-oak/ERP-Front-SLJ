import { Flex } from "antd";
import TextExample from "./TextExample";
import { useTheme } from "@emotion/react";
import CardList from "@components/tableComps/CardList";
import MTable from "@components/tableComps/Table";

const Example = () => {
  const theme = useTheme();
  return (
    <Flex vertical>
      <TextExample />
      <CardList
        data={[
          {
            id: "1",
            title: "Product 1",
            status: { value: 5, minValue: 2, label: "Stock" },
            mainFields: [
              { label: "Price", value: 100, type: "price" },
              { label: "Weight", value: 1.5, type: "number" },
            ],
            additionalFields: [
              { label: "Description", value: "This is a great product" },
            ],
          },
        ]}
      />
      <MTable
        searchTerm="Jo"
        dataSource={[
          {
            key: "1",
            fullName: "John Doe",
            phone: "1234567890",
            email: "john.doe@example.com",
          },
        ]}
        columns={[
          {
            title: "Full Name",
            dataIndex: "fullName",
            key: "fullName",
          },
          {
            title: "Phone",
            dataIndex: "phone",
            key: "phone",
          },
          {
            title: "Email",
            dataIndex: "email",
            key: "email",
          },
        ]}
        tableName="ลูกค้า"
        cardProps={{
          transformData: (data) =>
            data.map((customer) => ({
              id: customer.id,
              title: customer.fullName,
              subtitle: customer.phone,
              status: {
                value: customer.totalOrders,
                label: "ออเดอร์",
              },
              mainFields: [
                { label: "อีเมล", value: customer.email },
                { label: "ที่อยู่", value: customer.address },
                { label: "วันที่สมัคร", value: customer.createdAt },
              ],
            })),
        }}
      />
    </Flex>
  );
};

export default Example;
