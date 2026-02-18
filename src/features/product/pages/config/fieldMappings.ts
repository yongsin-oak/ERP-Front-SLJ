export interface ProductFieldMapping {
  key: string;
  label: string;
  required: boolean;
  type: "text" | "number" | "select";
  options?: string[];
  example?: string;
  validation?: (value: unknown) => string | null;
  alternativeNames?: string[]; // Alternative column names for auto-mapping
}

export const productFieldMappings: ProductFieldMapping[] = [
  {
    key: "barcode",
    label: "บาร์โค้ด",
    required: true,
    type: "text",
    example: "PRD001",
    alternativeNames: [
      "barcode",
      "รหัส",
      "รหัสสินค้า",
      "code",
      "product code",
      "บาร์โค้ด",
    ],
    validation: (value) => {
      const str = String(value || "");
      if (str.length < 3) {
        return "บาร์โค้ดต้องมีอย่างน้อย 3 ตัวอักษร";
      }
      return null;
    },
  },
  {
    key: "name",
    label: "ชื่อสินค้า",
    required: true,
    type: "text",
    example: "สินค้าตัวอย่าง",
    alternativeNames: [
      "name",
      "ชื่อ",
      "ชื่อสินค้า",
      "product name",
      "สินค้า",
      "product",
    ],
    validation: (value) => {
      const str = String(value || "");
      if (str.length < 2) {
        return "ชื่อสินค้าต้องมีอย่างน้อย 2 ตัวอักษร";
      }
      return null;
    },
  },
  {
    key: "sellPrice.pack",
    label: "ราคาขายต่อแพ็ค",
    required: false,
    type: "number",
    example: "100.50",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return "ราคาขายต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0";
      }
      return null;
    },
  },
  {
    key: "sellPrice.carton",
    label: "ราคาขายต่อลัง",
    required: false,
    type: "number",
    example: "1200.00",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return "ราคาขายต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0";
      }
      return null;
    },
  },
  {
    key: "costPrice.pack",
    label: "ราคาต้นทุนต่อแพ็ค",
    required: false,
    type: "number",
    example: "80.00",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return "ราคาต้นทุนต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0";
      }
      return null;
    },
  },
  {
    key: "costPrice.carton",
    label: "ราคาต้นทุนต่อลัง",
    required: false,
    type: "number",
    example: "960.00",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return "ราคาต้นทุนต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0";
      }
      return null;
    },
  },
  {
    key: "piecesPerPack",
    label: "จำนวนชิ้นต่อแพ็ค",
    required: false,
    type: "number",
    example: "12",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
        return "จำนวนชิ้นต่อแพ็คต้องเป็นจำนวนเต็มบวก";
      }
      return null;
    },
  },
  {
    key: "packPerCarton",
    label: "จำนวนแพ็คต่อลัง",
    required: false,
    type: "number",
    example: "12",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
        return "จำนวนแพ็คต่อลังต้องเป็นจำนวนเต็มบวก";
      }
      return null;
    },
  },
  {
    key: "remaining",
    label: "จำนวนสินค้าคงเหลือ",
    required: true,
    type: "number",
    example: "50",
    alternativeNames: [
      "remaining",
      "คงเหลือ",
      "จำนวนคงเหลือ",
      "จำนวนสินค้าคงเหลือ",
      "stock",
      "quantity",
      "จำนวน",
    ],
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
        return "จำนวนสินค้าคงเหลือต้องเป็นจำนวนเต็มที่มากกว่าหรือเท่ากับ 0";
      }
      return null;
    },
  },
  {
    key: "minStock",
    label: "จำนวนสินค้าขั้นต่ำ",
    required: false,
    type: "number",
    example: "10",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
        return "จำนวนสินค้าขั้นต่ำต้องเป็นจำนวนเต็มที่มากกว่าหรือเท่ากับ 0";
      }
      return null;
    },
  },
  {
    key: "productDimensions.width",
    label: "ความกว้างสินค้า (ซม.)",
    required: false,
    type: "number",
    example: "10.5",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return "ความกว้างต้องเป็นตัวเลขที่มากกว่า 0";
      }
      return null;
    },
  },
  {
    key: "productDimensions.length",
    label: "ความยาวสินค้า (ซม.)",
    required: false,
    type: "number",
    example: "15.0",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return "ความยาวต้องเป็นตัวเลขที่มากกว่า 0";
      }
      return null;
    },
  },
  {
    key: "productDimensions.height",
    label: "ความสูงสินค้า (ซม.)",
    required: false,
    type: "number",
    example: "5.0",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return "ความสูงต้องเป็นตัวเลขที่มากกว่า 0";
      }
      return null;
    },
  },
  {
    key: "productDimensions.weight",
    label: "น้ำหนักสินค้า (กรัม)",
    required: false,
    type: "number",
    example: "250.5",
    validation: (value) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return "น้ำหนักต้องเป็นตัวเลขที่มากกว่า 0";
      }
      return null;
    },
  },
  {
    key: "cartonDimensions.width",
    label: "ความกว้างลัง (ซม.)",
    required: false,
    type: "number",
    example: "30.0",
  },
  {
    key: "cartonDimensions.length",
    label: "ความยาวลัง (ซม.)",
    required: false,
    type: "number",
    example: "40.0",
  },
  {
    key: "cartonDimensions.height",
    label: "ความสูงลัง (ซม.)",
    required: false,
    type: "number",
    example: "25.0",
  },
  {
    key: "cartonDimensions.weight",
    label: "น้ำหนักลัง (กรัม)",
    required: false,
    type: "number",
    example: "3000.0",
  },
];
