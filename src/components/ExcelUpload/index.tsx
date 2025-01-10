import { useState } from "react";
import { Button, Upload, UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { isEmpty, uniqBy } from "lodash";
import * as XLSX from "xlsx";
import { RcFile } from "antd/es/upload";

interface Props extends UploadProps {
  onSave: (data: unknown[]) => void; // ฟังก์ชันสำหรับบันทึกข้อมูล
}

const ExcelUpload = ({ onSave, ...props }: Props) => {
  const [fileList, setFileList] = useState<RcFile[]>([]);

  const handleSave = async () => {
    const allData: unknown[] = [];

    for (const file of fileList) {
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

      allData.push(...data);
    }

    // console.log("Merged JSON Data:", uniqBy(allData, "barcode"));
    onSave(uniqBy(allData, "barcode")); // ส่งข้อมูลไปบันทึก
    setFileList([]); // ล้างไฟล์ที่อัปโหลด
  };

  return (
    <div>
      <Upload
        name="file"
        accept=".xlsx"
        onRemove={(file) => {
          setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        }}
        showUploadList={{
          extra: ({ size = 0 }) => (
            <span style={{ color: "#cccccc" }}>
              ({(size / 1024 / 1024).toFixed(2)}MB)
            </span>
          ),
        }}
        beforeUpload={(file) => {
          setFileList((prev) => [...prev, file]); // เก็บไฟล์ที่อัปโหลด
          return false;
        }}
        // beforeUpload={handleUpload}
        {...props}
      >
        <Button icon={<UploadOutlined />}>อัพโหลด Excel</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleSave}
        disabled={isEmpty(fileList)} // ปิดปุ่มเมื่อไม่มีข้อมูล
        style={{ marginTop: 16 }}
      >
        บันทึกข้อมูล
      </Button>
    </div>
  );
};

export default ExcelUpload;
