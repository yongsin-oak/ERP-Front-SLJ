import { Text } from "@components/common";
import AFormItem, { FormItemProps } from "antd/es/form/FormItem";

export interface MFormItemProps extends FormItemProps {
  requiredMessage?: string;
}
const MFormItem = ({ requiredMessage, ...props }: MFormItemProps) => {
  return (
    <AFormItem
      style={{ marginBottom: 0, flex: 1, width: "100%" }}
      rules={[
        {
          required: requiredMessage !== undefined,
          message: (
            <Text error s1>
              {requiredMessage}
            </Text>
          ),
        },
      ]}
      {...props}
    />
  );
};

export default MFormItem;
