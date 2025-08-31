/* eslint-disable @typescript-eslint/no-explicit-any */
import { MInputNumber } from "@components/common";
import type { GetRef, TableProps } from "antd";
import { Form, Input, Table } from "antd";
import { GetRowKey } from "antd/es/table/interface";
import React, { useContext, useEffect, useRef, useState } from "react";

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<unknown> | null>(null);

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

interface EditableCellProps<T = Record<string, unknown>> {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof T;
  record: T;
  number?: boolean;
  onSave: (record: T) => void;
}

const EditableCell = <T extends Record<string, unknown>>({
  title,
  editable,
  children,
  dataIndex,
  record,
  number,
  onSave,
  ...restProps
}: React.PropsWithChildren<EditableCellProps<T>>) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<any>(null);
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
      const values = (await form.validateFields()) as Partial<T>;

      toggleEdit();
      onSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex as string}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        {number ? (
          <MInputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
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

type ColumnTypes<T> = Exclude<TableProps<T>["columns"], undefined>;

export interface EditableTableProps<T = unknown> {
  columns: (ColumnTypes<T>[number] & {
    editable?: boolean;
    number?: boolean;
    dataIndex: keyof T;
  })[];
  dataSource: T[];
  onSaveCol: (row: T) => void;
  rowKey?: string | keyof T | GetRowKey<T>;
}

const Editable = <T extends Record<string, unknown>>({
  columns: propColumns,
  dataSource,
  onSaveCol: onSave,
  rowKey,
}: EditableTableProps<T>) => {
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
      onCell: (record: T) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        number: col.number,
        onSave,
      }),
    };
  });

  return (
    <Table<T>
      components={components}
      size="small"
      rowKey={rowKey}
      rowClassName={() => "editable-row"}
      bordered
      pagination={false}
      dataSource={dataSource}
      columns={columns as ColumnTypes<T>}
      scroll={{ y: 400 }}
      sticky
    />
  );
};

export default Editable;
