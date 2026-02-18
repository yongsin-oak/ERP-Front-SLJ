import {
  ScanOutlined,
  ShopOutlined,
  TikTokFilled,
  UserOutlined,
} from "@ant-design/icons";
import LazadaIcon from "@assets/icon/platform/Lazada";
import ShopeeIcon from "@assets/icon/platform/Shopee";
import { Text, MButton, SearchSelect } from "@components/common";
import MFormItem from "@components/Form/MFormItem";
import { OrderEditable } from "@components/tableComps";
import { Platform } from "@features/shop/enums/Platform.enum";
import { EmployeeType } from "@types";
import { Shop } from "@types";
import { useOrderStore } from "@features/sell/stores/order";
import {
  onInputNoSpecialChars,
  onInputUppercase,
} from "@utils/common/filteredInput";
import req from "@lib/config/req";
import {
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Radio,
  Row,
  Space,
} from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShopStore } from "@features/shop";

const ICON_SIZE = 30;
const ORDER_ID_LABEL = "หมายเลขคำสั่งซื้อ / หมายเลขพัสดุ";

interface EcommerceForm {
  employee?: number;
  platform?: Platform;
  shop?: string;
  orderNumber?: string;
}

const Ecommerce = () => {
  const [orderNumberForm] = useForm<EcommerceForm>();
  const navigation = useNavigate();
  const { loadShops } = useShopStore();

  // State สำหรับจัดการการบันทึก
  const [recording, setRecording] = useState(false);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string>();

  // Watch form values
  const currentEmployee = useWatch("employee", orderNumberForm);
  const currentPlatform = useWatch("platform", orderNumberForm);
  const currentShop = useWatch("shop", orderNumberForm);
  const loadEmployeesData = useCallback(async (page: number, limit: number) => {
    try {
      const res = await req.get("/employee", {
        params: {
          page,
          limit,
        },
      });
      return res.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }, []);

  const mapEmployeesToOptions = useCallback(
    (data: EmployeeType[]) =>
      data.map((item) => ({
        label: item.nickname,
        value: item.id,
      })),
    [],
  );

  const loadShopsData = useCallback(
    async (page: number, limit: number) => {
      if (!currentPlatform) return undefined;
      try {
        return await loadShops({
          page,
          limit,
          platform: currentPlatform,
        });
      } catch (error) {
        console.log(error);
        return undefined;
      }
    },
    [currentPlatform, loadShops],
  );

  const mapShopsToOptions = useCallback(
    (data: Shop[]) =>
      data.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [],
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
      case "TikTok":
        return <TikTokFilled style={{ fontSize: size ?? ICON_SIZE }} />;
      default:
        return <></>;
    }
  };

  const onFinish = async () => {
    const { orderNumber: formOrderNumber } = orderNumberForm.getFieldsValue();

    if (!formOrderNumber) return;

    try {
      // ตรวจสอบว่า order number มีอยู่ในระบบหรือไม่
      await req.get(`/order/check-exists/${formOrderNumber}`);

      // ถ้าผ่านการตรวจสอบ ดำเนินการต่อ
      setCurrentOrderNumber(formOrderNumber);
      setRecording(true);
      orderNumberForm.resetFields(["orderNumber"]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error checking order:", error);

      // แสดง error message ใต้ field
      if (error?.response?.data?.message === "Order already exists") {
        orderNumberForm.setFields([
          {
            name: "orderNumber",
            errors: ["หมายเลขคำสั่งซื้อ/หมายเลขพัสดุนี้ถูกบันทึกแล้ว"],
          },
        ]);
        return;
      }

      orderNumberForm.setFields([
        {
          name: "orderNumber",
          errors: [
            "เกิดข้อผิดพลาดในการตรวจสอบหมายเลขคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง",
          ],
        },
      ]);
    }
  };

  const handlePlatformChange = (newPlatform: Platform) => {
    // ล้างค่า shop เมื่อเปลี่ยน platform
    orderNumberForm.setFieldsValue({
      platform: newPlatform,
      shop: undefined,
    });
  };

  const resetOrderNumber = () => {
    setCurrentOrderNumber(undefined);
    setRecording(false);
    orderNumberForm.resetFields(["orderNumber"]);
  };

  // Render Platform Radio Button
  const renderPlatformButton = (value: string, icon: React.ReactNode) => (
    <Col xs={24} sm={8}>
      <Radio.Button
        value={value}
        style={{
          width: "100%",
          height: "35px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: currentPlatform === value ? "500" : "normal",
        }}
      >
        <Flex align="center" gap={6}>
          {icon}
          <span>{value}</span>
        </Flex>
      </Radio.Button>
    </Col>
  );

  // Render Order Summary Card
  const renderOrderSummary = () => (
    <Card size="small" style={{ backgroundColor: "#fafafa", marginBottom: 16 }}>
      <Row gutter={[16, 8]} align="middle">
        <Col flex="auto">
          <Flex align="center" gap={12}>
            {platformIcon(28)}
            <div>
              <Text strong style={{ fontSize: "16px" }}>
                ร้านค้า ID: {currentShop}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "14px" }}>
                {currentPlatform}
              </Text>
            </div>
          </Flex>
        </Col>
        <Col>
          <div style={{ textAlign: "right" }}>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              หมายเลขคำสั่งซื้อ
            </Text>
            <br />
            <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
              {currentOrderNumber}
            </Text>
          </div>
        </Col>
      </Row>
    </Card>
  );

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
          <Form<EcommerceForm>
            form={orderNumberForm}
            onFinish={onFinish}
            layout="vertical"
          >
            <Flex vertical gap={16}>
              {/* ผู้บันทึก */}
              <MFormItem
                name="employee"
                requiredMessage="กรุณาเลือกผู้บันทึก"
                label="ผู้บันทึก"
              >
                <SearchSelect<EmployeeType>
                  prefix={<UserOutlined />}
                  placeholder="ค้นหาผู้บันทึก"
                  onLoadData={loadEmployeesData}
                  mapDataToOptions={mapEmployeesToOptions}
                  autoLoad
                  allowClear
                  disabled={recording}
                />
              </MFormItem>

              {/* แพลตฟอร์มและร้านค้า */}
              <Row gutter={[16, 12]}>
                <Col lg={12} md={12} sm={24} xs={24}>
                  <MFormItem
                    name="platform"
                    requiredMessage="กรุณาเลือกแพลตฟอร์ม"
                    label="แพลตฟอร์ม"
                  >
                    <Radio.Group
                      disabled={recording || !currentEmployee}
                      onChange={(e) => handlePlatformChange(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <Row gutter={[12, 12]}>
                        {renderPlatformButton(
                          Platform.Shopee,
                          <ShopeeIcon width={18} height={18} />,
                        )}
                        {renderPlatformButton(
                          Platform.Lazada,
                          <LazadaIcon width={18} height={18} />,
                        )}
                        {renderPlatformButton(
                          Platform.TikTok,
                          <TikTokFilled style={{ fontSize: 18 }} />,
                        )}
                      </Row>
                    </Radio.Group>
                  </MFormItem>
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                  <MFormItem
                    name="shop"
                    requiredMessage="กรุณาเลือกร้านค้า"
                    label="ร้านค้า"
                  >
                    <SearchSelect<Shop>
                      prefix={<ShopOutlined />}
                      placeholder="ค้นหาร้านค้า"
                      onLoadData={loadShopsData}
                      mapDataToOptions={mapShopsToOptions}
                      autoLoad={!!currentPlatform}
                      allowClear
                      disabled={
                        recording || !currentEmployee || !currentPlatform
                      }
                    />
                  </MFormItem>
                </Col>
              </Row>

              {/* หมายเลขคำสั่งซื้อ */}
              <MFormItem
                name="orderNumber"
                requiredMessage={`กรุณากรอก${ORDER_ID_LABEL}`}
                label={ORDER_ID_LABEL}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    prefix={<ScanOutlined />}
                    placeholder={ORDER_ID_LABEL}
                    onInput={(e) => {
                      onInputNoSpecialChars(e);
                      onInputUppercase(e);
                    }}
                    disabled={
                      recording ||
                      !currentEmployee ||
                      !currentPlatform ||
                      !currentShop
                    }
                  />
                  <MButton
                    htmlType="submit"
                    disabled={
                      !currentEmployee ||
                      !currentPlatform ||
                      !currentShop ||
                      recording
                    }
                  >
                    บันทึก
                  </MButton>
                </Space.Compact>
              </MFormItem>
            </Flex>
          </Form>

          {/* รายการสินค้า */}
          {currentEmployee &&
            currentPlatform &&
            currentShop &&
            currentOrderNumber && (
              <>
                <Divider>
                  <Text h5 medium>
                    รายการสินค้า
                  </Text>
                </Divider>
                {renderOrderSummary()}
                <OrderEditable
                  onCancel={resetOrderNumber}
                  onConfirm={(data) => {
                    useOrderStore.getState().onPostOrder({
                      id: currentOrderNumber,
                      employeeId: String(currentEmployee),
                      shopId: String(currentShop),
                      orderDetails: data.map((item) => ({
                        productBarcode: item.productBarcode,
                        quantity: item.productAmount,
                      })),
                    });
                    message.success(
                      `บันทึกคำสั่งซื้อ ${currentOrderNumber} เรียบร้อยแล้ว`,
                    );
                    resetOrderNumber();
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
