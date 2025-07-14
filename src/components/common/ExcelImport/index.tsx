import { useState } from "react";
import { message, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

// Shared Components
import MModal from "../MModal";
import MUpload from "../MUpload";
import MButton from "../MButton";
import Table from "../../tableComps/Table";
import InfoRow from "../InfoRow";

interface ExcelImportProps<T = Record<string, unknown>> {
  open: boolean;
  onClose: () => void;
  onImport: (data: T[]) => Promise<void>;
  title?: string;
  acceptedFileTypes?: string;
  columnMapping?: Record<string, string>;
  autoDetectMapping?: (columns: string[]) => Record<string, string>;
  transformData?: (rawData: Record<string, unknown>[]) => T[];
}

const ExcelImport = <T = Record<string, unknown>>({
  open,
  onClose,
  onImport,
  title = "นำเข้าข้อมูลจาก Excel",
  acceptedFileTypes = ".xls,.xlsx",
  columnMapping: initialMapping = {},
  autoDetectMapping,
  transformData = (data) => data as T[],
}: ExcelImportProps<T>) => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(initialMapping);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);

    // Read Excel file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setData(jsonData as Record<string, unknown>[]);

        // Auto-detect column mapping if function is provided
        if (autoDetectMapping && jsonData.length > 0) {
          const excelColumns = Object.keys(jsonData[0] as Record<string, unknown>);
          const mapping = autoDetectMapping(excelColumns);
          setColumnMapping(mapping);
        }
      } catch (error) {
        console.error("Error reading Excel file:", error);
        message.error("ไม่สามารถอ่านไฟล์ Excel ได้");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
    if (!data.length) {
      message.error("ไม่พบข้อมูลในไฟล์ Excel");
      return;
    }

    setIsLoading(true);
    try {
      // Transform Excel data using provided function
      const transformedData = transformData(data);
      await onImport(transformedData);
      
      message.success(`นำเข้าข้อมูล ${transformedData.length} รายการเรียบร้อยแล้ว`);
      handleClose();
    } catch (error) {
      console.error("Excel import error:", error);
      message.error("เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setData([]);
    setColumnMapping(initialMapping);
    setIsLoading(false);
    onClose();
  };

  const updateColumnMapping = (excelColumn: string, formField: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [excelColumn]: formField
    }));
  };

  return (
    <MModal
      title={title}
      open={open}
      onCancel={handleClose}
      footer={null}
      responsive
    >
      <div style={{ padding: 16 }}>
        {/* File Upload */}
        <MUpload
          accept={acceptedFileTypes}
          beforeUpload={(selectedFile: File) => {
            handleFileSelect(selectedFile);
            return false; // Prevent automatic upload
          }}
          showUploadList={false}
        >
          <MButton 
            icon={<UploadOutlined />} 
            size="large" 
            fullWidth
            disabled={isLoading}
          >
            เลือกไฟล์ Excel
          </MButton>
        </MUpload>

        {/* File Info */}
        {file && (
          <div style={{ marginTop: 16 }}>
            <InfoRow
              label="ไฟล์ที่เลือก"
              value={file.name}
              valueType="code"
            />
          </div>
        )}

        {/* Data Preview */}
        {data.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong>ตัวอย่างข้อมูลในไฟล์:</strong>
            <Table
              columns={Object.keys(data[0]).map((key) => ({
                title: key,
                dataIndex: key,
                key,
                width: 150,
              }))}
              dataSource={data}
              responsive={false}
              limit={5}
              jumper={false}
              rowKey={(_, index) => index || 0}
              scroll={{ x: 800 }}
            />
          </div>
        )}

        {/* Column Mapping */}
        {Object.keys(columnMapping).length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong>การแมปคอลัมน์:</strong>
            <div style={{ marginTop: 8 }}>
              {Object.entries(columnMapping).map(([excelCol, formField]) => (
                <InfoRow
                  key={excelCol}
                  label={`คอลัมน์ "${excelCol}"`}
                  value={
                    <Select
                      value={formField}
                      onChange={(value) => updateColumnMapping(excelCol, value)}
                      style={{ width: 200 }}
                      size="small"
                    >
                      <Select.Option value="barcode">รหัสสินค้า</Select.Option>
                      <Select.Option value="name">ชื่อสินค้า</Select.Option>
                      <Select.Option value="brand">ยี่ห้อ</Select.Option>
                      <Select.Option value="category">หมวดหมู่</Select.Option>
                      <Select.Option value="sellPrice">ราคาขาย</Select.Option>
                      <Select.Option value="remaining">จำนวนคงเหลือ</Select.Option>
                      <Select.Option value="">ไม่ใช้</Select.Option>
                    </Select>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: 24, display: "flex", gap: 8 }}>
          <MButton
            type="primary"
            onClick={handleImport}
            size="large"
            fullWidth
            loading={isLoading}
            disabled={!data.length}
          >
            นำเข้าข้อมูล
          </MButton>
          <MButton
            onClick={handleClose}
            size="large"
            fullWidth
            danger
            disabled={isLoading}
          >
            ยกเลิก
          </MButton>
        </div>
      </div>
    </MModal>
  );
};

export default ExcelImport;
