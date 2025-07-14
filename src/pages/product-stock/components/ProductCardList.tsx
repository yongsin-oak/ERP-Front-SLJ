import React from "react";
import { useTheme } from "@emotion/react";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Checkbox, Space } from "antd";
import { orderBy, get } from "lodash";
import { useProductStore } from "../store/productStore";
import { useAuth } from "../../../store";
import { Role } from "../../../enum/Role.enum";
import { ProductData } from "../interface/interface";

// Shared Components
import DataCard from "../../../components/common/DataCard";
import StockBadge from "../../../components/common/StockBadge";
import MButton from "../../../components/common/MButton";
import InfoRow from "../../../components/common/InfoRow";
import EmptyState from "../../../components/common/EmptyState";
import Text from "../../../components/common/Text";

// Utils
import { formatPrice } from "../utils/formatters";

interface ProductCardListProps {
  onEditProduct: (product: ProductData) => void;
  onDeleteProduct: (product: ProductData) => void;
}

const ProductCardList: React.FC<ProductCardListProps> = ({
  onEditProduct,
  onDeleteProduct,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === Role.SuperAdmin;

  const {
    data,
    searchTerm,
    selectedItems,
    filters,
    sortField,
    sortOrder,
    addSelectedItem,
    removeSelectedItem,
    openDetailDrawer,
  } = useProductStore();

  // Filter and sort logic (same as main component)
  const filteredAndSortedData = React.useMemo(() => {
    if (!data) return [];

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

    // Sort data
    return orderBy(
      filtered,
      [
        (item: ProductData) => {
          switch (sortField) {
            case "brand":
              return get(item, "brand.name", "") || "";
            case "category":
              return get(item, "category.name", "") || "";
            case "remaining":
              return item.remaining || 0;
            default:
              return item[sortField] || "";
          }
        },
      ],
      [sortOrder]
    );
  }, [data, searchTerm, filters, sortField, sortOrder]);

  const handleSelectItem = (barcode: string, checked: boolean) => {
    if (checked) {
      addSelectedItem(barcode);
    } else {
      removeSelectedItem(barcode);
    }
  };

  if (!filteredAndSortedData.length) {
    return (
      <EmptyState
        title="ไม่พบสินค้า"
        description="ไม่พบสินค้าที่ตรงกับเงื่อนไขที่กำหนด"
      />
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "16px",
      }}
    >
      {filteredAndSortedData.map((product) => (
        <DataCard key={product.barcode}>
          <DataCard.Header>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <Checkbox
                checked={selectedItems.includes(product.barcode)}
                onChange={(e) =>
                  handleSelectItem(product.barcode, e.target.checked)
                }
                style={{ marginTop: 2 }}
              />
              <div className="product-title" style={{ flex: 1 }}>
                <Text h6 bold style={{ margin: 0, marginBottom: 4 }}>
                  {product.name}
                </Text>
                <div className="barcode" style={{
                  fontFamily: "Courier New, monospace",
                  background: theme.backgroundSecondary_,
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  color: theme.textSecondary_,
                  display: "inline-block"
                }}>
                  {product.barcode}
                </div>
              </div>
              <div className="stock-info">
                <StockBadge
                  remaining={product.remaining}
                  minStock={product.minStock}
                />
              </div>
            </div>
          </DataCard.Header>

          <DataCard.Body>
            <div style={{ marginBottom: 16 }}>
              <InfoRow
                label="ยี่ห้อ"
                value={product.brand?.name || "ไม่ระบุ"}
                valueType={!product.brand?.name ? "empty" : "default"}
              />
              <InfoRow
                label="หมวดหมู่"
                value={product.category?.name || "ไม่ระบุ"}
                valueType={!product.category?.name ? "empty" : "default"}
              />
              <InfoRow
                label="ราคาขาย"
                value={formatPrice(product.sellPrice?.pack)}
                valueType={!product.sellPrice?.pack ? "empty" : "price"}
              />
              <InfoRow
                label="คงเหลือ"
                value={`${product.remaining || 0} แพ็ค`}
              />
            </div>

            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <MButton
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => openDetailDrawer(product)}
                title="ดูรายละเอียด"
              />
              <MButton
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditProduct(product)}
                title="แก้ไข"
              />
              {isSuperAdmin && (
                <MButton
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => onDeleteProduct(product)}
                  title="ลบ"
                />
              )}
            </Space>
          </DataCard.Body>
        </DataCard>
      ))}
    </div>
  );
};

export default ProductCardList;
