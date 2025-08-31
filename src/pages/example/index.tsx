import { Card, Row, Col, Divider, Space, Input, message, Form } from "antd";
import { useState } from "react";
import TextExample from "./TextExample";
import Editable, { EditableTableProps } from "@components/tableComps/Editable";
import {
  BackButton,
  ExcelUpload,
  FloatingThemeButton,
  HighlightText,
  MButton,
  MInput,
  MInputNumber,
  MSelect,
  StatusBadge,
  Text,
} from "@components/common";
import LogoutButton from "@components/LogoutButton";
import { FormInputs, MFormItem } from "@components/Form";
import { CardList, MTable, OrderEditable } from "@components/tableComps";

const Example = () => {
  const [inputValue, setInputValue] = useState("");
  const [numberValue, setNumberValue] = useState<number | null>(0);
  const [selectValue, setSelectValue] = useState("");

  const selectOptions = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
  ];

  const tableData = [
    { id: 1, name: "Product 1", price: 100, status: "active" },
    { id: 2, name: "Product 2", price: 200, status: "inactive" },
    { id: 3, name: "Product 3", price: 300, status: "pending" },
  ];

  const tableColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  const excelColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  // Sample data for Editable tables
  const editableData = [
    {
      order: 1,
      productName: "Product 1",
      productAmount: 10,
      productBarcode: "123456789",
    },
    {
      order: 2,
      productName: "Product 2",
      productAmount: 20,
      productBarcode: "987654321",
    },
  ];

  const editableColumns: EditableTableProps<{
    order: number;
    productName: string;
    productAmount: number;
    productBarcode: string;
  }>["columns"] = [
    { title: "Order", dataIndex: "order", key: "order", editable: true },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      editable: true,
    },
    {
      title: "Amount",
      dataIndex: "productAmount",
      key: "productAmount",
      editable: true,
      number: true,
    },
    {
      title: "Barcode",
      dataIndex: "productBarcode",
      key: "productBarcode",
      editable: true,
    },
  ];
  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5" }}>
      <Text h1 style={{ marginBottom: "24px" }}>
        🎨 Component Library Showcase
      </Text>

      {/* Common Components Section */}
      <Card title="📦 Common Components" style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          {/* Buttons */}
          <Col span={24}>
            <Divider orientation="left">
              <Text semiBold>Buttons</Text>
            </Divider>
            <Space wrap>
              <MButton>Primary Button</MButton>
              <MButton type="default">Default Button</MButton>
              <MButton type="dashed">Dashed Button</MButton>
              <MButton type="text">Text Button</MButton>
              <MButton type="link">Link Button</MButton>
              <MButton fullWidth style={{ width: "200px" }}>
                Full Width Button
              </MButton>
              <BackButton />
              <LogoutButton />
            </Space>
          </Col>

          {/* Text Components */}
          <Col span={24}>
            <Divider orientation="left">
              <Text semiBold>Text Components</Text>
            </Divider>
            <Space direction="vertical">
              <Text s2>Extra Small Text (s2)</Text>
              <Text s1>Small Text (s1)</Text>
              <Text>Regular Text (base)</Text>
              <Text h6>Heading 6</Text>
              <Text h5>Heading 5</Text>
              <Text h4>Heading 4</Text>
              <Text h3>Heading 3</Text>
              <Text h2>Heading 2</Text>
              <Text h1>Heading 1</Text>
              <Text bold>Bold Text</Text>
              <Text medium>Medium Weight</Text>
              <Text semiBold>Semi Bold</Text>
              <Text center>Centered Text</Text>
              <HighlightText>Highlighted Text</HighlightText>
            </Space>
          </Col>

          {/* Input Components */}
          <Col span={24}>
            <Divider orientation="left">
              <Text semiBold>Input Components</Text>
            </Divider>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <MInput
                  placeholder="Enter text here"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </Col>
              <Col span={8}>
                <MInputNumber
                  placeholder="Enter number"
                  value={numberValue}
                  onChange={(value) => setNumberValue(value as number | null)}
                  min={0}
                  max={1000}
                />
              </Col>
              <Col span={8}>
                <MSelect
                  placeholder="Select option"
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                />
              </Col>
            </Row>
          </Col>

          {/* Status Components */}
          <Col span={24}>
            <Divider orientation="left">
              <Text semiBold>Status & Badge Components</Text>
            </Divider>
            <Space wrap>
              <StatusBadge value={50} label="ชิ้น" />
              <StatusBadge value={5} minValue={10} label="ชิ้น" />
              <StatusBadge value={0} label="ชิ้น" />
              <StatusBadge value={100} label="หน่วย" />
            </Space>
          </Col>

          {/* Upload Component */}
          <Col span={24}>
            <Divider orientation="left">
              <Text semiBold>Upload Component</Text>
            </Divider>
            <ExcelUpload
              columns={excelColumns}
              onSave={(data) => {
                message.success(`Uploaded ${data.length} records`);
                console.log("Uploaded data:", data);
              }}
              accept=".xlsx,.xls,.csv"
              maxCount={1}
            />
          </Col>
        </Row>
      </Card>

      {/* Form Components Section */}
      <Card title="📝 Form Components" style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text semiBold style={{ display: "block", marginBottom: "16px" }}>
              Form Item Component
            </Text>
            <Form>
              <MFormItem
                label="Sample Form Field"
                name="sample"
                requiredMessage="This field is required"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter value" />
              </MFormItem>
            </Form>
          </Col>
          <Col span={12}>
            <Text semiBold style={{ display: "block", marginBottom: "16px" }}>
              Form Inputs Component (Dynamic)
            </Text>
            <FormInputs
              inputFields={[
                {
                  name: "name",
                  label: "Name",
                  inputComponent: "input",
                  inputProps: { placeholder: "Enter name" },
                  required: true,
                },
                {
                  name: "email",
                  label: "Email",
                  inputComponent: "input",
                  inputProps: { placeholder: "Enter email", type: "email" },
                },
                {
                  name: "age",
                  label: "Age",
                  inputComponent: "number",
                  inputProps: { placeholder: "Enter age", min: 0, max: 100 },
                },
              ]}
              onFinish={(values) => {
                message.success("Form submitted successfully!");
                console.log("Form values:", values);
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table Components Section */}
      <Card title="📊 Table Components" style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Divider orientation="left">
              <Text semiBold>Main Table (MTable)</Text>
            </Divider>
            <MTable
              columns={tableColumns}
              dataSource={tableData}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Col>

          <Col span={12}>
            <Divider orientation="left">
              <Text semiBold>Card List</Text>
            </Divider>
            <CardList
              dataSource={tableData}
              columns={tableColumns}
              titleColumn="name"
              subtitleColumn="price"
              rowKey="id"
              onEditItem={(item) => console.log("Edit:", item)}
              onDeleteItem={(item) => console.log("Delete:", item)}
            />
          </Col>

          <Col span={12}>
            <Divider orientation="left">
              <Text semiBold>Editable Table</Text>
            </Divider>
            <Editable
              columns={editableColumns.map((col) => ({
                ...col,
                editable: true,
              }))}
              dataSource={editableData}
              onSaveCol={(record) => {
                message.success(`Saved record: ${record.productName}`);
                console.log("Saved record:", record);
              }}
            />
          </Col>

          <Col span={24}>
            <Divider orientation="left">
              <Text semiBold>Order Editable Table</Text>
            </Divider>
            <OrderEditable
              onAddItem={(data) => {
                message.success(`Added item with value: ${data.data?.barcode}`);
                console.log("Added item:", data);
              }}
              onConfirm={(data) => {
                message.success(`Confirmed order with ${data.length} items`);
                console.log("Confirmed order:", data);
              }}
              onCancel={() => {
                message.info("Order cancelled");
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Original Text Example */}
      <Card title="📝 Original Text Example" style={{ marginBottom: "24px" }}>
        <TextExample />
      </Card>

      {/* Floating Theme Button */}
      <FloatingThemeButton />
    </div>
  );
};

export default Example;
