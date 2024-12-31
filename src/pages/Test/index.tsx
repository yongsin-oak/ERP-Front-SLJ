import { UploadOutlined } from "@ant-design/icons";
import { Button, Table, Upload } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import * as XLSX from "xlsx";

const Test = () => {
  const [data, setData] = useState<any[]>();
  const [columns, setColumns] = useState<ColumnsType>();
  return (
    <div style={{ padding: 24, gap: 4 }}>
      <Upload
        name="file"
        accept=".xlsx"
        showUploadList={{
          extra: ({ size = 0 }) => (
            <span style={{ color: "#cccccc" }}>
              ({(size / 1024 / 1024).toFixed(2)}MB)
            </span>
          ),
        }}
        onChange={(info) => {
          const { file } = info;
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const data = new Uint8Array(e?.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: "array" });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              const json = XLSX.utils.sheet_to_json(sheet);
              const columns: ColumnsType = Object.keys(json?.[0] as object).map(
                (key, index) => ({
                  title: key,
                  dataIndex: key,
                  key,
                  fixed: index < 2 ? "left" : undefined,
                })
              );
              console.log(json[0]);
              setColumns(columns);
              setData(json);
            };
            reader.readAsArrayBuffer(file.originFileObj as Blob);
          }
        }}
      >
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>
      <div >
        <Table columns={columns} dataSource={data} size="small"></Table>
      </div>
    </div>
  );
};

export default Test;
