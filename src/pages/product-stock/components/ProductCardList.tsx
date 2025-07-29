import React from "react";
import {
  Flex,
  Typography,
  Checkbox,
  Tooltip,
  Collapse,
  Space,
  Button,
} from "antd";
import {
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import Text from "../../../components/common/Text";
import { ProductData } from "../interface";
import { formatDimensions, formatWeight } from "../utils/formatters";
import { highlightText } from "../utils/highlightText";
import {
  ProductCard,
  ProductCardHeader,
  ProductCardBody,
  InfoRow,
  StockBadge,
  EmptyState,
} from "../styles";
import { useProductStore } from "../store/productStore";
import { useAuth } from "../../../stores";
import { Role } from "../../../enums/Role.enum";
import { SPACING } from "@theme/constants";

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
  const {
    data,
    selectedItems,
    searchTerm,
    addSelectedItem,
    removeSelectedItem,
  } = useProductStore();

  // Check if user is superadmin
  const isSuperAdmin = user?.role === Role.SuperAdmin;

  const onSelectItem = (barcode: string, checked: boolean) => {
    if (checked) {
      addSelectedItem(barcode);
    } else {
      removeSelectedItem(barcode);
    }
  };
  const renderStockBadge = (remaining: number, minStock?: number | null) => {
    if (remaining === 0) {
      return (
        <StockBadge status="error" theme={theme}>
          หมด
        </StockBadge>
      );
    }
    if (minStock && remaining <= minStock) {
      return (
        <StockBadge status="warning" theme={theme}>
          {remaining} ชิ้น (ต่ำ)
        </StockBadge>
      );
    }
    if (remaining < 10) {
      return (
        <StockBadge status="warning" theme={theme}>
          {remaining} ชิ้น
        </StockBadge>
      );
    }
    return (
      <StockBadge status="success" theme={theme}>
        {remaining} ชิ้น
      </StockBadge>
    );
  };

  if (!data || data.length === 0) {
    return (
      <EmptyState theme={theme}>
        <Typography.Text type="secondary">ไม่พบข้อมูลสินค้า</Typography.Text>
      </EmptyState>
    );
  }

  return (
    <Flex vertical gap={16}>
      {data.map((item) => (
        <ProductCard key={item.barcode} theme={theme}>
          <ProductCardHeader theme={theme}>
            <Flex align="center" gap={SPACING.sm}>
              <Checkbox
                checked={selectedItems.includes(item.barcode)}
                onChange={(e) => onSelectItem(item.barcode, e.target.checked)}
              />
              <div className="product-title">
                <Text h6 bold style={{ margin: 0, lineHeight: 1.3 }}>
                  {searchTerm
                    ? highlightText(item.name, searchTerm)
                    : item.name}
                </Text>
                <div className="barcode">
                  {searchTerm
                    ? highlightText(item.barcode, searchTerm)
                    : item.barcode}
                </div>
              </div>
            </Flex>
            <Flex align="center" gap={SPACING.sm}>
              <Tooltip title="แก้ไขสินค้า">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEditProduct(item)}
                />
              </Tooltip>
              {isSuperAdmin && (
                <Tooltip title="ลบสินค้า">
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => onDeleteProduct(item)}
                  />
                </Tooltip>
              )}
              <div className="stock-info">
                {renderStockBadge(item.remaining, item.minStock)}
                {item.minStock && item.remaining <= item.minStock && (
                  <Tooltip
                    title={`สินค้าเหลือน้อย (ขั้นต่ำ: ${item.minStock})`}
                  >
                    <InfoCircleOutlined
                      style={{ color: "#faad14", marginLeft: 4 }}
                    />
                  </Tooltip>
                )}
              </div>
            </Flex>
          </ProductCardHeader>

          <ProductCardBody theme={theme}>
            <InfoRow theme={theme}>
              <span className="label">ยี่ห้อ:</span>
              <span
                className={`value ${!item?.brand?.name ? "value--empty" : ""}`}
              >
                {item?.brand?.name
                  ? searchTerm
                    ? highlightText(item.brand.name, searchTerm)
                    : item.brand.name
                  : "ไม่ระบุ"}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">หมวดหมู่:</span>
              <span
                className={`value ${
                  !item?.category?.name ? "value--empty" : ""
                }`}
              >
                {item?.category?.name
                  ? searchTerm
                    ? highlightText(item.category.name, searchTerm)
                    : item.category.name
                  : "ไม่ระบุ"}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">ราคาขาย/แพ็ค:</span>
              <span
                className={`value ${
                  item.sellPrice?.pack ? "value--price" : "value--empty"
                }`}
              >
                {item.sellPrice?.pack
                  ? `${item.sellPrice.pack.toLocaleString()} ฿`
                  : "ไม่ระบุ"}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">ราคาขาย/ลัง:</span>
              <span
                className={`value ${
                  item.sellPrice?.carton ? "value--price" : "value--empty"
                }`}
              >
                {item.sellPrice?.carton
                  ? `${item.sellPrice.carton.toLocaleString()} ฿`
                  : "ไม่ระบุ"}
              </span>
            </InfoRow>

            {/* Additional details */}
            <Collapse
              ghost
              size="small"
              items={[
                {
                  key: "1",
                  label: (
                    <span style={{ fontSize: 12, color: theme.textSecondary_ }}>
                      ข้อมูลเพิ่มเติม
                    </span>
                  ),
                  children: (
                    <Space
                      direction="vertical"
                      size={8}
                      style={{ width: "100%" }}
                    >
                      <InfoRow theme={theme}>
                        <span className="label">ราคาซื้อ/แพ็ค:</span>
                        <span
                          className={`value ${
                            item.costPrice?.pack ? "" : "value--empty"
                          }`}
                        >
                          {item.costPrice?.pack
                            ? `${item.costPrice.pack.toLocaleString()} ฿`
                            : "ไม่ระบุ"}
                        </span>
                      </InfoRow>

                      <InfoRow theme={theme}>
                        <span className="label">ราคาซื้อ/ลัง:</span>
                        <span
                          className={`value ${
                            item.costPrice?.carton ? "" : "value--empty"
                          }`}
                        >
                          {item.costPrice?.carton
                            ? `${item.costPrice.carton.toLocaleString()} ฿`
                            : "ไม่ระบุ"}
                        </span>
                      </InfoRow>

                      <InfoRow theme={theme}>
                        <span className="label">จำนวนขั้นต่ำ:</span>
                        <span
                          className={`value ${
                            item.minStock ? "" : "value--empty"
                          }`}
                        >
                          {item.minStock ? `${item.minStock} ชิ้น` : "ไม่ระบุ"}
                        </span>
                      </InfoRow>

                      <InfoRow theme={theme}>
                        <span className="label">จำนวนต่อแพ็ค:</span>
                        <span
                          className={`value ${
                            item.piecesPerPack ? "" : "value--empty"
                          }`}
                        >
                          {item.piecesPerPack
                            ? `${item.piecesPerPack} ชิ้น/แพ็ค`
                            : "ไม่ระบุ"}
                        </span>
                      </InfoRow>

                      <InfoRow theme={theme}>
                        <span className="label">แพ็คต่อลัง:</span>
                        <span
                          className={`value ${
                            item.packPerCarton ? "" : "value--empty"
                          }`}
                        >
                          {item.packPerCarton
                            ? `${item.packPerCarton} แพ็ค/ลัง`
                            : "ไม่ระบุ"}
                        </span>
                      </InfoRow>

                      <InfoRow theme={theme}>
                        <span className="label">ขนาดสินค้า:</span>
                        <span
                          className={`value ${
                            formatDimensions(item.productDimensions) ===
                            "ไม่ระบุ"
                              ? "value--empty"
                              : ""
                          }`}
                        >
                          {formatDimensions(item.productDimensions)}
                        </span>
                      </InfoRow>

                      <InfoRow theme={theme}>
                        <span className="label">น้ำหนักสินค้า:</span>
                        <span
                          className={`value ${
                            formatWeight(item.productDimensions?.weight) ===
                            "ไม่ระบุ"
                              ? "value--empty"
                              : ""
                          }`}
                        >
                          {formatWeight(item.productDimensions?.weight)}
                        </span>
                      </InfoRow>

                      <InfoRow theme={theme}>
                        <span className="label">ขนาดลัง:</span>
                        <span
                          className={`value ${
                            formatDimensions(item.cartonDimensions) ===
                            "ไม่ระบุ"
                              ? "value--empty"
                              : ""
                          }`}
                        >
                          {formatDimensions(item.cartonDimensions)}
                        </span>
                      </InfoRow>

                      <InfoRow theme={theme}>
                        <span className="label">น้ำหนักลัง:</span>
                        <span
                          className={`value ${
                            formatWeight(item.cartonDimensions?.weight) ===
                            "ไม่ระบุ"
                              ? "value--empty"
                              : ""
                          }`}
                        >
                          {formatWeight(item.cartonDimensions?.weight)}
                        </span>
                      </InfoRow>
                    </Space>
                  ),
                },
              ]}
            />
          </ProductCardBody>
        </ProductCard>
      ))}
    </Flex>
  );
};

export default ProductCardList;
