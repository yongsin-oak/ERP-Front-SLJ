import { TableColumnsType } from "antd";
import { ColumnsType } from "antd/es/table";
import { get } from "lodash";
import { highlightText } from "../utils/highlightText";
import { ProductData } from "../interface";

/**
 * Creates table columns with search term highlighting support
 * @param searchTerm - The search term to highlight
 * @returns Enhanced columns with highlighting
 */
export const createHighlightedColumns = (
  searchTerm: string
): ColumnsType<ProductData> => [
  {
    title: "บาร์โค้ด",
    dataIndex: "barcode",
    key: "barcode",
    width: 150,
    ellipsis: true,
    fixed: "left",
    sorter: (a: any, b: any) => a.barcode.localeCompare(b.barcode),
    sortDirections: ["descend", "ascend"],
    render: (val: string) =>
      searchTerm ? highlightText(val, searchTerm) : val,
  },
  {
    title: "ชื่อสินค้า",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    sortDirections: ["descend", "ascend"],
    render: (val: string) =>
      searchTerm ? highlightText(val, searchTerm) : val,
  },
  {
    title: "จำนวนคงเหลือ",
    dataIndex: "remaining",
    key: "remaining",
    width: 120,
    render: (val: number) => val || 0,
    sorter: (a: any, b: any) => (a.remaining || 0) - (b.remaining || 0),
    sortDirections: ["descend", "ascend"],
  },
  {
    title: "ยี่ห้อ",
    dataIndex: ["brand", "name"],
    key: "brand",
    width: 150,
    ellipsis: true,
    render: (val: string) => {
      if (!val) return "-";
      return searchTerm ? highlightText(val, searchTerm) : val;
    },
    sorter: (a: any, b: any) => {
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
    render: (val: string) => {
      if (!val) return "-";
      return searchTerm ? highlightText(val, searchTerm) : val;
    },
    sorter: (a: any, b: any) => {
      const categoryA = get(a, "category.name", "") || "";
      const categoryB = get(b, "category.name", "") || "";
      return categoryA.localeCompare(categoryB);
    },
    sortDirections: ["descend", "ascend"],
  },
];

// Keep the original columns for backward compatibility
export const essentialColumns: ColumnsType = [
  {
    title: "บาร์โค้ด",
    dataIndex: "barcode",
    key: "barcode",
    width: 150,
    ellipsis: true,
    fixed: "left",
    sorter: (a: any, b: any) => a.barcode.localeCompare(b.barcode),
    sortDirections: ["descend", "ascend"],
  },
  {
    title: "ชื่อสินค้า",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
    sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    sortDirections: ["descend", "ascend"],
  },
  {
    title: "จำนวนคงเหลือ",
    dataIndex: "remaining",
    key: "remaining",
    width: 120,
    render: (val: number) => val || 0,
    sorter: (a: any, b: any) => (a.remaining || 0) - (b.remaining || 0),
    sortDirections: ["descend", "ascend"],
  },
  {
    title: "ยี่ห้อ",
    dataIndex: ["brand", "name"],
    key: "brand",
    width: 150,
    ellipsis: true,
    render: (val: string) => val || "-",
    sorter: (a: any, b: any) => {
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
    render: (val: string) => val || "-",
    sorter: (a: any, b: any) => {
      const categoryA = get(a, "category.name", "") || "";
      const categoryB = get(b, "category.name", "") || "";
      return categoryA.localeCompare(categoryB);
    },
    sortDirections: ["descend", "ascend"],
  },
];

