import Text from "@components/common/Text";
import { MTable } from "@components/tableComps";
import { OrderType } from "@types";
import req from "@lib/config/req";
import { Card, DatePicker, Flex, Statistic } from "antd";
import Table, { ColumnType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

const HistoryOrder = () => {
  const [orderHistory, setOrderHistory] = useState<OrderType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);

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
        new Set(
          orderHistory.map((o) => dayjs(o.createdAt).format("DD/MM/YYYY"))
        )
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
      filters: Array.from(new Set(orderHistory.map((o) => o.shop.name))).map(
        (name) => ({ text: name, value: name })
      ),
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
    } catch (error) {
      console.log(error);
    }
  };

  const onGetOrderHistory = async () => {
    setLoading(true);
    try {
      const res = await req.get("/order", {
        params: {
          limit: 1000, // ดึงข้อมูลทั้งหมดมาจัดกลุ่มเอง
          page: 1,
        },
      });
      setOrderHistory(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onGetOrderHistory();
  }, []);

  // Group orders by date
  const groupedByDate = useMemo(() => {
    const groups = orderHistory.reduce((acc, order) => {
      const date = dayjs(order.createdAt).format("YYYY-MM-DD");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(order);
      return acc;
    }, {} as Record<string, OrderType[]>);

    // Sort dates descending
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [orderHistory]);

  // Get available dates for date picker
  const availableDates = useMemo(
    () => groupedByDate.map(([date]) => date),
    [groupedByDate]
  );

  // Filter orders by selected date
  const filteredOrders = useMemo(() => {
    if (!selectedDate) return orderHistory;
    const dateStr = selectedDate.format("YYYY-MM-DD");
    return orderHistory.filter(
      (order) => dayjs(order.createdAt).format("YYYY-MM-DD") === dateStr
    );
  }, [orderHistory, selectedDate]);

  // Statistics
  const stats = useMemo(() => {
    const data = selectedDate ? filteredOrders : orderHistory;
    return {
      total: data.length,
    };
  }, [orderHistory, filteredOrders, selectedDate]);

  return (
    <Flex vertical gap={16}>
      {/* Header with Date Filter */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
        <Text h3 semiBold>
          ประวัติการบันทึกคำสั่งซื้อ
        </Text>
        <DatePicker
          placeholder="กรองวันที่"
          value={selectedDate}
          onChange={setSelectedDate}
          format="DD/MM/YYYY"
          allowClear
          disabledDate={(current) => {
            if (!current) return false;
            const dateStr = current.format("YYYY-MM-DD");
            return !availableDates.includes(dateStr);
          }}
          style={{ width: 200 }}
        />
      </Flex>

      {/* Summary Card */}
      <Card>
        <Statistic
          title={
            selectedDate
              ? `คำสั่งซื้อวันที่ ${selectedDate.format("DD/MM/YYYY")}`
              : "คำสั่งซื้อทั้งหมด"
          }
          value={stats.total}
          suffix="รายการ"
        />
      </Card>

      {/* Main Table */}
      <MTable
        columns={columns}
        dataSource={filteredOrders}
        bordered
        rowKey="id"
        size="middle"
        pagination={{ pageSize: 10 }}
        searchable
        searchKeys={[
          "id",
          "shop.name",
          "employee.firstName",
          "employee.lastName",
          "employee.nickname",
        ]}
        loading={loading}
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
                    title: "จำนวน (Pack)",
                    dataIndex: "quantityPack",
                  },
                  {
                    title: "จำนวน (Carton)",
                    dataIndex: "quantityCarton",
                    render: (val) => val || "-",
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
