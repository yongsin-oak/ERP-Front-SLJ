import { Button, Flex } from "antd";

interface Props {
  handleButton: (path?: string) => void;
}
const ButtonPath = ({ handleButton }: Props) => {
  const saveOrder = "บันทึกคำสั่งซื้อ";
  const orderHistory = "ดูประวัติคำสั่งซื้อ";
  return (
    <Flex style={{ height: "100%" }} justify="center" align="center" gap={8}>
      <Button
        type="primary"
        size="large"
        onClick={() => handleButton("record")}
      >
        {saveOrder}
      </Button>
      <Button
        type="default"
        size="large"
        onClick={() => handleButton("history")}
      >
        {orderHistory}
      </Button>
    </Flex>
  );
};

export default ButtonPath;
