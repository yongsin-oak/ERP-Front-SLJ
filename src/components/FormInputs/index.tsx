import {
  Col,
  DatePicker,
  DatePickerProps,
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
  onFinish: (values: unknown) => void;
  inputFields: InputFields[];
  layout?: "vertical" | "horizontal" | "inline";
  formProps?: FormInstance<unknown>;
  children?: React.ReactNode;
}
const FormInputs = ({
  onFinish,
  inputFields,
  layout = "vertical",
  formProps,
  children,
}: Props) => {
  const [form] = useForm();
  return (
    <Form form={formProps || form} onFinish={onFinish} layout={layout}>
      <Row gutter={[16, 16]}>
        {inputFields.map((inputField: InputFields, index: number) => {
          const InputComp = () => {
            if (inputField.customInput) {
              return inputField.customInput;
            } else if (inputField.datePickerInput) {
              return (
                <DatePicker
                  needConfirm
                  style={{ width: "100%" }}
                  {...(inputField.inputProps as DatePickerProps)}
                />
              );
            } else if (inputField.selectInput) {
              return (
                <Select {...(inputField.inputProps as SelectProps)}></Select>
              );
            }
            return <Input {...(inputField.inputProps as InputProps)} />;
          };
          return (
            <Col span={inputField.span || 24} key={index}>
              <FormItem
                key={inputField.name}
                label={inputField.label}
                name={inputField.name}
              >
                <InputComp />
              </FormItem>
            </Col>
          );
        })}
      </Row>
      {children}
    </Form>
  );
};

export default FormInputs;
