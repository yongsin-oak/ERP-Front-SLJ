import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Space,
} from "antd";
import FormItem from "../../../components/FormItem";
import Select from "../../../components/Select";
import { useForm, useWatch } from "antd/es/form/Form";
import {
  ScanOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TikTokFilled,
  UserOutlined,
} from "@ant-design/icons";
import Text from "../../../components/Text";
import { useState } from "react";
import { DefaultOptionType } from "antd/es/select";
import { allShop, platform, tiktokShop } from "./allShop";
import ShopeeIcon from "../../../assets/icon/platform/Shopee";
import LazadaIcon from "../../../assets/icon/platform/Lazada";
import { isEmpty } from "lodash";
import { onInputNoSpecialChars } from "../../../utils/filteredInput";
import Editable from "../../../components/Editable";
import { ColumnType } from "antd/es/table";

const RecordOrder = () => {
  const orderNumberText = "หมายเลขคำสั่งซื้อ / หมายเลขพัสดุ";
  const iconSize = 30;
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(
    ""
  );
  const [recording, setRecording] = useState<boolean>(false);
  const [orderNumberForm] = useForm();
  const currentEmployee = useWatch("employee", orderNumberForm);
  const currentPlatform = useWatch("platform", orderNumberForm);
  const currentShop = useWatch("shop", orderNumberForm);
  const employee: DefaultOptionType[] = [
    {
      label: "เดฟ",
      value: "Dave",
    },
    {
      label: "มอส",
      value: "Mos",
    },
  ];
  const platformIcon = () => {
    switch (currentPlatform) {
      case "Shopee":
        return <ShopeeIcon width={iconSize} height={iconSize} />;
      case "Lazada":
        return <LazadaIcon width={iconSize} height={iconSize} />;
      case "Tiktok":
        return <TikTokFilled style={{ fontSize: iconSize }} />;
      default:
        return <></>;
    }
  };
  const onFinish = () => {
    const { orderNumber } = orderNumberForm.getFieldsValue();
    setCurrentOrderNumber(orderNumber);
    setRecording(true);
    orderNumberForm.resetFields(["orderNumber"]);
  };
  const onPlatformChange = (val: string) => {
    const tiktokShops = ["ทรัพย์ล้นใจ", "เจ้าสัวบรรจุภัณฑ์"];
    if (val === "Tiktok" && !tiktokShops.includes(currentShop)) {
      orderNumberForm.setFieldsValue({ shop: undefined });
    }
  };
  const columns: ColumnType[] &
    {
      editable?: boolean;
      number?: boolean;
      dataIndex: string;
    }[] = [
    {
      title: "ลำดับ",
      dataIndex: "order",
      width: 50,
      align: "center",
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "productName",
      ellipsis: true,
    },
    {
      title: "จำนวน",
      dataIndex: "productQuantity",
      editable: true,
      number: true,
      ellipsis: true,
    },
    {
      title: "บาร์โค้ด",
      dataIndex: "productBarcode",
      editable: true,
      ellipsis: true,
    },
  ];
  return (
    <Card>
      <Flex gap={16} vertical>
        <Form form={orderNumberForm} onFinish={onFinish} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col lg={8} sm={24} xs={24}>
              <FormItem
                name={["employee"]}
                requiredMessage="กรุณาเลือกผู้บันทึก"
                label="ผู้บันทึก"
              >
                <Select
                  prefix={<UserOutlined />}
                  placeholder="ผู้บันทึก"
                  disabled={recording}
                  allowClear
                  style={{ width: "100%" }}
                  options={employee}
                />
              </FormItem>
            </Col>
            <Col lg={8} sm={24} xs={24}>
              <FormItem
                name={["platform"]}
                requiredMessage="กรุณาเลือกแพลตฟอร์ม"
                label="แพลตฟอร์ม"
              >
                <Select
                  prefix={<ShoppingOutlined />}
                  placeholder="แพลตฟอร์ม"
                  disabled={isEmpty(currentEmployee) || recording}
                  allowClear
                  style={{ width: "100%" }}
                  options={platform}
                  onChange={onPlatformChange}
                />
              </FormItem>
            </Col>
            <Col lg={8} sm={24} xs={24}>
              <FormItem
                name={["shop"]}
                requiredMessage="กรุณาเลือกร้านค้า"
                label="ร้านค้า"
              >
                <Select
                  prefix={<ShopOutlined />}
                  disabled={isEmpty(currentPlatform) || recording}
                  placeholder="ร้านค้า"
                  allowClear
                  style={{ width: "100%" }}
                  options={currentPlatform === "Tiktok" ? tiktokShop : allShop}
                />
              </FormItem>
            </Col>
            <Col lg={24} sm={24} xs={24}>
              <FormItem
                name={["orderNumber"]}
                requiredMessage={`กรุณากรอก${orderNumberText}`}
                label={orderNumberText}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    prefix={<ScanOutlined />}
                    placeholder={orderNumberText}
                    disabled={isEmpty(currentShop) || recording}
                    onInput={onInputNoSpecialChars}
                  />
                  <Button type="primary" htmlType="submit">
                    บันทึก
                  </Button>
                </Space.Compact>
              </FormItem>
            </Col>
          </Row>
        </Form>
        {recording && (
          <>
            <Divider>รายการสินค้า</Divider>
            <Flex justify="space-between" align="center" gap={16}>
              <Flex align="center" gap={8}>
                {platformIcon()}
                <Text h6 medium>
                  {currentShop}
                </Text>
              </Flex>
              <Text h6 medium center>
                {`หมายเลขคำสั่งซื้อ : `}
                {currentOrderNumber}
              </Text>
            </Flex>
            <Editable
              columns={columns}
              onCancel={() => {
                setRecording(false);
              }}
            />
          </>
        )}
      </Flex>
    </Card>
  );
};

export default RecordOrder;
