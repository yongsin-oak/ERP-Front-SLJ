import AFormItem, { FormItemProps } from "antd/es/form/FormItem";
import Text from "../Text";

interface Props extends FormItemProps {
  requiredMessage?: string;
}
const FormItem = ({ requiredMessage, ...props }: Props) => {
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

export default FormItem;
