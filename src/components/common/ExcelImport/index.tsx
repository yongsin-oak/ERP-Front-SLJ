import { useState, useCallback } from "react";
import {
  Upload,
  Button,
  Table,
  Select,
  Alert,
  Card,
  Space,
  Typography,
  Divider,
  Collapse,
  Tag,
  message,
  Progress,
  Flex,
} from "antd";
import {
  InboxOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Dragger } = Upload;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface FieldMapping {
  key: string;
  label: string;
  required: boolean;
  type: "text" | "number" | "select";
  options?: string[];
  example?: string;
  validation?: (value: unknown) => string | null;
  alternativeNames?: string[];
}

interface ExcelImportProps<T> {
  fieldMappings: FieldMapping[];
  onImport: (data: T[]) => Promise<void>;
  templateName?: string;
  title?: string;
  description?: string;
}

interface ValidationError {
  row: number;
  field: string;
  value: unknown;
  message: string;
}

function ExcelImport<T extends Record<string, unknown>>({
  fieldMappings,
  onImport,
  templateName = "template",
  title = "นำเข้าข้อมูลจาก Excel",
  description = "อัปโหลดไฟล์ Excel เพื่อนำเข้าข้อมูล",
}: ExcelImportProps<T>) {
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<Record<string, unknown>[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isValidating, setIsValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<
    "upload" | "mapping" | "validation" | "import"
  >("upload");

  // Auto-mapping function
  const autoMapColumns = useCallback(
    (columns: string[]) => {
      const mapping: Record<string, string> = {};

      columns.forEach((col) => {
        const lowerCol = col.toLowerCase().trim();

        fieldMappings.forEach((field) => {
          // Skip if already mapped
          if (mapping[col]) return;

          // Exact match with field label
          if (lowerCol === field.label.toLowerCase()) {
            mapping[col] = field.key;
            return;
          }

          // Exact match with field key
          if (lowerCol === field.key.toLowerCase()) {
            mapping[col] = field.key;
            return;
          }

          // Check alternative names
          if (field.alternativeNames) {
            for (const altName of field.alternativeNames) {
              if (
                lowerCol === altName.toLowerCase() ||
                lowerCol.includes(altName.toLowerCase())
              ) {
                mapping[col] = field.key;
                return;
              }
            }
          }

          // Contains field label
          if (lowerCol.includes(field.label.toLowerCase())) {
            mapping[col] = field.key;
            return;
          }

          // Custom mapping rules for common patterns
          const fieldKey = field.key.toLowerCase();

          // Barcode mappings
          if (
            fieldKey === "barcode" &&
            (lowerCol.includes("barcode") ||
              lowerCol.includes("รหัส") ||
              lowerCol.includes("บาร์โค้ด") ||
              lowerCol.includes("code"))
          ) {
            mapping[col] = field.key;
            return;
          }

          // Name mappings
          if (
            fieldKey === "name" &&
            (lowerCol.includes("name") ||
              lowerCol.includes("ชื่อ") ||
              lowerCol.includes("product") ||
              lowerCol.includes("สินค้า"))
          ) {
            mapping[col] = field.key;
            return;
          }

          // Price mappings
          if (
            fieldKey.includes("price") &&
            (lowerCol.includes("price") ||
              lowerCol.includes("ราคา") ||
              lowerCol.includes("cost") ||
              lowerCol.includes("ต้นทุน") ||
              lowerCol.includes("ขาย"))
          ) {
            // More specific price mapping
            if (
              fieldKey.includes("sell") &&
              (lowerCol.includes("sell") || lowerCol.includes("ขาย"))
            ) {
              mapping[col] = field.key;
              return;
            }
            if (
              fieldKey.includes("cost") &&
              (lowerCol.includes("cost") || lowerCol.includes("ต้นทุน"))
            ) {
              mapping[col] = field.key;
              return;
            }
            if (
              fieldKey.includes("pack") &&
              (lowerCol.includes("pack") || lowerCol.includes("แพ็ค"))
            ) {
              mapping[col] = field.key;
              return;
            }
            if (
              fieldKey.includes("carton") &&
              (lowerCol.includes("carton") || lowerCol.includes("ลัง"))
            ) {
              mapping[col] = field.key;
              return;
            }
          }

          // Stock/remaining mappings
          if (
            (fieldKey === "remaining" || fieldKey === "minstock") &&
            (lowerCol.includes("stock") ||
              lowerCol.includes("คงเหลือ") ||
              lowerCol.includes("จำนวน") ||
              lowerCol.includes("remaining") ||
              lowerCol.includes("quantity"))
          ) {
            if (
              fieldKey === "minstock" &&
              (lowerCol.includes("min") ||
                lowerCol.includes("ต่ำ") ||
                lowerCol.includes("ขั้น"))
            ) {
              mapping[col] = field.key;
              return;
            }
            if (
              fieldKey === "remaining" &&
              !lowerCol.includes("min") &&
              !lowerCol.includes("ต่ำ")
            ) {
              mapping[col] = field.key;
              return;
            }
          }

          // Dimension mappings
          if (fieldKey.includes("dimensions")) {
            if (lowerCol.includes("width") || lowerCol.includes("กว้าง")) {
              if (fieldKey.includes("width")) mapping[col] = field.key;
            } else if (
              lowerCol.includes("length") ||
              lowerCol.includes("ยาว")
            ) {
              if (fieldKey.includes("length")) mapping[col] = field.key;
            } else if (
              lowerCol.includes("height") ||
              lowerCol.includes("สูง")
            ) {
              if (fieldKey.includes("height")) mapping[col] = field.key;
            } else if (
              lowerCol.includes("weight") ||
              lowerCol.includes("น้ำหนัก")
            ) {
              if (fieldKey.includes("weight")) mapping[col] = field.key;
            }
          }

          // Pieces/pack mappings
          if (
            fieldKey === "piecesperpack" &&
            (lowerCol.includes("pieces") ||
              lowerCol.includes("ชิ้น") ||
              lowerCol.includes("piece"))
          ) {
            mapping[col] = field.key;
            return;
          }

          // Pack per carton mappings
          if (
            fieldKey === "packpercarton" &&
            lowerCol.includes("pack") &&
            (lowerCol.includes("carton") || lowerCol.includes("ลัง"))
          ) {
            mapping[col] = field.key;
            return;
          }
        });
      });

      return mapping;
    },
    [fieldMappings]
  );

  // Validation function
  const validateData = useCallback(() => {
    setIsValidating(true);
    const errors: ValidationError[] = [];

    excelData.forEach((row, index) => {
      fieldMappings.forEach((field) => {
        const excelColumn = Object.keys(columnMapping).find(
          (key) => columnMapping[key] === field.key
        );

        if (!excelColumn) {
          if (field.required) {
            errors.push({
              row: index + 1,
              field: field.key,
              value: null,
              message: `ไม่พบข้อมูลสำหรับฟิลด์ที่จำเป็น: ${field.label}`,
            });
          }
          return;
        }

        const value = row[excelColumn];

        // Check required fields
        if (
          field.required &&
          (value === undefined || value === null || value === "")
        ) {
          errors.push({
            row: index + 1,
            field: field.key,
            value: value,
            message: `${field.label} เป็นฟิลด์ที่จำเป็นต้องกรอก`,
          });
          return;
        }

        // Type validation
        if (value !== undefined && value !== null && value !== "") {
          if (field.type === "number") {
            const numValue = Number(value);
            if (isNaN(numValue)) {
              errors.push({
                row: index + 1,
                field: field.key,
                value: value,
                message: `${field.label} ต้องเป็นตัวเลข`,
              });
            }
          }

          if (field.type === "select" && field.options) {
            if (!field.options.includes(String(value))) {
              errors.push({
                row: index + 1,
                field: field.key,
                value: value,
                message: `${
                  field.label
                } ต้องเป็นค่าใดค่าหนึ่งจาก: ${field.options.join(", ")}`,
              });
            }
          }
        }

        // Custom validation
        if (
          field.validation &&
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          const validationResult = field.validation(value);
          if (validationResult) {
            errors.push({
              row: index + 1,
              field: field.key,
              value: value,
              message: validationResult,
            });
          }
        }
      });
    });

    setValidationErrors(errors);
    setIsValidating(false);

    if (errors.length === 0) {
      setStep("import");
    }
  }, [excelData, columnMapping, fieldMappings]);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          message.error("ไม่พบข้อมูลในไฟล์ Excel");
          return;
        }

        const columns = Object.keys(jsonData[0] as Record<string, unknown>);
        const autoMapping = autoMapColumns(columns);

        setExcelData(jsonData as Record<string, unknown>[]);
        setExcelColumns(columns);
        setColumnMapping(autoMapping);
        setStep("mapping");
      } catch (error) {
        console.error("Error reading Excel file:", error);
        message.error("ไม่สามารถอ่านไฟล์ Excel ได้");
      }
    };
    reader.readAsArrayBuffer(file);

    return false; // Prevent default upload
  };

  // Generate Excel template
  const downloadTemplate = () => {
    // Create template data as array of objects (each object = one row)
    const templateData = [];

    // Create header row
    const headerRow: Record<string, string> = {};
    fieldMappings.forEach((field) => {
      headerRow[field.label] = field.label;
    });
    templateData.push(headerRow);

    // Create example data rows
    const exampleRow1: Record<string, string> = {};
    const exampleRow2: Record<string, string> = {};

    fieldMappings.forEach((field) => {
      exampleRow1[field.label] =
        field.example || `ตัวอย่าง${field.required ? " (จำเป็น)" : ""}`;
      // Create different example for second row
      if (field.key === "barcode") {
        exampleRow2[field.label] = "PRD002";
      } else if (field.key === "name") {
        exampleRow2[field.label] = "สินค้าตัวอย่างที่ 2";
      } else if (field.type === "number" && field.example) {
        const num = parseFloat(field.example);
        exampleRow2[field.label] = isNaN(num) ? field.example : String(num + 1);
      } else {
        exampleRow2[field.label] =
          field.example || `ตัวอย่าง${field.required ? " (จำเป็น)" : ""}`;
      }
    });

    templateData.push(exampleRow1);
    templateData.push(exampleRow2);

    const worksheet = XLSX.utils.json_to_sheet(templateData, {
      header: fieldMappings.map((f) => f.label),
    });

    // Set column widths for better readability
    const columnWidths = fieldMappings.map((field) => ({
      width: Math.max(field.label.length, (field.example || "").length) + 5,
    }));
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "สินค้า");

    // Add instructions sheet
    const instructions = [
      ["คำแนะนำการใช้งาน"],
      [""],
      ['1. กรอกข้อมูลสินค้าในแผ่น "สินค้า"'],
      ['2. ฟิลด์ที่มี "(จำเป็น)" ต้องกรอกให้ครบ'],
      ["3. ใส่เฉพาะตัวเลขในคอลัมน์ที่เป็นตัวเลข"],
      ["4. อย่าเปลี่ยนชื่อคอลัมน์ในแถวแรก"],
      ["5. สามารถลบแถวตัวอย่างและเพิ่มข้อมูลของคุณได้"],
      [""],
      ["ฟิลด์ที่จำเป็นต้องกรอก:"],
      ...fieldMappings.filter((f) => f.required).map((f) => [`- ${f.label}`]),
      [""],
      ["ฟิลด์เพิ่มเติม (ไม่จำเป็น):"],
      ...fieldMappings.filter((f) => !f.required).map((f) => [`- ${f.label}`]),
    ];

    const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
    instructionSheet["!cols"] = [{ width: 50 }];
    XLSX.utils.book_append_sheet(workbook, instructionSheet, "คำแนะนำ");

    XLSX.writeFile(workbook, `${templateName}_template.xlsx`);
  };

  // Handle import
  const handleImport = async () => {
    setImporting(true);

    try {
      const transformedData: T[] = excelData.map((row) => {
        const transformed: Record<string, unknown> = {};

        Object.entries(columnMapping).forEach(([excelCol, fieldKey]) => {
          const field = fieldMappings.find((f) => f.key === fieldKey);
          let value = row[excelCol];

          // Transform value based on field type
          if (field && value !== undefined && value !== null && value !== "") {
            if (field.type === "number") {
              value = Number(value);
            }
          }

          // Handle nested fields (like sellPrice.pack)
          if (fieldKey.includes(".")) {
            const keys = fieldKey.split(".");
            let current = transformed as Record<string, unknown>;
            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) {
                current[keys[i]] = {};
              }
              current = current[keys[i]] as Record<string, unknown>;
            }
            current[keys[keys.length - 1]] = value;
          } else {
            transformed[fieldKey] = value;
          }
        });

        return transformed as T;
      });

      await onImport(transformedData);

      // Reset state
      setFile(null);
      setExcelData([]);
      setExcelColumns([]);
      setColumnMapping({});
      setValidationErrors([]);
      setStep("upload");

      message.success(
        `นำเข้าข้อมูล ${transformedData.length} รายการเรียบร้อยแล้ว`
      );
    } catch (error) {
      console.error("Import error:", error);
      message.error("เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
    } finally {
      setImporting(false);
    }
  };

  const renderUploadStep = () => (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <div>
        <Title level={4}>{title}</Title>
        <Paragraph>{description}</Paragraph>
      </div>

      <Alert
        message="ข้อมูลที่ต้องการ"
        description={
          <div>
            <p>ไฟล์ Excel ควรมีคอลัมน์ดังนี้:</p>
            <ul>
              {fieldMappings.map((field) => (
                <li key={field.key}>
                  <strong>{field.label}</strong>
                  {field.required && (
                    <Tag color="red" style={{ marginLeft: 8 }}>
                      จำเป็น
                    </Tag>
                  )}
                  {field.example && (
                    <Text type="secondary"> (ตัวอย่าง: {field.example})</Text>
                  )}
                </li>
              ))}
            </ul>
          </div>
        }
        type="info"
        showIcon
      />

      <Card>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            icon={<DownloadOutlined />}
            onClick={downloadTemplate}
            type="dashed"
            block
          >
            ดาวน์โหลดไฟล์ตัวอย่าง Excel
          </Button>

          <Divider>หรือ</Divider>

          <Dragger
            accept=".xlsx,.xls"
            beforeUpload={handleFileUpload}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">คลิกหรือลากไฟล์มาวางที่นี่</p>
            <p className="ant-upload-hint">
              รองรับไฟล์ .xlsx และ .xls เท่านั้น
            </p>
          </Dragger>
        </Space>
      </Card>
    </Space>
  );

  const renderMappingStep = () => (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <div>
        <Title level={4}>จับคู่คอลัมน์ข้อมูล</Title>
        <Paragraph>
          จับคู่คอลัมน์ในไฟล์ Excel กับฟิลด์ในระบบ
          {file && <Text type="secondary"> (ไฟล์: {file.name})</Text>}
        </Paragraph>
      </div>

      <Alert
        message={`พบข้อมูล ${excelData.length} แถว | แมปอัตโนมัติได้ ${
          Object.keys(columnMapping).length
        } คอลัมน์`}
        type="success"
        showIcon
      />

      <Card title="การจับคู่คอลัมน์">
        {/* Show unmapped columns */}
        {(() => {
          const mappedColumns = Object.keys(columnMapping);
          const unmappedColumns = excelColumns.filter(
            (col) => !mappedColumns.includes(col)
          );
          const requiredUnmapped = fieldMappings.filter(
            (field) =>
              field.required &&
              !Object.values(columnMapping).includes(field.key)
          );

          return (
            <div style={{ marginBottom: 16 }}>
              {unmappedColumns.length > 0 && (
                <Alert
                  message={`คอลัมน์ที่ยังไม่ได้จับคู่: ${unmappedColumns.join(
                    ", "
                  )}`}
                  type="warning"
                  style={{ marginBottom: 8 }}
                />
              )}
              {requiredUnmapped.length > 0 && (
                <Alert
                  message={`ฟิลด์จำเป็นที่ยังไม่ได้จับคู่: ${requiredUnmapped
                    .map((f) => f.label)
                    .join(", ")}`}
                  type="error"
                />
              )}
            </div>
          );
        })()}

        <Space direction="vertical" style={{ width: "100%" }}>
          {fieldMappings.map((field) => (
            <div
              key={field.key}
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              <div style={{ minWidth: 200 }}>
                <Text strong>{field.label}</Text>
                {field.required && (
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    จำเป็น
                  </Tag>
                )}
              </div>
              <Select
                style={{ width: 200 }}
                placeholder="เลือกคอลัมน์"
                allowClear
                value={Object.keys(columnMapping).find(
                  (key) => columnMapping[key] === field.key
                )}
                onChange={(value) => {
                  const newMapping = { ...columnMapping };

                  // Remove old mapping for this field
                  Object.keys(newMapping).forEach((key) => {
                    if (newMapping[key] === field.key) {
                      delete newMapping[key];
                    }
                  });

                  // Add new mapping
                  if (value) {
                    newMapping[value] = field.key;
                  }

                  setColumnMapping(newMapping);
                }}
              >
                {excelColumns.map((col) => (
                  <Option key={col} value={col}>
                    {col}
                  </Option>
                ))}
              </Select>
              {field.example && (
                <Text type="secondary">ตัวอย่าง: {field.example}</Text>
              )}
            </div>
          ))}
        </Space>
      </Card>

      <Collapse>
        <Panel header="ดูตัวอย่างข้อมูล (5 แถวแรก)" key="preview">
          <Table
            dataSource={excelData.slice(0, 5)}
            columns={excelColumns.map((col) => ({
              title: col,
              dataIndex: col,
              key: col,
              render: (text) => String(text || ""),
            }))}
            pagination={false}
            scroll={{ x: true }}
            size="small"
          />
        </Panel>
      </Collapse>

      <Space>
        <Button onClick={() => setStep("upload")}>กลับ</Button>
        <Button
          type="primary"
          onClick={validateData}
          disabled={Object.keys(columnMapping).length === 0}
        >
          ตรวจสอบข้อมูล
        </Button>
      </Space>
    </Space>
  );

  const renderValidationStep = () => (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <div>
        <Title level={4}>ตรวจสอบข้อมูล</Title>
        {isValidating && <Progress percent={100} status="active" />}
      </div>

      {validationErrors.length > 0 ? (
        <Alert
          message={`พบข้อผิดพลาด ${validationErrors.length} รายการ`}
          description="กรุณาแก้ไขข้อผิดพลาดก่อนนำเข้าข้อมูล"
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
        />
      ) : (
        <Alert
          message="ข้อมูลถูกต้อง"
          description={`พร้อมนำเข้าข้อมูล ${excelData.length} รายการ`}
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      )}

      {validationErrors.length > 0 && (
        <Card title="รายการข้อผิดพลาด">
          <Table
            dataSource={validationErrors}
            columns={[
              {
                title: "แถว",
                dataIndex: "row",
                width: 80,
              },
              {
                title: "ฟิลด์",
                dataIndex: "field",
                render: (field) => {
                  const fieldInfo = fieldMappings.find((f) => f.key === field);
                  return fieldInfo?.label || field;
                },
              },
              {
                title: "ค่า",
                dataIndex: "value",
                render: (value) => String(value || "ว่าง"),
              },
              {
                title: "ข้อผิดพลาด",
                dataIndex: "message",
              },
            ]}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      )}

      <Space>
        <Button onClick={() => setStep("mapping")}>กลับ</Button>
        {validationErrors.length === 0 && (
          <Button type="primary" onClick={() => setStep("import")}>
            ดำเนินการนำเข้า
          </Button>
        )}
        <Button onClick={validateData} loading={isValidating}>
          ตรวจสอบอีกครั้ง
        </Button>
      </Space>
    </Space>
  );

  const renderImportStep = () => (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <div>
        <Title level={4}>นำเข้าข้อมูล</Title>
        <Paragraph>พร้อมนำเข้าข้อมูล {excelData.length} รายการ</Paragraph>
      </div>

      <Alert
        message="ข้อมูลพร้อมนำเข้า"
        description="การดำเนินการนี้จะเพิ่มข้อมูลใหม่เข้าสู่ระบบ"
        type="info"
        showIcon
      />

      {importing && <Progress percent={100} status="active" />}

      <Space>
        <Button onClick={() => setStep("validation")} disabled={importing}>
          กลับ
        </Button>
        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          onClick={handleImport}
          loading={importing}
        >
          เริ่มนำเข้าข้อมูล
        </Button>
      </Space>
    </Space>
  );

  const renderStepIndicator = () => {
    const steps = [
      { key: "upload", title: "1. อัปโหลดไฟล์" },
      { key: "mapping", title: "2. จับคู่คอลัมน์" },
      { key: "validation", title: "3. ตรวจสอบข้อมูล" },
      { key: "import", title: "4. นำเข้าข้อมูล" },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === step);

    return (
      <div style={{ marginBottom: 24 }}>
        <Flex justify="center" gap={16}>
          {steps.map((stepItem, index) => (
            <div
              key={stepItem.key}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                backgroundColor:
                  index <= currentStepIndex ? "#1890ff" : "#f0f0f0",
                color: index <= currentStepIndex ? "white" : "#999",
                fontWeight: 500,
                fontSize: "14px",
                minWidth: "120px",
                textAlign: "center",
              }}
            >
              {stepItem.title}
            </div>
          ))}
        </Flex>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      {renderStepIndicator()}
      {step === "upload" && renderUploadStep()}
      {step === "mapping" && renderMappingStep()}
      {step === "validation" && renderValidationStep()}
      {step === "import" && renderImportStep()}
    </div>
  );
}

export default ExcelImport;
