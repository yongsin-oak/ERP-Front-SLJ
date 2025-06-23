import { useWindowSize } from "@uidotdev/usehooks";
import { Card, Col, Flex, Modal, Row, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import MButton from "../../components/common/MButton";
import Table from "../../components/tableComps/Table";
import { isMobile } from "../../utils/responsive";
import ProductFormComp from "./form/ProductForm";
import { onGetProducts } from "./hooks/product.hook";
import { ProductData } from "./interface/interface";
import { additionalColumns, essentialColumns } from "./table/productColumns";

const { Text } = Typography;

const ProductStock = () => {
  const [data, setData] = useState<ProductData[] | undefined>();
  const [open, setOpen] = useState(false);
  const [form] = useForm();
  const { width } = useWindowSize();
  const mobile = isMobile(width);

  useEffect(() => {
    onGetProducts({ setData });
  }, []);

  useEffect(() => {
    form.resetFields();
  }, [open, form]);

  const renderCardList = () => (
    <Flex vertical gap={12}>
      {data?.map((item) => (
        <Card key={item.barcode} title={item.name} size="small">
          <Row justify="space-between">
            <Col span={12}>
              <Text strong>บาร์โค้ด:</Text> {item.barcode}
            </Col>
            <Col span={12}>
              <Text strong>คงเหลือ:</Text> {item.remaining}
            </Col>
          </Row>
          <Row justify="space-between">
            <Col span={12}>
              <Text strong>ยี่ห้อ:</Text> {item?.brand?.name || "-"}
            </Col>
            <Col span={12}>
              <Text strong>หมวดหมู่:</Text> {item?.category?.name || "-"}
            </Col>
          </Row>
          <Row justify="space-between">
            <Col span={12}>
              <Text strong>ราคาขาย/แพ็ค:</Text> {item.sellPrice?.pack || 0}
            </Col>
            <Col span={12}>
              <Text strong>ราคาขาย/ลัง:</Text> {item.sellPrice?.carton || 0}
            </Col>
          </Row>
        </Card>
      ))}
    </Flex>
  );

  return (
    <Flex vertical gap={10}>
      <Flex justify="space-between" align="center">
        <Col>
          {/* <ExcelUpload onSave={onUploadProducts} columns={columns} /> */}
        </Col>
        <Col>
          <MButton onClick={() => setOpen(true)}>Upload</MButton>
        </Col>
      </Flex>

      {mobile ? (
        renderCardList()
      ) : (
        <Table
          columns={essentialColumns}
          dataSource={data}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                columns={additionalColumns}
                dataSource={[record]}
                pagination={false}
                scroll={{ x: 800 }}
              />
            ),
            defaultExpandedRowKeys: ["0"],
          }}
          scroll={{ x: 800 }}
          size="small"
          rowKey="barcode"
        />
      )}

      <Modal
        title="Upload Products"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
      >
        <ProductFormComp form={form} setData={setData} setOpen={setOpen} />
      </Modal>
    </Flex>
  );
};

export default ProductStock;
