import { Flex, Form, Input, Popconfirm, Space } from "antd";

import { ScanOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { isEmpty } from "lodash";
import { useState } from "react";
import { onInputNoSpecialChars } from "../../../utils/common/filteredInput";
import MButton from "../../common/MButton";
import MFormItem from "../../Form/MFormItem";
import Editable, { DataType, EditableTableProps } from "../Editable";

interface OrderEditableProps extends Omit<EditableTableProps, "handleSave"> {
  onConfirm?: (data: DataType[]) => void;
  onCancel?: () => void;
  onAddItem: (
    value: string | number,
    dataSource: DataType[],
    setDataSource: React.Dispatch<React.SetStateAction<DataType[]>>
  ) => void;
}

const OrderEditable = ({
  columns,
  onConfirm,
  onCancel,
  onAddItem,
}: OrderEditableProps) => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [productBarcodeForm] = useForm();

  const handleDelete = (order: React.Key) => {
    const newData = dataSource.filter((item) => item.order !== order);
    setDataSource(newData);
  };

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.order === item.order);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const handleAdd = () => {
    const { productBarcode } = productBarcodeForm.getFieldsValue();
    if (isEmpty(productBarcode)) return;
    onAddItem(productBarcode, dataSource, setDataSource);
    productBarcodeForm.resetFields(["productBarcode"]);
  };

  const operationColumn = {
    title: "",
    dataIndex: "operation",
    render: (_: unknown, record: DataType) => {
      return dataSource.length >= 1 ? (
        <Popconfirm
          title="ลบรายการนี้?"
          onConfirm={() => handleDelete(record.order)}
          cancelText="ยกเลิก"
          okText="ลบ"
        >
          <a>Delete</a>
        </Popconfirm>
      ) : null;
    },
    width: 80,
    ellipsis: true,
  };

  return (
    <Flex vertical gap={8}>
      {dataSource.length > 0 && (
        <Editable
          columns={[...columns, operationColumn]}
          dataSource={dataSource}
          handleSave={handleSave}
        />
      )}
      <Form form={productBarcodeForm} layout="vertical" onFinish={handleAdd}>
        <Flex gap={16}>
          <MFormItem name={["productBarcode"]}>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="บาร์โค้ดสินค้า"
                name="productBarcode"
                prefix={<ScanOutlined />}
                onInput={onInputNoSpecialChars}
                autoComplete="off"
              />
              <MButton htmlType="submit">เพิ่มสินค้า</MButton>
            </Space.Compact>
          </MFormItem>
        </Flex>
      </Form>
      <Flex gap={8} justify="end" style={{ marginTop: 16 }}>
        <MButton type="default" onClick={onCancel}>
          ยกเลิก
        </MButton>
        <MButton onClick={() => onConfirm?.(dataSource)}>บันทึก</MButton>
      </Flex>
    </Flex>
  );
};

export default OrderEditable;
