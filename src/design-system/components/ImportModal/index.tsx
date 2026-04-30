import { useState, useCallback } from 'react';
import {
  Modal, Upload, Button, Select, Table, Space, Typography,
  Alert, Steps, Tag,
} from 'antd';
import {
  UploadOutlined, InboxOutlined, CheckCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import type { SheetColumn, ImportResult } from '@lib/sheet';
import { useSheet } from '@lib/sheet';

const { Text, Title } = Typography;
const { Dragger } = Upload;

interface Props<T extends Record<string, unknown>> {
  open: boolean;
  onClose: () => void;
  columns: SheetColumn<T>[];
  /** callback เมื่อ user confirm — ได้ T[] ที่ map แล้ว */
  onImport: (rows: T[]) => void | Promise<void>;
  fileName?: string;
  /** จำนวนแถว preview สูงสุด */
  previewLimit?: number;
}

type Step = 'upload' | 'mapping' | 'preview';

export function ImportModal<T extends Record<string, unknown>>({
  open,
  onClose,
  columns,
  onImport,
  fileName = 'import',
  previewLimit = 5,
}: Props<T>) {
  const sheet = useSheet<T>({ columns, fileName });

  const [step, setStep] = useState<Step>('upload');
  const [result, setResult] = useState<ImportResult<T> | null>(null);
  const [mapping, setMapping] = useState<Partial<Record<string, keyof T>>>({});
  const [mapped, setMapped] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const reset = useCallback(() => {
    setStep('upload');
    setResult(null);
    setMapping({});
    setMapped([]);
    setFileList([]);
  }, []);

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    setLoading(true);
    try {
      const res = await sheet.parseFile(file);
      setResult(res);
      // auto-map: ถ้า fileHeader ตรงกับ label ของ column → map อัตโนมัติ
      const autoMap: Partial<Record<string, keyof T>> = {};
      for (const header of res.fileHeaders) {
        const found = columns.find(
          (c) => c.label.toLowerCase() === header.toLowerCase(),
        );
        if (found) autoMap[header] = found.key;
      }
      setMapping(autoMap);
      setStep('mapping');
    } finally {
      setLoading(false);
    }
    return false; // prevent antd default upload
  }

  function handleApplyMapping() {
    if (!result) return;
    const rows = sheet.applyMapping(result.rawRows, mapping);
    setMapped(rows);
    setStep('preview');
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      await onImport(mapped);
      handleClose();
    } finally {
      setLoading(false);
    }
  }

  const mappedCount = Object.values(mapping).filter(Boolean).length;
  const columnOptions = columns.map((c) => ({ label: c.label, value: c.key as string }));

  const previewColumns = columns
    .filter((c) => Object.values(mapping).includes(c.key))
    .map((c) => ({
      title: c.label,
      dataIndex: c.key as string,
      key: c.key as string,
      ellipsis: true,
    }));

  const stepItems = [
    { title: 'อัพโหลดไฟล์' },
    { title: 'เลือก Column' },
    { title: 'ตรวจสอบ' },
  ];
  const stepIndex = { upload: 0, mapping: 1, preview: 2 }[step];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Import ข้อมูล"
      width={700}
      footer={null}
      destroyOnHidden
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Steps size="small" current={stepIndex} items={stepItems} />

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Dragger
              accept=".xlsx,.xls,.csv"
              maxCount={1}
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList([file as UploadFile]);
                handleFile(file as unknown as File);
                return false;
              }}
              onRemove={() => setFileList([])}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">คลิกหรือลากไฟล์มาวาง</p>
              <p className="ant-upload-hint">รองรับ .xlsx, .xls, .csv</p>
            </Dragger>
            <Button
              size="small"
              type="link"
              icon={<UploadOutlined />}
              onClick={() => sheet.downloadTemplate()}
            >
              ดาวน์โหลด Template
            </Button>
          </Space>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'mapping' && result && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              type="info"
              showIcon
              message={`พบ ${result.rawRows.length} แถว · ${result.fileHeaders.length} column ในไฟล์`}
            />
            <Text type="secondary">
              จับคู่ column ในไฟล์ (ซ้าย) กับ field ในระบบ (ขวา)
            </Text>
            <div style={{ display: 'grid', gap: 8 }}>
              {result.fileHeaders.map((header) => (
                <div key={header} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag style={{ minWidth: 140, textAlign: 'center' }}>{header}</Tag>
                  <ArrowRightOutlined style={{ color: '#999', flexShrink: 0 }} />
                  <Select
                    style={{ flex: 1 }}
                    allowClear
                    placeholder="— ไม่ใช้ —"
                    value={mapping[header] as string | undefined}
                    onChange={(val) =>
                      setMapping((prev) => ({ ...prev, [header]: val as keyof T | undefined }))
                    }
                    options={columnOptions}
                  />
                </div>
              ))}
            </div>
            <Space>
              <Button onClick={() => setStep('upload')}>ย้อนกลับ</Button>
              <Button
                type="primary"
                disabled={mappedCount === 0}
                onClick={handleApplyMapping}
              >
                ถัดไป ({mappedCount} field)
              </Button>
            </Space>
          </Space>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              message={
                <span>
                  พร้อม import <strong>{mapped.length}</strong> แถว
                  {mapped.length > previewLimit && ` (แสดง ${previewLimit} แถวแรก)`}
                </span>
              }
            />
            <Title level={5} style={{ margin: 0 }}>Preview</Title>
            <Table
              size="small"
              dataSource={mapped.slice(0, previewLimit).map((r, i) => ({ ...r, _key: i }))}
              columns={previewColumns}
              rowKey="_key"
              pagination={false}
              scroll={{ x: true }}
            />
            <Space>
              <Button onClick={() => setStep('mapping')}>ย้อนกลับ</Button>
              <Button
                type="primary"
                loading={loading}
                onClick={handleConfirm}
              >
                ยืนยัน Import {mapped.length} แถว
              </Button>
            </Space>
          </Space>
        )}
      </Space>
    </Modal>
  );
}
