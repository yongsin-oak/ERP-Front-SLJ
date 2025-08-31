import {
  ScanOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TikTokFilled,
  UserOutlined,
} from "@ant-design/icons";
import LazadaIcon from "@assets/icon/platform/Lazada";
import ShopeeIcon from "@assets/icon/platform/Shopee";
import MButton from "@components/common/MButton";
import MSelect from "@components/common/MSelect";
import Text from "@components/common/Text";
import MFormItem from "@components/Form/MFormItem";
import { onInputNoSpecialChars } from "@utils/common/filteredInput";
import req from "@utils/common/req";
import { Card, Col, Divider, Flex, Form, Input, Row, Space } from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import { DefaultOptionType } from "antd/es/select";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { allShop, platform, tiktokShop } from "./allShop";

const ICON_SIZE = 30;

const Ecommerce = () => {
  const orderNumberText = "หมายเลขคำสั่งซื้อ / หมายเลขพัสดุ";
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(
    ""
  );
  const [recording, setRecording] = useState<boolean>(false);
  const [employees, setEmployees] = useState<DefaultOptionType[]>([]);
  const [orderNumberForm] = useForm();
  // const currentEmployee = useWatch("employee", orderNumberForm);
  const currentPlatform = useWatch("platform", orderNumberForm);
  const currentShop = useWatch("shop", orderNumberForm);
  const navigation = useNavigate();
  const platformIcon = (size?: number | string) => {
    switch (currentPlatform) {
      case "Shopee":
        return (
          <ShopeeIcon width={size ?? ICON_SIZE} height={size ?? ICON_SIZE} />
        );
      case "Lazada":
        return (
          <LazadaIcon width={size ?? ICON_SIZE} height={size ?? ICON_SIZE} />
        );
      case "Tiktok":
        return <TikTokFilled style={{ fontSize: size ?? ICON_SIZE }} />;
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
  // const columns = [
  //   {
  //     title: "ลำดับ",
  //     dataIndex: "order",
  //     width: 50,
  //     align: "center",
  //   },
  //   {
  //     title: "ชื่อสินค้า",
  //     dataIndex: "productName",
  //     ellipsis: true,
  //   },
  //   {
  //     title: "จำนวน",
  //     dataIndex: "productAmount",
  //     editable: true,
  //     number: true,
  //     ellipsis: true,
  //   },
  //   {
  //     title: "บาร์โค้ด",
  //     dataIndex: "productBarcode",
  //     editable: true,
  //     ellipsis: true,
  //   },
  // ];
  // const onPostOrder = async (data: any) => {
  //   try {
  //     const res = await req.post("/orders", {
  //       employeeId: currentEmployee,
  //       platform: currentPlatform,
  //       shop: currentShop,
  //       id: currentOrderNumber,
  //       products: data.map((product: any) => ({
  //         productBarcode: product.productBarcode,
  //         productAmount: product.productAmount,
  //       })),
  //     });
  //     console.log(res);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  const onGetEmployees = async (limit: number) => {
    try {
      const res = await req.get("/employee", {
        params: {
          page: 1,
          limit,
        },
      });
      if (res.data.total > limit) {
        onGetEmployees(res.data.total);
        return;
      }
      setEmployees(
        res.data.data.map((employee: { nickname: string; id: number }) => ({
          label: employee.nickname,
          value: employee.id,
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    onGetEmployees(300);
  }, []);
  return (
    <Flex vertical>
      <MButton
        style={{
          width: "fit-content",
          marginBottom: 16,
          alignSelf: "flex-end",
        }}
        type="primary"
        size="large"
        onClick={() => navigation("/sell/ecommerce/history")}
      >
        ประวัติการบันทึก
      </MButton>
      <Card>
        <Flex gap={16} vertical>
          <Form form={orderNumberForm} onFinish={onFinish} layout="vertical">
            <Row gutter={[16, 16]}>
              <Col lg={8} sm={24} xs={24}>
                <MFormItem
                  name={["employee"]}
                  requiredMessage="กรุณาเลือกผู้บันทึก"
                  label="ผู้บันทึก"
                >
                  <MSelect
                    prefix={<UserOutlined />}
                    placeholder="ผู้บันทึก"
                    disabled={recording}
                    allowClear
                    style={{ width: "100%" }}
                    options={employees}
                  />
                </MFormItem>
              </Col>
              <Col lg={8} sm={24} xs={24}>
                <MFormItem
                  name={["platform"]}
                  requiredMessage="กรุณาเลือกแพลตฟอร์ม"
                  label="แพลตฟอร์ม"
                >
                  <MSelect
                    prefix={
                      currentPlatform ? (
                        platformIcon("1em")
                      ) : (
                        <ShoppingOutlined />
                      )
                    }
                    placeholder="แพลตฟอร์ม"
                    allowClear
                    style={{ width: "100%" }}
                    options={platform}
                    onChange={onPlatformChange}
                  />
                </MFormItem>
              </Col>
              <Col lg={8} sm={24} xs={24}>
                <MFormItem
                  name={["shop"]}
                  requiredMessage="กรุณาเลือกร้านค้า"
                  label="ร้านค้า"
                >
                  <MSelect
                    prefix={<ShopOutlined />}
                    placeholder="ร้านค้า"
                    allowClear
                    style={{ width: "100%" }}
                    options={
                      currentPlatform === "Tiktok" ? tiktokShop : allShop
                    }
                  />
                </MFormItem>
              </Col>
              <Col lg={24} sm={24} xs={24}>
                <MFormItem
                  name={["orderNumber"]}
                  requiredMessage={`กรุณากรอก${orderNumberText}`}
                  label={orderNumberText}
                >
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      prefix={<ScanOutlined />}
                      placeholder={orderNumberText}
                      onInput={onInputNoSpecialChars}
                    />
                    <MButton htmlType="submit">บันทึก</MButton>
                  </Space.Compact>
                </MFormItem>
              </Col>
            </Row>
          </Form>
          {true && (
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
              {/* <OrderEditable
                columns={columns}
                onCancel={() => {
                  setRecording(false);
                }}
                onConfirm={(data) => {
                  onPostOrder(data);
                  setRecording(false);
                }}
                onAddItem={(productBarcode, dataSource, setDataSource) => {
                  const newData = {
                    order: dataSource.length + 1,
                    productName: "",
                    productAmount: 1,
                    productBarcode,
                  };
                  setDataSource([...dataSource, newData]);
                }}
              /> */}
            </>
          )}
        </Flex>
      </Card>
    </Flex>
  );
};

export default Ecommerce;
