import { Flex } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import req from "../../utils/req";
import Table from "../../components/Table";
import dayjs from "dayjs";
import ExcelUpload from "../../components/ExcelUpload";

const ProductStock = () => {
  const [data, setData] = useState<
    {
      barcode: string;
      name: string;
      brand: string;
      category: string;
      costPrice: number;
      currentPrice: number;
      createdAt: string;
      updatedAt: string;
    }[]
  >();
  const onGetProducts = async () => {
    try {
      const res = await req.get("/products", {
        params: {
          page: 1,
          limit: 10,
        },
      });
      setData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const onUploadProducts = async (data: unknown[]) => {
    try {
      const res = await req.post("/products", {
        data,
      });
      console.log(res);
    } catch (error) {
      console.log(error);
    } finally {
      onGetProducts();
    }
  };
  const columns: ColumnsType = [
    {
      title: "บาร์โค้ด",
      dataIndex: "barcode",
      key: "barcode",
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ยี่ห้อ",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "หมวดหมู่",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "ราคาต้นทุน",
      dataIndex: "costPrice",
      key: "costPrice",
    },
    {
      title: "ราคาปัจจุบัน",
      dataIndex: "currentPrice",
      key: "currentPrice",
    },
    {
      title: "วันที่เพิ่ม",
      dataIndex: "createdAt",
      render: (val) => dayjs(val).format("DD/MM/BBBB HH:mm:ss"),
      key: "createdAt",
    },
    {
      title: "วันที่แก้ไข",
      dataIndex: "updatedAt",
      render: (val) => dayjs(val).format("DD/MM/BBBB HH:mm:ss"),
      key: "updatedAt",
    },
  ];
  // console.log(currentDataUpload);
  useEffect(() => {
    onGetProducts();
  }, []);
  return (
    <Flex vertical gap={10}>
      <ExcelUpload onSave={onUploadProducts} columns={columns} />
      {/* <Button onClick={onUploadProducts}>test back</Button> */}
      <Table
        columns={columns}
        dataSource={data}
        size="small"
        rowKey="barcode"
      />
    </Flex>
  );
};

export default ProductStock;
