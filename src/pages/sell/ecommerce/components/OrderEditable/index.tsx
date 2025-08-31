import { Flex, Form, Popconfirm, Space } from "antd";

import { ScanOutlined } from "@ant-design/icons";
import MButton from "@components/common/MButton";
import MSelect from "@components/common/MSelect";
import MFormItem from "@components/Form/MFormItem";
import Editable, {
  DataType,
  EditableTableProps,
} from "@components/tableComps/Editable";
import { useForm } from "antd/es/form/Form";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { DefaultOptionType } from "antd/es/select";
import { onGetProducts } from "@hooks/product";
import { ProductData } from "@interfaces/product";

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
  const [productOptions, setProductOptions] = useState<DefaultOptionType[]>([]);
  const [productBarcodeForm] = useForm();

  // โหลด options ของ productBarcode
  useEffect(() => {
    const updateProductSelection = (data: ProductData[]) => {
      setProductOptions(
        data.map((item) => ({
          label: `${item.barcode} - ${item.name}`,
          value: item.barcode,
          key: item.barcode,
        }))
      );
    };
    const fetchOptions = async () => {
      await onGetProducts({
        setData: updateProductSelection,
      });
    };
    fetchOptions();
  }, []);

  const handleDelete = (order: React.Key) => {
    const newData = dataSource.filter((item) => item.order !== order);
    setDataSource(newData);
  };

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.order === item.order);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
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
    render: (_: unknown, record: DataType) =>
      dataSource.length >= 1 ? (
        <Popconfirm
          title="ลบรายการนี้?"
          onConfirm={() => handleDelete(record.order)}
          cancelText="ยกเลิก"
          okText="ลบ"
        >
          <a>Delete</a>
        </Popconfirm>
      ) : null,
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
              <MSelect
                placeholder="บาร์โค้ดสินค้า"
                prefix={<ScanOutlined />}
                options={productOptions}
                virtual={false}
                allowClear
                suffixIcon={null}
                onPopupScroll={() => {
                  console.log("Scroll event triggered");
                }}
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
