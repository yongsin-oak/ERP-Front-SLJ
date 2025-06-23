import { Select, Space } from "antd";
import MInputNumber from "../../../components/common/MInputNumber";
import { InputFields } from "../../../components/Form/FormInputs/interface";
import MFormItem from "../../../components/Form/MFormItem";
const { Option } = Select;

export const addProductInputFields: InputFields[] = [
  {
    name: "barcode",
    label: "บาร์โค้ด",
    inputProps: {
      placeholder: "บาร์โค้ด",
    },
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
  },
  {
    name: "name",
    label: "ชื่อสินค้า",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputProps: {
      placeholder: "ชื่อสินค้า",
    },
  },
  {
    name: "brandId",
    label: "ยี่ห้อ",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputComponent: "select",
    inputProps: {
      placeholder: "ยี่ห้อ",
      options: [
        { label: "Brand A", value: "Brand A" },
        { label: "Brand B", value: "Brand B" },
      ],
    },
    required: false,
  },
  {
    name: "categoryId",
    label: "หมวดหมู่",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputComponent: "select",
    inputProps: {
      placeholder: "หมวดหมู่",
      options: [
        { label: "Category A", value: "Category A" },
        { label: "Category B", value: "Category B" },
      ],
    },
    required: false,
  },
  {
    name: ["costPrice", "pack"],
    label: "ราคาต้นทุนต่อแพ็ค",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputComponent: "number",
    inputProps: {
      placeholder: "ราคาต้นทุนต่อแพ็ค",
      prefix: "฿",
    },
    required: false,
  },
  {
    name: ["costPrice", "carton"],
    label: "ราคาต้นทุนต่อลัง",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputComponent: "number",
    inputProps: {
      placeholder: "ราคาต้นทุนต่อลัง",
      prefix: "฿",
    },
    required: false,
  },
  {
    name: ["sellPrice", "pack"],
    label: "ราคาขายต่อแพ็ค",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputComponent: "number",
    inputProps: {
      placeholder: "ราคาขายต่อแพ็ค",
      prefix: "฿",
    },
    required: false,
  },
  {
    name: ["sellPrice", "carton"],
    label: "ราคาขายต่อลัง",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputComponent: "number",
    inputProps: {
      placeholder: "ราคาขายต่อลัง",
      prefix: "฿",
    },
    required: false,
  },
  {
    name: "piecesPerPack",
    label: "จำนวนชิ้นต่อแพ็ค",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputComponent: "number",
    inputProps: {
      placeholder: "จำนวนชิ้นต่อแพ็ค",
      suffix: "ชิ้น",
    },
    required: false,
  },
  {
    name: "packPerCarton",
    label: "จำนวนแพ็คต่อลัง",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputComponent: "number",
    inputProps: {
      placeholder: "จำนวนแพ็คต่อลัง",
      suffix: "แพ็ค",
    },
    required: false,
  },
  {
    label: "ขนาดสินค้า (กว้าง x ยาว x สูง)",
    customInput: (
      <Space.Compact>
        <MFormItem name={["productDimensions", "width"]}>
          <MInputNumber placeholder="กว้าง (ซม.)" suffix="ซม." />
        </MFormItem>
        <MFormItem name={["productDimensions", "length"]}>
          <MInputNumber placeholder="ยาว (ซม.)" suffix="ซม." />
        </MFormItem>
        <MFormItem name={["productDimensions", "height"]}>
          <MInputNumber placeholder="สูง (ซม.)" suffix="ซม." />
        </MFormItem>
      </Space.Compact>
    ),
    required: false,
  },

  {
    label: "ขนาดลัง (กว้าง x ยาว x สูง)",
    customInput: (
      <Space.Compact>
        <MFormItem name={["cartonDimensions", "width"]}>
          <MInputNumber placeholder="กว้าง (ซม.)" suffix="ซม." />
        </MFormItem>
        <MFormItem name={["cartonDimensions", "length"]}>
          <MInputNumber placeholder="กว้าง (ซม.)" suffix="ซม." />
        </MFormItem>
        <MFormItem name={["cartonDimensions", "height"]}>
          <MInputNumber placeholder="กว้าง (ซม.)" suffix="ซม." />
        </MFormItem>
      </Space.Compact>
    ),
    required: false,
  },
  {
    name: ["productDimensions", "weight"],
    label: "น้ำหนักสินค้า",
    inputComponent: "number",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputProps: {
      placeholder: "น้ำหนักสินค้า (กรัม)",
      addonAfter: (
        <Select defaultValue="g">
          <Option value="g">กรัม</Option>
          <Option value="kg">กิโลกรัม</Option>
        </Select>
      ),
    },
    required: false,
  },
  {
    name: ["cartonDimensions", "weight"],
    label: "น้ำหนักลัง",
    inputComponent: "number",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputProps: {
      placeholder: "น้ำหนักลัง (กรัม)",
      addonAfter: (
        <Select defaultValue="g">
          <Option value="g">กรัม</Option>
          <Option value="kg">กิโลกรัม</Option>
        </Select>
      ),
    },
    required: false,
  },
  {
    name: "minStock",
    label: "จำนวนสินค้าขั้นต่ำ",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputComponent: "number",
    inputProps: {
      placeholder: "จำนวนสินค้าขั้นต่ำ",
      addonAfter: (
        <Select defaultValue="pack">
          <Option value="pack">แพ็ค</Option>
          <Option value="carton">ลัง</Option>
        </Select>
      ),
    },
    required: false,
  },
  {
    name: "remaining",
    label: "จำนวนสินค้าที่เหลือ",
    colProps: {
      xs: {
        span: 24,
      },
      sm: {
        span: 12,
      },
    },
    inputComponent: "number",
    inputProps: {
      placeholder: "จำนวนสินค้าที่เหลือ",
      addonAfter: (
        <Select defaultValue="pack">
          <Option value="pack">แพ็ค</Option>
          <Option value="carton">ลัง</Option>
        </Select>
      ),
    },
  },
];
