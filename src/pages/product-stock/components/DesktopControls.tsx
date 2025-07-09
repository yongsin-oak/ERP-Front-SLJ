import React, { useMemo } from "react";
import { Button, Tooltip, Typography } from "antd";
import { AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import Text from "../../../components/common/Text";
import { ViewControls } from "../styles";
import { useTheme } from "@emotion/react";
import { useProductStore } from "../store/productStore";

const DesktopControls: React.FC = () => {
  const theme = useTheme();
  const { viewMode, setViewMode, data, searchTerm, filters } =
    useProductStore();

  // Calculate filtered total items for display
  const totalItems = useMemo(() => {
    if (!data) return 0;

    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.barcode.toLowerCase().includes(searchLower) ||
          item.brand?.name?.toLowerCase().includes(searchLower) ||
          item.category?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply advanced filters
    if (filters.stockLevel !== "all") {
      filtered = filtered.filter((item) => {
        switch (filters.stockLevel) {
          case "low":
            return item.minStock && item.remaining <= item.minStock;
          case "out":
            return item.remaining === 0;
          case "normal":
            return item.remaining > (item.minStock || 0);
          default:
            return true;
        }
      });
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(
        (item) => item.brand && filters.brands.includes(item.brand.id)
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(
        (item) => item.category && filters.categories.includes(item.category.id)
      );
    }

    // Price range filter
    filtered = filtered.filter((item) => {
      const price = item.sellPrice?.pack || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    return filtered.length;
  }, [data, searchTerm, filters]);
  return (
    <ViewControls theme={theme}>
      <div className="left-controls">
        <Text h5 style={{ margin: 0 }}>
          คลังสินค้า
        </Text>
        <Typography.Text type="secondary">{totalItems} รายการ</Typography.Text>
      </div>
      <div className="right-controls">
        <Tooltip title="มุมมองการ์ด">
          <Button
            icon={<AppstoreOutlined />}
            type={viewMode === "card" ? "primary" : "text"}
            onClick={() => setViewMode("card")}
            size="small"
          />
        </Tooltip>
        <Tooltip title="มุมมองตาราง">
          <Button
            icon={<TableOutlined />}
            type={viewMode === "table" ? "primary" : "text"}
            onClick={() => setViewMode("table")}
            size="small"
          />
        </Tooltip>
      </div>
    </ViewControls>
  );
};

export default DesktopControls;
