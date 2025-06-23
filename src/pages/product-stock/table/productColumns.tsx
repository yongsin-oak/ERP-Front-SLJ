import { TableColumnsType } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

export const essentialColumns: ColumnsType = [
  {
    title: "บาร์โค้ด",
    dataIndex: "barcode",
    key: "barcode",
    width: 150,
    ellipsis: true,
    fixed: "left",
  },
  {
    title: "ชื่อสินค้า",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
  },
  {
    title: "จำนวนคงเหลือ",
    dataIndex: "remaining",
    key: "remaining",
    width: 120,
    render: (val) => val || 0,
  },
  {
    title: "ยี่ห้อ",
    dataIndex: "brandName",
    key: "brandName",
    width: 150,
    ellipsis: true,
    render: (val) => val || "-",
  },
  {
    title: "หมวดหมู่",
    dataIndex: "category",
    key: "category",
    width: 150,
    ellipsis: true,
    render: (val) => val || "-",
  },
];

export const additionalColumns: TableColumnsType = [
  {
    title: "ราคาต้นทุน(แพ็ค)",
    dataIndex: ["costPrice", "pack"],
    key: "costPrice.pack",
  },
  {
    title: "ราคาต้นทุน(ลัง)",
    dataIndex: ["costPrice", "carton"],
    key: "costPrice.carton",
  },
  {
    title: "ราคาขาย(แพ็ค)",
    dataIndex: ["sellPrice", "pack"],
    key: "sellPrice.pack",
  },
  {
    title: "ราคาขาย(ลัง)",
    dataIndex: ["sellPrice", "carton"],
    key: "sellPrice.carton",
  },
  {
    title: "จำนวนชิ้นต่อแพ็ค",
    dataIndex: "piecesPerPack",
    key: "piecesPerPack",
  },
  {
    title: "จำนวนแพ็คต่อกล่อง",
    dataIndex: "packPerCarton",
    key: "packPerCarton",
  },
  {
    title: "มิติสินค้า (ซม.)",
    dataIndex: "productDimensions",
    key: "productDimensions",
    render: (val) => `${val.length} x ${val.width} x ${val.height}`,
  },
  {
    title: "มิติลัง (ซม.)",
    dataIndex: "cartonDimensions",
    key: "cartonDimensions",
    render: (val) => `${val.length} x ${val.width} x ${val.height}`,
  },
  {
    title: "น้ำหนัก (กก.)",
    dataIndex: "productDimensions",
    key: "productDimensions.weight",
    render: (val) => val.weight,
  },
  {
    title: "น้ำหนักลัง (กก.)",
    dataIndex: "cartonDimensions",
    key: "cartonDimensions.weight",
    render: (val) => val.weight,
  },
  {
    title: "จำนวนขั้นต่ำ",
    dataIndex: "minStock",
    key: "minStock",
  },
  {
    title: "วันที่เพิ่ม",
    dataIndex: "createdAt",
    render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm:ss"),
    key: "createdAt",
  },
  {
    title: "วันที่แก้ไข",
    dataIndex: "updatedAt",
    render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm:ss"),
    key: "updatedAt",
  },
];
