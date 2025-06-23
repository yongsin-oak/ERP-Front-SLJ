import { Col, DatePicker, Flex, Form, Input, Row } from "antd";
import { FormInstance, useForm } from "antd/es/form/Form";
import MInputNumber from "../../common/MInputNumber";
import MSelect from "../../common/MSelect";
import MFormItem from "../MFormItem";
import { InputFields } from "./interface";

interface Props {
  onFinish?: (values: unknown) => void;
  inputFields: InputFields[];
  layout?: "vertical" | "horizontal" | "inline";
  children?: React.ReactNode;
  formProps?: FormInstance<any>;
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
            inputComponent,
            inputProps,
            label,
            name,
            span,
            required,
          } = inputField;
          const datePickerInput = inputComponent === "datePicker";
          const selectInput = inputComponent === "select";
          const numberInput = inputComponent === "number";
          const requiredTypeMessage = selectInput ? "เลือก" : "กรอก";
          return (
            <Col span={span || 24} key={index} {...(inputField.colProps || {})}>
              <MFormItem
                key={name}
                label={label}
                name={name}
                requiredMessage={
                  required === false
                    ? undefined
                    : `กรุณา${requiredTypeMessage}${label}`
                }
              >
                {customInput ? (
                  customInput
                ) : datePickerInput ? (
                  <DatePicker style={{ width: "100%" }} {...inputProps} />
                ) : selectInput ? (
                  <MSelect {...inputProps} />
                ) : numberInput ? (
                  <MInputNumber
                    style={{ width: "100%" }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    type="number"
                    min={0}
                    defaultValue={0}
                    {...inputProps}
                  />
                ) : (
                  <Input {...inputProps} />
                )}
              </MFormItem>
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
