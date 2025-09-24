import { Flex } from "antd";
import Table, { ColumnType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Text from "@components/common/Text";
import req from "@utils/common/req";
import { OrderDetailType, OrderType } from "@interfaces/order";
import { MTable } from "@components/tableComps";

const HistoryOrder = () => {
  const [orderHistory, setOrderHistory] = useState<OrderType[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetailType[]>([]);

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
      filters: Array.from(
        new Set(orderHistory.map((o) => dayjs(o.createdAt).format("DD/MM/YYYY")))
      ).map((date) => ({ text: date, value: date })),
      onFilter: (value, record) =>
        dayjs(record.createdAt).format("DD/MM/YYYY") === value,
    },
    {
      title: "ชื่อพนักงาน",
      key: "employee",
      render: (record) =>
        `${record?.employee?.firstName ?? ""} ${
          record?.employee?.lastName ?? ""
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
      filters: Array.from(
        new Set(orderHistory.map((o) => o.shop.name))
      ).map((name) => ({ text: name, value: name })),
      onFilter: (value, record) => record.shop.name === value,
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
  ];

  const onGetOrderDetails = async (orderId: string) => {
    try {
      const res = await req.get(`/order-detail/${orderId}`);
      console.log(res.data.data);
      setOrderDetails(res.data.data.orderDetails);
    } catch (error) {
      console.log(error);
    }
  };

  const onGetOrderHistory = async () => {
    try {
      const res = await req.get("/order", {
        params: {
          limit: 10,
          page: 1,
        },
      });
      setOrderHistory(res.data.data);
      console.log(res.data.data);
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
        ประวัติการบันทึกคำสั่งซื้อ
      </Text>
      <MTable
        columns={columns}
        dataSource={orderHistory}
        bordered
        rowKey="id"
        size="middle"
        pagination={{ pageSize: 10 }}
        expandable={{
          onExpand(_expanded, record) {
            onGetOrderDetails(record.id);
          },
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
