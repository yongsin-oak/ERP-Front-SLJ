import { Button, Col, Flex, Form, Modal } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import req from "../../utils/req";
import Table from "../../components/Table";
import dayjs from "dayjs";
import ExcelUpload from "../../components/ExcelUpload";
import { ProductProp } from "./interface";
import FormInputs from "../../components/FormInputs";
import { useForm } from "antd/es/form/Form";
import { addProductInputFields } from "./inputField";

const ProductStock = () => {
  const [data, setData] = useState<ProductProp[]>();
  const [uploadModal, setUploadModal] = useState(false);
  const [form] = useForm();
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
      dataIndex: "brandName",
      key: "brandName",
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
  useEffect(() => {
    onGetProducts();
  }, []);
  return (
    <Flex vertical gap={10}>
      <Flex justify="space-between" align="center">
        <Col>
          <ExcelUpload onSave={onUploadProducts} columns={columns} />
        </Col>
        <Col>
          <Button
            onClick={() => {
              setUploadModal(true);
            }}
          >
            Upload
          </Button>
        </Col>
      </Flex>
      <Table
        columns={columns}
        dataSource={data}
        size="small"
        rowKey="barcode"
      />
      <Modal
        title="Upload Products"
        open={uploadModal}
        onCancel={() => {
          setUploadModal(false);
        }}
        footer={null}
        centered
      >
        <Form form={form} onFinish={() => {}} layout="vertical">
          <FormInputs
            formProps={form}
            onFinish={(vals) => {
              console.log(vals);
            }}
            gutter={[16, 16]}
            inputFields={addProductInputFields}
          >
            <Flex justify="end" gap={8}>
              <Button htmlType="submit" type="primary">
                เพิ่มสินค้า
              </Button>
              <Button onClick={() => setUploadModal(false)} type="default">
                ยกเลิก
              </Button>
            </Flex>
          </FormInputs>
        </Form>
      </Modal>
    </Flex>
  );
};

export default ProductStock;
