import { Flex, Form, Input, message, Popconfirm, Space, Tabs } from "antd";

import { MFormItem } from "@components/Form";
import { MButton, SearchSelect } from "@components/common";
import type { SearchSelectOption } from "@components/common/SearchSelect";
import { onGetProduct, onGetProducts } from "@hooks/product";
import { ProductData } from "@interfaces/product";
import { useForm } from "antd/es/form/Form";
import { isEmpty } from "lodash";
import { useState } from "react";
import Editable, { EditableTableProps } from "../Editable";

interface ProductFormValues {
  barcode: string;
  product: SearchSelectOption<ProductData>;
}

interface ColumnData {
  order: number;
  productName: string;
  productAmount: number;
  productBarcode: string;
  [key: string]: unknown;
}
interface OrderEditableProps
  extends Omit<
    EditableTableProps,
    "onSave" | "dataSource" | "columns" | "onSaveCol"
  > {
  onConfirm?: (data: ColumnData[]) => void;
  onCancel?: () => void;
  onAddItem?: (productData: ProductData) => void;
}

// Function to find product by barcode
const findProductByBarcode = async (
  barcode: string
): Promise<ProductData | null> => {
  try {
    const product = await onGetProduct(barcode);
    return product || null;
  } catch (error) {
    console.error("Error finding product:", error);
    return null;
  }
};

// Product loading function for SearchSelect
const loadProductData = async (page: number, limit: number) => {
  const response = await onGetProducts({
    page,
    limit,
  });
  return {
    data: response.data || [],
    total: response.total || 0,
  };
};

// Product mapping function for SearchSelect
const mapProductsToOptions = (
  data: ProductData[]
): SearchSelectOption<ProductData>[] => {
  return data.map((product) => ({
    label: `[${product.barcode}] ${product.name}`,
    value: product.barcode,
    data: product,
  }));
};

