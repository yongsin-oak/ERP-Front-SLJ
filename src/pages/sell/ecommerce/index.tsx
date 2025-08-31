import {
  ScanOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TikTokFilled,
  UserOutlined,
} from "@ant-design/icons";
import LazadaIcon from "@assets/icon/platform/Lazada";
import ShopeeIcon from "@assets/icon/platform/Shopee";
import { SearchSelect } from "@components/common";
import MButton from "@components/common/MButton";
import MSelect from "@components/common/MSelect";
import Text from "@components/common/Text";
import MFormItem from "@components/Form/MFormItem";
import { OrderEditable } from "@components/tableComps";
import { onGetShops } from "@hooks/shop";
import { Shop } from "@interfaces/shop";
import { onInputNoSpecialChars } from "@utils/common/filteredInput";
import req from "@utils/common/req";
import {
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Row,
  Space,
} from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import { DefaultOptionType } from "antd/es/select";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { platform } from "./allShop";

const ICON_SIZE = 30;
const ORDER_ID_LABEL = "หมายเลขคำสั่งซื้อ / หมายเลขพัสดุ";

const Ecommerce = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [employees, setEmployees] = useState<DefaultOptionType[]>([]);
  const [orderNumberForm] = useForm();
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | undefined>("");
  const [currentEmployee, currentPlatform, currentShop] = [
    useWatch("employee", orderNumberForm),
    useWatch("platform", orderNumberForm),
    useWatch("shop", orderNumberForm),
  ];
  const navigation = useNavigate();

  const loadShopsData = useCallback(
    async (page: number, limit: number) => {
      if (!currentPlatform) return undefined;
      return await onGetShops({
        page,
        limit,
        platform: currentPlatform,
      });
    },
    [currentPlatform]
  );

  const mapShopsToOptions = useCallback(
    (data: Shop[]) =>
      data.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    []
  );

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
  const onGetEmployees = useCallback(async (limit: number) => {
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
  }, []);

  useEffect(() => {
    onGetEmployees(300);
  }, [onGetEmployees]);
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
                    disabled={recording || !currentEmployee}
                  />
                </MFormItem>
              </Col>
              <Col lg={8} sm={24} xs={24}>
                <MFormItem
                  name={["shop"]}
                  requiredMessage="กรุณาเลือกร้านค้า"
                  label="ร้านค้า"
                >
                  <SearchSelect<Shop>
                    prefix={<ShopOutlined />}
                    placeholder="ร้านค้า"
                    onLoadData={loadShopsData}
                    mapDataToOptions={mapShopsToOptions}
                    autoLoad
                    allowClear
                    onSelect={(_value, option) => {
                      orderNumberForm.setFieldsValue({ shop: option.label });
                    }}
                    style={{ width: "100%" }}
                    disabled={recording || !currentEmployee || !currentPlatform}
                  />
                </MFormItem>
              </Col>
              <Col lg={24} sm={24} xs={24}>
                <MFormItem
                  name={["orderNumber"]}
                  requiredMessage={`กรุณากรอก${ORDER_ID_LABEL}`}
                  label={ORDER_ID_LABEL}
                >
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      prefix={<ScanOutlined />}
                      placeholder={ORDER_ID_LABEL}
                      onInput={onInputNoSpecialChars}
                      disabled={recording || !currentEmployee || !currentPlatform || !currentShop}
                    />
                    <MButton htmlType="submit">บันทึก</MButton>
                  </Space.Compact>
                </MFormItem>
              </Col>
            </Row>
          </Form>
          {(
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
              <OrderEditable
                onAddItem={(data) => {
                  message.success(`เพิ่มสินค้าแล้ว: ${data.data?.barcode}`);
                  console.log("Added item:", data);
                }}
                onConfirm={(data) => {
                  message.success(`บันทึกคำสั่งซื้อ ${data.length} รายการ`);
                  // onPostOrder(data);
                  console.log("Confirmed order:", data);
                }}
              />
            </>
          )}
        </Flex>
      </Card>
    </Flex>
  );
};

export default Ecommerce;
