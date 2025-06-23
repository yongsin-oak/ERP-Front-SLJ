import { Flex, Form, FormInstance } from "antd";
import React from "react";
import FormInputs from "../../../components/Form/FormInputs";
import MButton from "../../../components/common/MButton";
import { onGetProducts, onUploadProducts } from "../hooks/product.hook";
import { ProductData } from "../interface/interface";
import { addProductInputFields } from "./inputField";

export interface ProductFormCompProps {
  form: FormInstance<ProductData>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setData: React.Dispatch<React.SetStateAction<ProductData[] | undefined>>;
}
const ProductFormComp = ({ form, setOpen, setData }: ProductFormCompProps) => {
  return (
    <Form
      form={form}
      onFinish={(vals) => {
        onUploadProducts({
          data: vals as ProductData,
          final: () => {
            setOpen(false);
            onGetProducts({ setData });
          },
        });
      }}
      layout="vertical"
    >
      <FormInputs
        formProps={form}
        gutter={[16, 16]}
        inputFields={addProductInputFields}
      >
        <Flex justify="end" gap={8}>
          <MButton htmlType="submit">เพิ่มสินค้า</MButton>
          <MButton onClick={() => setOpen(false)} type="default">
            ยกเลิก
          </MButton>
        </Flex>
      </FormInputs>
    </Form>
  );
};

export default ProductFormComp;
