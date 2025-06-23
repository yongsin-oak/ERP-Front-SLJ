import { InputNumber, InputNumberProps } from "antd";
import React from "react";

export type MInputNumberProps = InputNumberProps;
const MInputNumber: React.FC<MInputNumberProps> = (props) => {
  return (
    <InputNumber
      style={{ width: "100%" }}
      inputMode="numeric"
      pattern="[0-9]*"
      type="number"
      min={0}
      defaultValue={0}
      {...props}
    />
  );
};

export default MInputNumber;
