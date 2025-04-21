import { useState } from "react";
import { Button, Flex, Form, Modal, Tooltip, Upload, UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { RcFile } from "antd/es/upload";

import Select from "../Select";
import { useForm } from "antd/es/form/Form";
import FormItem from "../FormItem";
import { DefaultOptionType } from "antd/es/select";
import { InfoCircleOutlined } from "@ant-design/icons";
import Text from "../Text";
import { ColumnType } from "antd/es/table";

interface Column extends ColumnType {
  information?: string;
}
interface Props extends UploadProps {
  onSave: (data: unknown[]) => void; // ฟังก์ชันสำหรับบันทึกข้อมูล
  columns: Column[]; // คอลัมน์ที่ต้องการให้เลือก
}

const ExcelUpload = ({ columns, ...props }: Props) => {
  const [file, setFile] = useState<RcFile>();
  const [modalVisible, setModalVisible] = useState(false);
  const [options, setOptions] = useState<DefaultOptionType[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    {}
  );
  const [form] = useForm();
  const beforeUpload = async (file: RcFile) => {
    const data = await new Promise<unknown[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target?.result);
          const sheetName = workbook.SheetNames[0]; // ใช้ชีทแรก
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet); // แปลงชีทเป็น JSON
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsArrayBuffer(file); // อ่านไฟล์ Excel
    });
    setFile(file);
    setOptions(
      Object.keys(data[0]).map((key) => ({
        label: key,
        value: key,
        key,
      }))
    );
    setModalVisible(true); // แสดงชื่อไฟล์ที่อัปโหลด
    return false;
  };
  const handleSelectChange = (key: string, value: string) => {
    const previousValue = selectedValues[key];
    setSelectedValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (previousValue) {
      setOptions((prev) => [
        ...prev,
        { label: previousValue, value: previousValue, key: previousValue },
      ]);
    }

    setOptions((prev) => prev.filter((opt) => opt.value !== value));

    form.setFieldsValue({ [key]: value });
  };
  return (
    <Flex align="center" gap={8}>
      <Upload
        name="file"
        accept=".xlsx"
        maxCount={1}
        showUploadList={false}
        beforeUpload={beforeUpload}
        {...props}
      >
        <Button icon={<UploadOutlined />}>อัพโหลด Excel</Button>
      </Upload>
      <Modal
        open={modalVisible}
        closable={false}
        title={
          <Flex gap={8} align="center">
            <Text h6 medium>
              เลือกคอลัมน์
            </Text>
            <Tooltip title="เลือกชื่อคอลัมน์ที่ตรงกับชื่อคอลัมน์ในไฟล์ Excel">
              <InfoCircleOutlined />
            </Tooltip>
          </Flex>
        }
        // footer={null}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="horizontal">
          {columns?.map((column, index) => (
            <Flex
              key={index}
              gap={10}
              align="center"
              style={{ paddingBlock: 4 }}
            >
              <FormItem name={column.key} label={column.title as string}>
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  options={options}
                  onChange={(value) =>
                    handleSelectChange(column.key as string, value)
                  }
                />
              </FormItem>
              {column?.information && (
                <Tooltip title={column.information}>
                  <InfoCircleOutlined />
                </Tooltip>
              )}
            </Flex>
          ))}
        </Form>
      </Modal>
    </Flex>
  );
};

export default ExcelUpload;
