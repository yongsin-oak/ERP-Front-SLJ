import { TableColumnsType } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { get } from "lodash";

export const essentialColumns: ColumnsType = [
  {
    title: "บาร์โค้ด",
    dataIndex: "barcode",
    key: "barcode",
    width: 150,
    ellipsis: true,
    fixed: "left",
    sorter: (a, b) => a.barcode.localeCompare(b.barcode),
    sortDirections: ["descend", "ascend"],
  },
  {
    title: "ชื่อสินค้า",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
    sorter: (a, b) => a.name.localeCompare(b.name),
    sortDirections: ["descend", "ascend"],
  },
  {
    title: "จำนวนคงเหลือ",
    dataIndex: "remaining",
    key: "remaining",
    width: 120,
    render: (val) => val || 0,
    sorter: (a, b) => (a.remaining || 0) - (b.remaining || 0),
    sortDirections: ["descend", "ascend"],
  },
  {
    title: "ยี่ห้อ",
    dataIndex: ["brand", "name"],
    key: "brand",
    width: 150,
    ellipsis: true,
    render: (val) => val || "-",
    sorter: (a, b) => {
      const brandA = get(a, "brand.name", "") || "";
      const brandB = get(b, "brand.name", "") || "";
      return brandA.localeCompare(brandB);
    },
    sortDirections: ["descend", "ascend"],
  },
  {
    title: "หมวดหมู่",
    dataIndex: ["category", "name"],
    key: "category",
    width: 150,
    ellipsis: true,
    render: (val) => val || "-",
    sorter: (a, b) => {
      const categoryA = get(a, "category.name", "") || "";
      const categoryB = get(b, "category.name", "") || "";
      return categoryA.localeCompare(categoryB);
    },
    sortDirections: ["descend", "ascend"],
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
