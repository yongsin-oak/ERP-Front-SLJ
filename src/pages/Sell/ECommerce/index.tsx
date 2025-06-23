import { Flex } from "antd";
import { useState } from "react";
import ButtonPath from "./components/ButtonPath";
import RecordOrder from "./pages/RecordOrder";
import HistoryOrder from "./pages/HistoryOrder";
import BackButton from "../../../components/common/BackButton";

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
          {recordOrder ? <RecordOrder /> : <HistoryOrder />}
        </Flex>
      )}
    </>
  );
};

export default ECommerce;
