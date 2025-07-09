import React, { useMemo } from "react";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
} from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";
import { useProductStore } from "../store/productStore";

export interface FilterState {
  priceRange: [number, number];
  stockLevel: "all" | "low" | "out" | "normal";
  brands: string[];
  categories: string[];
}

const AdvancedFilter: React.FC = () => {
  const {
    advancedFilterModalOpen,
    closeAdvancedFilterModal,
    filters,
    setFilters,
    resetFilters,
    data,
  } = useProductStore();

  // Get unique brands and categories from data
  const uniqueBrands = useMemo(() => {
    if (!data) return [];
    const brands = data
      .map((item) => item.brand)
      .filter(Boolean)
      .filter(
        (brand, index, arr) =>
          arr.findIndex((b) => b?.id === brand?.id) === index
      );
    return brands as Array<{ id: string; name: string }>;
  }, [data]);

  const uniqueCategories = useMemo(() => {
    if (!data) return [];
    const categories = data
      .map((item) => item.category)
      .filter(Boolean)
      .filter(
        (category, index, arr) =>
          arr.findIndex((c) => c?.id === category?.id) === index
      );
    return categories as Array<{ id: string; name: string }>;
  }, [data]);

  const [form] = Form.useForm();

  const handleApply = () => {
    const values = form.getFieldsValue();
    setFilters(values);
    closeAdvancedFilterModal();
  };

  const handleReset = () => {
    form.resetFields();
    resetFilters();
  };

  const stockLevelOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "normal", label: "ปกติ" },
    { value: "low", label: "เหลือน้อย" },
    { value: "out", label: "หมด" },
  ];

  return (
    <Modal
      title="กรองขั้นสูง"
      open={advancedFilterModalOpen}
      onCancel={closeAdvancedFilterModal}
      footer={null}
      width={600}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={filters}
        onFinish={handleApply}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="stockLevel" label="สถานะสต็อก">
              <Select options={stockLevelOptions} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name={["priceRange", 0]} label="ราคาขั้นต่ำ">
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="0"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={["priceRange", 1]} label="ราคาสูงสุด">
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="100000"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="brands" label="ยี่ห้อ">
              <Select
                mode="multiple"
                placeholder="เลือกยี่ห้อ"
                allowClear
                options={uniqueBrands.map((brand) => ({
                  value: brand.id,
                  label: brand.name,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="categories" label="หมวดหมู่">
              <Select
                mode="multiple"
                placeholder="เลือกหมวดหมู่"
                allowClear
                options={uniqueCategories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button icon={<ClearOutlined />} onClick={handleReset}>
            ล้างตัวกรอง
          </Button>
          <Button type="primary" icon={<FilterOutlined />} htmlType="submit">
            ใช้ตัวกรอง
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

export default AdvancedFilter;
