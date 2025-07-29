import { Select, Space } from "antd";
import MInputNumber from "../../../components/common/MInputNumber";
import { InputFields } from "../../../components/Form/FormInputs/interface";
import MFormItem from "../../../components/Form/MFormItem";
const { Option } = Select;

export const addProductInputFields = ({
  remainingUnit,
  minStockUnit,
}: {
  remainingUnit: string;
  minStockUnit: string;
}): InputFields[] => {
  return [
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
        precision: 2,
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
        precision: 2,
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
        precision: 2,
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
        precision: 2,
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
        nofloat: true,
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
        nofloat: true,
      },
      formItemProps: {
        rules: [
          {
            type: "integer",
            min: 0,
            message: "จำนวนแพ็คต่อลังต้องมากกว่าหรือเท่ากับ 1",
          },
          {
            required: remainingUnit === "carton" || minStockUnit === "carton",
            message: "กรุณากรอกจำนวนแพ็คต่อลัง",
          },
        ],
      },
    },
    {
      label: "ขนาดสินค้า (กว้าง x ยาว x สูง)",
      customInput: (
        <Space.Compact style={{ width: "100%" }}>
          <MFormItem name={["productDimensions", "width"]}>
            <MInputNumber
              placeholder="กว้าง (ซม.)"
              suffix="ซม."
              precision={2}
            />
          </MFormItem>
          <MFormItem name={["productDimensions", "length"]}>
            <MInputNumber placeholder="ยาว (ซม.)" suffix="ซม." precision={2} />
          </MFormItem>
          <MFormItem name={["productDimensions", "height"]}>
            <MInputNumber placeholder="สูง (ซม.)" suffix="ซม." precision={2} />
          </MFormItem>
        </Space.Compact>
      ),
      required: false,
    },

    {
      label: "ขนาดลัง (กว้าง x ยาว x สูง)",
      customInput: (
        <Space.Compact style={{ width: "100%" }}>
          <MFormItem name={["cartonDimensions", "width"]}>
            <MInputNumber
              placeholder="กว้าง (ซม.)"
              suffix="ซม."
              precision={2}
            />
          </MFormItem>
          <MFormItem name={["cartonDimensions", "length"]}>
            <MInputNumber
              placeholder="กว้าง (ซม.)"
              suffix="ซม."
              precision={2}
            />
          </MFormItem>
          <MFormItem name={["cartonDimensions", "height"]}>
            <MInputNumber
              placeholder="กว้าง (ซม.)"
              suffix="ซม."
              precision={2}
            />
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
          <MFormItem name={["unit", "productWeight"]} initialValue="g" noStyle>
            <Select defaultValue="g">
              <Option value="g">กรัม</Option>
              <Option value="kg">กิโลกรัม</Option>
            </Select>
          </MFormItem>
        ),
        precision: 2,
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
          <MFormItem name={["unit", "cartonWeight"]} initialValue="g" noStyle>
            <Select defaultValue="g">
              <Option value="g">กรัม</Option>
              <Option value="kg">กิโลกรัม</Option>
            </Select>
          </MFormItem>
        ),
        precision: 2,
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
        nofloat: true,
        placeholder: "จำนวนสินค้าขั้นต่ำ",
        addonAfter: (
          <MFormItem name={["unit", "minStock"]} initialValue="carton" noStyle>
            <Select defaultValue="carton">
              <Option value="carton">ลัง</Option>
              <Option value="pack">แพ็ค</Option>
            </Select>
          </MFormItem>
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
        nofloat: true,
        placeholder: "จำนวนสินค้าที่เหลือ",
        addonAfter: (
          <MFormItem name={["unit", "remaining"]} initialValue="carton" noStyle>
            <Select defaultValue="carton">
              <Option value="carton">ลัง</Option>
              <Option value="pack">แพ็ค</Option>
            </Select>
          </MFormItem>
        ),
      },
    },
  ];
};
