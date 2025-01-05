import { Select as ASelect, SelectProps } from "antd";

const Select = ({ ...props }: SelectProps) => {
  return <ASelect style={{ width: "100%" }} {...props} />;
};

export default Select;
