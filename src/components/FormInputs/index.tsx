import {
  Col,
  DatePicker,
  DatePickerProps,
  Flex,
  Form,
  Input,
  InputProps,
  Row,
  SelectProps,
} from "antd";
import { FormInstance, useForm } from "antd/es/form/Form";
import { InputFields } from "./interface";
import FormItem from "../FormItem";
import Select from "../Select";

interface Props {
  onFinish?: (values: unknown) => void;
  inputFields: InputFields[];
  layout?: "vertical" | "horizontal" | "inline";
  children?: React.ReactNode;
  formProps?: FormInstance<unknown>;
  gutter?: [number, number];
}
const FormInputs = ({
  onFinish,
  inputFields,
  layout = "vertical",
  children,
  formProps,
  gutter = [16, 8],
}: Props) => {
  const [form] = useForm();
  const content = (
    <Flex vertical gap={16}>
      <Row gutter={gutter}>
        {inputFields.map((inputField: InputFields, index: number) => {
          const {
            customInput,
            datePickerInput,
            inputProps,
            selectInput,
            label,
            name,
            span,
          } = inputField;
          const requiredTypeMessage = selectInput ? "เลือก" : "กรอก";
          return (
            <Col span={span || 24} key={index}>
              <FormItem
                key={name}
                label={label}
                name={name}
                requiredMessage={`กรุณา${requiredTypeMessage}${label}`}
              >
                {customInput ? (
                  customInput
                ) : datePickerInput ? (
                  <DatePicker
                    style={{ width: "100%" }}
                    {...(inputProps as DatePickerProps)}
                  />
                ) : selectInput ? (
                  <Select {...(inputProps as SelectProps)} />
                ) : (
                  <Input {...(inputProps as InputProps)} />
                )}
              </FormItem>
            </Col>
          );
        })}
      </Row>
      {children}
    </Flex>
  );
  return formProps ? (
    content
  ) : (
    <Form form={form} layout={layout} onFinish={onFinish}>
      {content}
    </Form>
  );
};

export default FormInputs;
