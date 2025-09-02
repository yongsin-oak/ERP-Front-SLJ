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
import { Platform } from "@enums/Platform.enum";
import { onGetShops } from "@hooks/shop";
import { EmployeeType } from "@interfaces/exployee";
import { Shop } from "@interfaces/shop";
import { useOrderStore } from "@stores/order";
import { useEcommerceStore } from "@stores/sessionState";
import { onInputNoSpecialChars } from "@utils/common/filteredInput";
import req from "@utils/common/req";
import { Card, Col, Divider, Flex, Form, Input, Radio, Row, Space } from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ICON_SIZE = 30;
const ORDER_ID_LABEL = "หมายเลขคำสั่งซื้อ / หมายเลขพัสดุ";

const Ecommerce = () => {
  const [orderNumberForm] = useForm();
  const navigation = useNavigate();
  const [isMount, setIsMount] = useState<boolean>(false);
  const hasInitialized = useRef<boolean>(false);
  // Zustand store
  const {
    form,
    ui,
    setEmployee,
    setPlatform,
    setShop,
    setOrderNumber,
    setRecording,
    setCurrentOrderNumber,
    resetOrderNumber,
  } = useEcommerceStore();

  // ใช้ store values แทน useWatch
  const currentEmployee = form.employee;
  const currentPlatform = form.platform;
  const currentShop = form.shop;
  const recording = ui.recording;
  const currentOrderNumber = ui.currentOrderNumber;

  useEffect(() => {
    setIsMount(true);
  }, []);

  // Sync store กับ form values (เฉพาะค่าที่มีอยู่จริง และป้องกันการ sync ซ้ำ)
  useEffect(() => {
    if (!isMount || hasInitialized.current) return;

    // เพิ่ม delay เล็กน้อยเพื่อให้ options โหลดเสร็จก่อน
    const timer = setTimeout(() => {
      const fieldsToUpdate: Record<string, unknown> = {};

      if (form.employee.id) {
        fieldsToUpdate.employee = form.employee.id;
      }

      if (form.platform) {
        fieldsToUpdate.platform = form.platform;
      }

      if (form.shop.id) {
        fieldsToUpdate.shop = form.shop.id;
      }

      if (form.orderNumber) {
        fieldsToUpdate.orderNumber = form.orderNumber;
      }

      // อัพเดทเฉพาะ field ที่มีค่า
      if (Object.keys(fieldsToUpdate).length > 0) {
        orderNumberForm.setFieldsValue(fieldsToUpdate);
        hasInitialized.current = true;
      }
    }, 100); // delay 100ms

    return () => clearTimeout(timer);
  }, [
    orderNumberForm,
    form.employee.id,
    form.platform,
    form.shop.id,
    form.orderNumber,
    isMount,
  ]);

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
    []
  );

  const loadShopsData = useCallback(
    async (page: number, limit: number) => {
      if (!currentPlatform) return undefined;
      try {
        return await onGetShops({
          page,
          limit,
          platform: currentPlatform,
        });
      } catch (error) {
        console.log(error);
        return undefined;
      }
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
      case "TikTok":
        return <TikTokFilled style={{ fontSize: size ?? ICON_SIZE }} />;
      default:
        return <></>;
    }
  };

  const onFinish = () => {
    const { orderNumber: formOrderNumber } = orderNumberForm.getFieldsValue();
    setCurrentOrderNumber(formOrderNumber);
    setRecording(true);
    resetOrderNumber();
    orderNumberForm.resetFields(["orderNumber"]);
  };

  const handleFormChange = (_: unknown, allValues: Record<string, unknown>) => {
    // Sync form values กับ store (แต่ไม่ต้อง sync shopLabel เพราะจะถูกตั้งค่าผ่าน onSelect)
    // setEmployee จะถูกเรียกใน onSelect พร้อม label
    setPlatform(allValues.platform as Platform | undefined);
    // setShop จะถูกเรียกใน onSelect พร้อม label
    setOrderNumber(allValues.orderNumber as string | undefined);
  };
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
          <Form
            form={orderNumberForm}
            onFinish={onFinish}
            layout="vertical"
            onValuesChange={handleFormChange}
          >
            <Flex vertical gap={16}>
              {/* ส่วนข้อมูลผู้ใช้ */}
              <Row gutter={[16, 12]}>
                <Col span={24}>
                  <MFormItem
                    name={["employee"]}
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
                      initialOptions={
                        currentEmployee.id && currentEmployee.label
                          ? [
                              {
                                label: currentEmployee.label,
                                value: currentEmployee.id,
                              },
                            ]
                          : []
                      }
                      onSelect={(_value, option) => {
                        setEmployee(
                          option.value as number,
                          option.label as string
                        );
                        orderNumberForm.setFieldsValue({
                          employee: option.value,
                        });
                      }}
                      style={{ width: "100%" }}
                      disabled={recording}
                    />
                  </MFormItem>
                </Col>
              </Row>

              {/* ส่วนเลือกแพลตฟอร์มและร้านค้า */}
              <Row gutter={[16, 12]}>
                <Col lg={12} md={12} sm={24} xs={24}>
                  <MFormItem
                    name={["platform"]}
                    requiredMessage="กรุณาเลือกแพลตฟอร์ม"
                    label="แพลตฟอร์ม"
                  >
                    <Radio.Group
                      disabled={recording || !currentEmployee.id}
                      style={{ width: "100%" }}
                      onChange={(e) => {
                        const newPlatform = e.target.value;
                        setPlatform(newPlatform);
                        // ล้างค่า shop เมื่อเปลี่ยน platform
                        setShop(undefined, undefined);
                        orderNumberForm.setFieldsValue({
                          platform: newPlatform,
                          shop: undefined,
                        });
                      }}
                    >
                      <Row gutter={[12, 12]}>
                        <Col xs={24} sm={8}>
                          <Radio.Button
                            value="Shopee"
                            style={{
                              width: "100%",
                              height: "35px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight:
                                currentPlatform === "Shopee" ? "500" : "normal",
                            }}
                          >
                            <Flex align="center" gap={6}>
                              <ShopeeIcon width={18} height={18} />
                              <span>Shopee</span>
                            </Flex>
                          </Radio.Button>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Radio.Button
                            value="Lazada"
                            style={{
                              width: "100%",
                              height: "35px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight:
                                currentPlatform === "Lazada" ? "500" : "normal",
                            }}
                          >
                            <Flex align="center" gap={6}>
                              <LazadaIcon width={18} height={18} />
                              <span>Lazada</span>
                            </Flex>
                          </Radio.Button>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Radio.Button
                            value="TikTok"
                            style={{
                              width: "100%",
                              height: "35px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight:
                                currentPlatform === "TikTok" ? "500" : "normal",
                            }}
                          >
                            <Flex align="center" gap={6}>
                              <TikTokFilled
                                style={{ fontSize: 18, color: "inherit" }}
                              />
                              <span>TikTok</span>
                            </Flex>
                          </Radio.Button>
                        </Col>
                      </Row>
                    </Radio.Group>
                  </MFormItem>
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                  <MFormItem
                    name={["shop"]}
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
                      initialOptions={
                        currentShop.id && currentShop.label
                          ? [
                              {
                                label: currentShop.label,
                                value: currentShop.id,
                              },
                            ]
                          : []
                      }
                      onSelect={(_value, option) => {
                        setShop(option.value as string, option.label as string);
                        orderNumberForm.setFieldsValue({ shop: option.value });
                      }}
                      style={{ width: "100%", height: "35px" }}
                      disabled={
                        recording || !currentEmployee.id || !currentPlatform
                      }
                    />
                  </MFormItem>
                </Col>
              </Row>

              {/* ส่วนหมายเลขคำสั่งซื้อ */}
              <Row gutter={[16, 12]}>
                <Col span={24}>
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
                        disabled={
                          recording ||
                          !currentEmployee.id ||
                          !currentPlatform ||
                          !currentShop.id
                        }
                      />
                      <MButton
                        htmlType="submit"
                        disabled={
                          !currentEmployee.id ||
                          !currentPlatform ||
                          !currentShop.id
                        }
                      >
                        บันทึก
                      </MButton>
                    </Space.Compact>
                  </MFormItem>
                </Col>
              </Row>
            </Flex>
          </Form>
          {currentEmployee.id &&
            currentPlatform &&
            currentShop &&
            currentOrderNumber && (
              <>
                <Divider>
                  <Text h5 medium>
                    รายการสินค้า
                  </Text>
                </Divider>

                {/* แสดงข้อมูลคำสั่งซื้อ */}
                <Card
                  size="small"
                  style={{ backgroundColor: "#fafafa", marginBottom: 16 }}
                >
                  <Row gutter={[16, 8]} align="middle">
                    <Col flex="auto">
                      <Flex align="center" gap={12}>
                        {platformIcon(28)}
                        <div>
                          <Text strong style={{ fontSize: "16px" }}>
                            {currentShop.label || currentShop.id}
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
                        <Text
                          strong
                          style={{ fontSize: "16px", color: "#1890ff" }}
                        >
                          {currentOrderNumber}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>

                <OrderEditable
                  onAddItem={(data) => {
                    console.log("Added item:", data);
                  }}
                  onCancel={() => {
                    console.log("Cancelled order");
                    // เคลียร์เฉพาะ order number และ recording state
                    // แต่เก็บ employee, platform, shop ไว้
                    setCurrentOrderNumber(undefined);
                    setRecording(false);
                    console.log(
                      "After cancel:",
                      currentEmployee,
                      currentOrderNumber,
                      currentPlatform,
                      currentShop
                    );
                  }}
                  onConfirm={(data) => {
                    // onPostOrder(data);
                    useOrderStore.getState().onPostOrder({
                      id: currentOrderNumber,
                      employeeId: String(currentEmployee.id),
                      shopId: String(currentShop.id),
                      orderDetails: data.map((item) => ({
                        productBarcode: item.productBarcode,
                        quantity: item.productAmount,
                      })),
                    });
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
