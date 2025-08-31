import React, { Ref, useContext, useEffect, useRef, useState } from "react";
import type { GetRef, InputRef, TableProps } from "antd";
import { Form, Input, InputNumber, Table } from "antd";

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<unknown> | null>(null);

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

const EditableRow: React.FC = ({ ...props }) => {
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
      const values = (await form.validateFields()) as Partial<Item>;

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
            ref={inputRef as Ref<HTMLInputElement>}
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

export interface DataType {
  order: number;
  productName: string;
  productAmount: number;
  productBarcode: string;
  [key: string]: string | number;
}

type ColumnTypes = Exclude<TableProps<DataType>["columns"], undefined>;

export interface EditableTableProps {
  columns: (ColumnTypes[number] & {
    editable?: boolean;
    number?: boolean;
    dataIndex: string;
  })[];
  dataSource: DataType[];
  handleSave: (row: DataType) => void;
}

const Editable: React.FC<EditableTableProps> = ({
  columns: propColumns,
  dataSource,
  handleSave,
}) => {
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = propColumns.map((col) => {
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
  );
};

export default Editable;
