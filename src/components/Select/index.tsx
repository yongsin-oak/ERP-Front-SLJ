import { Select as ASelect, SelectProps, Space } from "antd";
import { Options } from "../../pages/Sell/ECommerce/allShop";
import Text from "../Text";
const Select = ({ optionFilterProp, ...props }: SelectProps) => {
  return (
    <ASelect
      style={{ width: "100%" }}
      showSearch
      // fieldNames={{ label: "label", value: "label" }}
      optionFilterProp={optionFilterProp || "label"}
      optionRender={(option: Options) => {
        return option.data.icon ? (
          <Space>
            <span
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {option.data.icon}
            </span>
            {option.data.label}
          </Space>
        ) : (
          <Text s1 color={option.data.color}>
            {option.data.label}
          </Text>
        );
      }}
      {...props}
    />
  );
};

export default Select;
