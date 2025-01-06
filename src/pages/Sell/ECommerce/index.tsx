import { Flex } from "antd";
import { useState } from "react";
import BackButton from "../../../components/BackButton";
import ButtonPath from "./ButtonPath";
import RecordOrder from "./RecordOrder";

const ECommerce = () => {
  const [showButton, setShowButton] = useState<boolean>(true);
  const [recordOrder, setRecordOrder] = useState<boolean>(false);

  const handleButton = (path?: string) => {
    setRecordOrder(false);
    if (path === "record") {
      setRecordOrder(true);
    }
    setShowButton(!showButton);
  };
  return (
    <>
      {showButton ? (
        <ButtonPath handleButton={handleButton}></ButtonPath>
      ) : (
        <Flex vertical gap={8}>
          <BackButton
            onBack={handleButton}
            sticky
            text={
              recordOrder ? "บันทึกคำสั่งซื้อ" : "ประวัติการบันทึกคำสั่งซื้อ"
            }
          />
          {recordOrder ? <RecordOrder /> : <div>History</div>}
        </Flex>
      )}
    </>
  );
};

export default ECommerce;
