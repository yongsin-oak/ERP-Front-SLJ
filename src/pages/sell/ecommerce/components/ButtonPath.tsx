import { Flex } from "antd";
import MButton from "../../../../components/common/MButton";

interface Props {
  handleButton: (path?: string) => void;
}
const ButtonPath = ({ handleButton }: Props) => {
  const saveOrder = "บันทึกคำสั่งซื้อ";
  const orderHistory = "ดูประวัติคำสั่งซื้อ";
  return (
    <Flex style={{ height: "100%" }} justify="center" align="center" gap={8}>
      <MButton size="large" onClick={() => handleButton("record")}>
        {saveOrder}
      </MButton>
      <MButton
        type="default"
        size="large"
        onClick={() => handleButton("history")}
      >
        {orderHistory}
      </MButton>
    </Flex>
  );
};

export default ButtonPath;
