import { Flex } from "antd";
import Table, { ColumnType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Text from "@components/common/Text";
import req from "@utils/common/req";
import { OrderType } from "@interfaces/order";

const HistoryOrder = () => {
  const [orderHistory, setOrderHistory] = useState<OrderType[]>([]);

  const columns: ColumnType<any>[] = [
    {
      title: "ลำดับ",
      key: "order",
      width: 50,
      render: (_val, _record, index) => index + 1,
    },
    {
      title: "หมายเลขคำสั่งซื้อ",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: "วันที่บันทึก",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => dayjs(val).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "ชื่อพนักงาน",
      key: "employee",
      render: (record) =>
        `${record.employee?.firstName ?? ""} ${
          record.employee?.lastName ?? ""
        }`,
      filters: Array.from(
        new Set(
          orderHistory.map(
            (o) => `${o.employee.firstName} ${o.employee.lastName}`
          )
        )
      ).map((name) => ({ text: name, value: name })),
      onFilter: (value, record) =>
        `${record.employee.firstName} ${record.employee.lastName}` === value,
    },
    {
      title: "ชื่อร้านค้า",
      dataIndex: ["shop", "name"],
      key: "shopName",
      sorter: (a, b) => a.shop.name.localeCompare(b.shop.name),
    },
    {
      title: "แพลตฟอร์ม",
      dataIndex: ["shop", "platform"],
      key: "platform",
      filters: Array.from(
        new Set(orderHistory.map((o) => o.shop.platform))
      ).map((p) => ({
        text: p,
        value: p,
      })),
      onFilter: (value, record) => record.shop.platform === value,
    },
    {
      title: "จำนวน",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
    },
    {
      title: "ต้นทุนรวม",
      dataIndex: "totalCostPrice",
      key: "totalCostPrice",
      render: (val) => `${val} บาท`,
    },
    {
      title: "ราคาขายรวม",
      dataIndex: "totalCurrentPrice",
      key: "totalCurrentPrice",
      render: (val) => `${val} บาท`,
    },
  ];

  const onGetOrderHistory = async () => {
    try {
      const res = await req.get("/order", {
        params: {
          limit: 10,
          page: 1,
        },
      });
      setOrderHistory(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    onGetOrderHistory();
  }, []);

  return (
    <Flex vertical gap={8}>
      <Text h3 semiBold>
        Order
      </Text>
      <Table
        columns={columns}
        dataSource={orderHistory}
        bordered
        rowKey="id"
        size="middle"
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) =>
            record.orderDetails?.length ? (
              <Table
                columns={[
                  {
                    title: "ลำดับ",
                    render: (_val, _rec, index) => index + 1,
                    width: 60,
                  },
                  {
                    title: "บาร์โค้ดสินค้า",
                    dataIndex: "productBarcode",
                  },
                  {
                    title: "ชื่อสินค้า",
                    dataIndex: "productName",
                  },
                  {
                    title: "จำนวน",
                    dataIndex: "quantity",
                  },
                  {
                    title: "วันที่เพิ่ม",
                    dataIndex: "createdAt",
                    render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
                  },
                ]}
                dataSource={record.orderDetails}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <Text>ไม่มีข้อมูลสินค้า</Text>
            ),
        }}
      />
    </Flex>
  );
};

export default HistoryOrder;
