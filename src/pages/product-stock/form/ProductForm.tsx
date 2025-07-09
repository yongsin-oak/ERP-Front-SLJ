import { Flex, Form, FormInstance } from "antd";
import React from "react";
import FormInputs from "../../../components/Form/FormInputs";
import MButton from "../../../components/common/MButton";
import { onGetProducts, onUploadProducts } from "../hooks/product.hook";
import { FormProductData, ProductData } from "../interface/interface";
import { addProductInputFields } from "./inputField";
import { useWatch } from "antd/es/form/Form";

export interface ProductFormCompProps {
  form: FormInstance<FormProductData>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setData: React.Dispatch<React.SetStateAction<ProductData[] | undefined>>;
  onSubmit?: (values: FormProductData) => void | Promise<void>;
  isEdit?: boolean;
}
const ProductFormComp = ({
  form,
  setOpen,
  setData,
  onSubmit,
  isEdit = false,
}: ProductFormCompProps) => {
  const remainingUnit = useWatch(["unit", "remaining"], form);
  const minStockUnit = useWatch(["unit", "minStock"], form);

  const handleSubmit = async (vals: FormProductData) => {
    if (onSubmit) {
      await onSubmit(vals);
    } else {
      // Default behavior for creating new products
      onUploadProducts({
        data: vals,
        final: () => {
          setOpen(false);
          onGetProducts({ setData });
        },
      });
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" noValidate>
      <FormInputs
        formProps={form}
        gutter={[16, 16]}
        inputFields={addProductInputFields({
          remainingUnit,
          minStockUnit,
        })}
      >
        <Flex justify="end" gap={8}>
          <MButton htmlType="submit">
            {isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}
          </MButton>
          <MButton onClick={() => setOpen(false)} type="default">
            ยกเลิก
          </MButton>
        </Flex>
      </FormInputs>
    </Form>
  );
};

export default ProductFormComp;
