import { Button, Card, Col, Flex, Input, Row } from "antd";
import { useState } from "react";
import BackButton from "../../../components/BackButton";
import Select from "../../../components/Select";
const ECommerce = () => {
  const [showButton, setShowButton] = useState(true);

  const saveOrder = "บันทึกคำสั่งซื้อ";
  const orderHistory = "ดูประวัติคำสั่งซื้อ";

  const handleButton = () => {
    setShowButton(!showButton);
  };
  return (
    <>
      {showButton ? (
        <Flex
          style={{ height: "100%" }}
          justify="center"
          align="center"
          gap={8}
        >
          <Button type="primary" size="large" onClick={handleButton}>
            {saveOrder}
          </Button>
          <Button type="default" size="large" onClick={handleButton}>
            {orderHistory}
          </Button>
        </Flex>
      ) : (
        <Flex vertical gap={8}>
          <BackButton onBack={handleButton} text={saveOrder} />
          <Card>
            <Row gutter={[16, 16]}>
              <Col xxl={4} xl={6} md={6} sm={24} xs={24}>
                <Select
                  placeholder="พนักงานผู้บันทึก"
                  allowClear
                  style={{ width: "100%" }}
                  options={[
                    {
                      label: "เดฟ",
                      value: "1",
                    },
                    {
                      label: "มอส",
                      value: "2",
                    },
                  ]}
                />
              </Col>
              <Col xxl={20} xl={18} md={18} sm={24} xs={24}>
                <Input placeholder="หมายเลขคำสั่งซื้อ / หมายเลขพัสดุ"></Input>
              </Col>
            </Row>
          </Card>
        </Flex>
      )}
    </>
  );
};

export default ECommerce;