const OrderEditable = ({
  onConfirm,
  onCancel,
  onAddItem,
}: OrderEditableProps) => {
  const [dataSource, setDataSource] = useState<ColumnData[]>([]);
  const [productForm] = useForm<ProductFormValues>();
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<"barcode" | "search">("barcode");

  const handleDelete = (order: React.Key) => {
    const newData = dataSource.filter((item) => item.order !== order);
    setDataSource(newData);
  };

  const handleSaveCol = (row: ColumnData) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.order === item.order);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const handleAdd = async () => {
    const formValues = productForm.getFieldsValue();

    let product: ProductData | null = null;

    if (searchMode === "barcode") {
      const { barcode } = formValues;
      if (isEmpty(barcode?.trim())) {
        message.warning("กรุณากรอกบาร์โค้ดสินค้า");
        return;
      }

      setLoading(true);
      try {
        // ค้นหาสินค้าจากบาร์โค้ด
        product = await findProductByBarcode(barcode.trim());

        if (!product) {
          message.error(`ไม่พบสินค้าที่มีบาร์โค้ด: ${barcode}`);
          return;
        }
      } catch (error) {
        console.error("Error finding product:", error);
        message.error("เกิดข้อผิดพลาดในการค้นหาสินค้า");
        return;
      } finally {
        setLoading(false);
      }
    } else {
      // โหมดค้นหาจากชื่อ
      const { product: selectedProduct } = formValues;
      if (isEmpty(selectedProduct)) {
        message.warning("กรุณาเลือกสินค้า");
        return;
      }

      product = selectedProduct.data || null;
      if (!product) {
        message.error("ข้อมูลสินค้าไม่ถูกต้อง");
        return;
      }
    }

    try {
      // เช็คว่าสินค้านี้มีในรายการแล้วหรือไม่
      const existingItemIndex = dataSource.findIndex(
        (item) => item.productBarcode === product!.barcode
      );

      if (existingItemIndex !== -1) {
        // ถ้ามีแล้วให้เพิ่ม amount อีก 1
        const updatedDataSource = [...dataSource];
        updatedDataSource[existingItemIndex] = {
          ...updatedDataSource[existingItemIndex],
          productAmount: updatedDataSource[existingItemIndex].productAmount + 1,
        };
        setDataSource(updatedDataSource);

        // อัพเดท state ใน parent component ด้วย
        handleSaveCol(updatedDataSource[existingItemIndex]);

        message.success(
          `เพิ่มจำนวนสินค้า "${product!.name}" เป็น ${
            updatedDataSource[existingItemIndex].productAmount
          } แล้ว`
        );
        productForm.resetFields();
        return;
      }

      onAddItem?.(product!);
      setDataSource((prev) => [
        ...prev,
        {
          order: prev.length + 1,
          productName: product!.name,
          productAmount: 1,
          productBarcode: product!.barcode,
        },
      ]);

      message.success(`เพิ่มสินค้า "${product!.name}" แล้ว`);
      productForm.resetFields();
    } catch (error) {
      console.error("Error adding product:", error);
      message.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setLoading(false);
    }
  };

  const editableColumns: EditableTableProps<ColumnData>["columns"] = [
    { title: "ลำดับ", dataIndex: "order", key: "order" },
    {
      title: "บาร์โค้ด",
      dataIndex: "productBarcode",
      key: "productBarcode",
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "จำนวน",
      dataIndex: "productAmount",
      key: "productAmount",
      editable: true,
      number: true,
    },
  ];
  const operationColumn = {
    title: "",
    dataIndex: "operation",
    render: (_: unknown, record: ColumnData) => {
      return dataSource.length >= 1 ? (
        <Popconfirm
          title="ลบรายการนี้?"
          onConfirm={() => handleDelete(record.order)}
          cancelText="ยกเลิก"
          okText="ลบ"
        >
          <a>Delete</a>
        </Popconfirm>
      ) : null;
    },
    width: 80,
    ellipsis: true,
  };

  return (
    <Flex vertical gap={8}>
      {dataSource.length > 0 && (
        <Editable<ColumnData>
          columns={[...editableColumns, operationColumn]}
          dataSource={dataSource}
          onSaveCol={handleSaveCol}
          rowKey={(record) => record.order}
        />
      )}
      <Form form={productForm} layout="vertical" onFinish={handleAdd}>
        <Tabs
          activeKey={searchMode}
          onChange={(key) => setSearchMode(key as "barcode" | "search")}
          items={[
            {
              key: "barcode",
              label: "🔍 สแกนบาร์โค้ด",
              children: (
                <MFormItem name={["barcode"]}>
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      placeholder="สแกนหรือพิมพ์บาร์โค้ดสินค้า"
                      disabled={loading}
                      onPressEnter={() => {
                        // เมื่อกด Enter ให้ submit form
                        if (!loading) {
                          productForm.submit();
                        }
                      }}
                      style={{ width: "100%" }}
                    />
                    <MButton htmlType="submit" loading={loading}>
                      {loading ? "กำลังค้นหา..." : "เพิ่มสินค้า"}
                    </MButton>
                  </Space.Compact>
                </MFormItem>
              ),
            },
            {
              key: "search",
              label: "📝 ค้นหาจากชื่อ",
              children: (
                <MFormItem name={["product"]}>
                  <Space.Compact style={{ width: "100%" }}>
                    <SearchSelect<ProductData>
                      onLoadData={loadProductData}
                      mapDataToOptions={mapProductsToOptions}
                      placeholder="ค้นหาสินค้าจากชื่อ"
                      onSelect={(_value, option) => {
                        productForm.setFieldsValue({
                          product: option as SearchSelectOption<ProductData>,
                        });
                      }}
                      pageSize={10}
                      enablePagination
                      enableSearch
                      searchDelay={300}
                      emptyText="ไม่พบสินค้า"
                      style={{ width: "100%" }}
                    />
                    <MButton htmlType="submit" loading={loading}>
                      {loading ? "กำลังค้นหา..." : "เพิ่มสินค้า"}
                    </MButton>
                  </Space.Compact>
                </MFormItem>
              ),
            },
          ]}
        />
      </Form>
      <Flex gap={8} justify="end" style={{ marginTop: 16 }}>
        <MButton type="default" onClick={onCancel}>
          ยกเลิก
        </MButton>
        <MButton onClick={() => onConfirm?.(dataSource)}>บันทึก</MButton>
      </Flex>
    </Flex>
  );
};

export default OrderEditable;
