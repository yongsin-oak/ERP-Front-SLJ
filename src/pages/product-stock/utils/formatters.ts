import { ProductDimensions } from "../interface";

export const formatDimensions = (
  dimensions: ProductDimensions | null
): string => {
  if (!dimensions) return "ไม่ระบุ";

  const { length, width, height } = dimensions;

  // ตรวจสอบว่ามีค่าที่เป็น null หรือ 0
  const validDimensions = [length, width, height].filter(
    (value) => value !== null && value !== undefined && value > 0
  );

  if (validDimensions.length === 0) return "ไม่ระบุ";

  // แสดงเฉพาะค่าที่มี
  if (validDimensions.length === 3) {
    return `${length} × ${width} × ${height} ซม.`;
  }

  // ถ้าไม่ครบ แสดงเฉพาะที่มี
  const dimensionLabels = [];
  if (length && length > 0) dimensionLabels.push(`ยาว ${length} ซม.`);
  if (width && width > 0) dimensionLabels.push(`กว้าง ${width} ซม.`);
  if (height && height > 0) dimensionLabels.push(`สูง ${height} ซม.`);

  return dimensionLabels.join(", ") || "ไม่ระบุ";
};

export const formatWeight = (weight: number | null | undefined): string => {
  if (!weight || weight <= 0) return "ไม่ระบุ";

  // แปลงเป็น kg ถ้าเป็นกรัม
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(2)} กก.`;
  }

  return `${weight} กรัม`;
};

export const formatPrice = (price: number | null | undefined): string => {
  if (!price || price <= 0) return "ไม่ระบุ";
  return `${price.toLocaleString()} ฿`;
};

export const formatQuantity = (
  quantity: number | null | undefined,
  unit: string = "ชิ้น"
): string => {
  if (!quantity || quantity <= 0) return "ไม่ระบุ";
  return `${quantity.toLocaleString()} ${unit}`;
};
