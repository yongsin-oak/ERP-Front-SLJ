import React, { useContext, useEffect, useRef, useState } from "react";
import type { GetRef, InputRef, TableProps } from "antd";
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Table,
} from "antd";

import { ScanOutlined } from "@ant-design/icons";
import FormItem from "../FormItem";
import { onInputNoSpecialChars } from "../../utils/filteredInput";
import { useForm } from "antd/es/form/Form";
import { findIndex, isEmpty } from "lodash";

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof Item;
  record: Item;
  number?: boolean;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  number,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        {number ? (
          <InputNumber
            ref={inputRef as any}
            onPressEnter={save}
            onBlur={save}
          />
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

interface DataType {
  order: number;
  productName: string;
  productQuantity: number;
  productBarcode: string;
}

type ColumnTypes = Exclude<TableProps<DataType>["columns"], undefined>;

interface EditableProps {
  columns: ColumnTypes &
    {
      editable?: boolean;
      number?: boolean;
      dataIndex: string;
    }[];
  onCancel?: () => void;
  onConfirm?: (data: DataType[]) => void;
}
const Editable = ({ columns: columnsProp, onCancel }: EditableProps) => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [count, setCount] = useState<number>(1);
  const [productBarcodeForm] = useForm();
  const handleDelete = (order: React.Key) => {
    const newData = dataSource.filter((item) => item.order !== order);
    setDataSource(newData);
  };

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    number?: boolean;
    dataIndex: string;
  })[] = [
    ...columnsProp,
    {
      title: "",
      dataIndex: "operation",
      render: (_, record: DataType) => {
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
    },
  ];
  const handleAdd = () => {
    const { productBarcode } = productBarcodeForm.getFieldsValue();
    if (isEmpty(productBarcode)) return;
    const exitsIndex = findIndex(
      dataSource,
      (item) => item.productBarcode === productBarcode
    );
    productBarcodeForm.resetFields(["productBarcode"]);
    if (exitsIndex !== -1) {
      setDataSource((prev) => {
        const newData = [...prev];
        newData[exitsIndex].productQuantity += 1;
        return newData;
      });
      return;
    }
    const newData: DataType = {
      order: count,
      productName: `สินค้าที่ ${count}`,
      productQuantity: 1,
      productBarcode,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        number: col.number,
        handleSave,
      }),
    };
  });

  return (
    <Flex vertical gap={8}>
      {/* <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add a row
      </Button> */}
      {dataSource.length > 0 && (
        <Table<DataType>
          components={components}
          size="small"
          rowKey={(record) => record.order}
          rowClassName={() => "editable-row"}
          bordered
          pagination={false}
          dataSource={dataSource}
          columns={columns as ColumnTypes}
          scroll={{ y: 400 }}
          sticky
        />
      )}
      <Form form={productBarcodeForm} layout="vertical" onFinish={handleAdd}>
        <Flex gap={16}>
          <FormItem name={["productBarcode"]}>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="บาร์โค้ดสินค้า"
                name="productBarcode"
                prefix={<ScanOutlined />}
                onInput={onInputNoSpecialChars}
                autoComplete="off"
              />
              <Button type="primary" htmlType="submit">
                เพิ่มสินค้า
              </Button>
            </Space.Compact>
          </FormItem>
        </Flex>
      </Form>
      <Flex gap={8} justify="end" style={{ marginTop: 16 }}>
        <Button type="default" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="primary" onClick={() => console.log(dataSource)}>
          บันทึก
        </Button>
      </Flex>
    </Flex>
  );
};

export default Editable;
