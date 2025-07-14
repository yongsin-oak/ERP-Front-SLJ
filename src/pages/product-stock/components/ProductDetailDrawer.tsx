import {
  BarChartOutlined,
  BoxPlotOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { Button, Drawer, Space } from "antd";
import React from "react";
import InfoRow from "../../../components/common/InfoRow";
import StockBadge from "../../../components/common/StockBadge";
import Text from "../../../components/common/Text";
import { isMobile } from "../../../utils/responsive";
import { useProductStore } from "../store/productStore";
import { DrawerActions, ProductDetails } from "../styles";
import {
  formatDimensions,
  formatPrice,
  formatQuantity,
  formatWeight,
} from "../utils/formatters";

const ProductDetailDrawer: React.FC = () => {
  const theme = useTheme();
  const { width } = useWindowSize();
  const mobile = isMobile(width);
  const {
    selectedProduct: product,
    detailDrawerOpen: open,
    closeDetailDrawer: onClose,
  } = useProductStore();

  const renderStockBadge = (remaining: number, minStock?: number | null) => {
    return <StockBadge remaining={remaining} minStock={minStock} />;
  };

  if (!product) return null;

  return (
    <Drawer
      title={
        <Space>
          <InfoCircleOutlined />
          <span>รายละเอียดสินค้า</span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={mobile ? "100%" : 600}
      placement="right"
    >
      <ProductDetails theme={theme}>
        {/* Product Header */}
        <div className="product-header">
          <div className="product-title">
            <Text h4 bold style={{ margin: 0, marginBottom: 4 }}>
              {product.name}
            </Text>
            <div className="barcode">รหัสสินค้า: {product.barcode}</div>
          </div>
          <div className="stock-badge">
            {renderStockBadge(product.remaining, product.minStock)}
          </div>
        </div>

        {/* Basic Information */}
        <div className="info-section">
          <div className="section-header">
            <BoxPlotOutlined style={{ marginRight: 8 }} />
            <Text h6 bold style={{ margin: 0 }}>
              ข้อมูลพื้นฐาน
            </Text>
          </div>

          <div className="info-grid">
            <InfoRow
              label="ยี่ห้อ"
              value={product?.brand?.name || "ไม่ระบุ"}
              valueType={!product?.brand?.name ? "empty" : "default"}
            />

            <InfoRow
              label="หมวดหมู่"
              value={product?.category?.name || "ไม่ระบุ"}
              valueType={!product?.category?.name ? "empty" : "default"}
            />

            <InfoRow
              label="จำนวนคงเหลือ"
              value={formatQuantity(product.remaining)}
            />

            <InfoRow
              label="จำนวนขั้นต่ำ"
              value={formatQuantity(product.minStock)}
              valueType={!product.minStock ? "empty" : "default"}
            />
          </div>
        </div>

        {/* Pricing Information */}
        <div className="info-section">
          <div className="section-header">
            <DollarOutlined style={{ marginRight: 8 }} />
            <Text h6 bold style={{ margin: 0 }}>
              ข้อมูลราคา
            </Text>
          </div>

          <div className="info-grid">
            <InfoRow
              label="ราคาซื้อ/แพ็ค"
              value={formatPrice(product.costPrice?.pack)}
              valueType={!product.costPrice?.pack ? "empty" : "price"}
            />

            <InfoRow
              label="ราคาซื้อ/ลัง"
              value={formatPrice(product.costPrice?.carton)}
              valueType={!product.costPrice?.carton ? "empty" : "price"}
            />

            <InfoRow
              label="ราคาขาย/แพ็ค"
              value={formatPrice(product.sellPrice?.pack)}
              valueType={!product.sellPrice?.pack ? "empty" : "price"}
            />

            <InfoRow
              label="ราคาขาย/ลัง"
              value={formatPrice(product.sellPrice?.carton)}
              valueType={!product.sellPrice?.carton ? "empty" : "price"}
            />
          </div>
        </div>

        {/* Package Information */}
        <div className="info-section">
          <div className="section-header">
            <BarChartOutlined style={{ marginRight: 8 }} />
            <Text h6 bold style={{ margin: 0 }}>
              ข้อมูลบรรจุภัณฑ์
            </Text>
          </div>

          <div className="info-grid">
            <InfoRow
              label="จำนวนต่อแพ็ค"
              value={formatQuantity(product.piecesPerPack, "ชิ้น/แพ็ค")}
              valueType={!product.piecesPerPack ? "empty" : "default"}
            />

            <InfoRow
              label="แพ็คต่อลัง"
              value={formatQuantity(product.packPerCarton, "แพ็ค/ลัง")}
              valueType={!product.packPerCarton ? "empty" : "default"}
            />
          </div>
        </div>

        {/* Dimensions Information */}
        <div className="info-section">
          <div className="section-header">
            <SettingOutlined style={{ marginRight: 8 }} />
            <Text h6 bold style={{ margin: 0 }}>
              ข้อมูลขนาดและน้ำหนัก
            </Text>
          </div>

          <div className="info-grid">
            <InfoRow
              label="ขนาดสินค้า"
              value={formatDimensions(product.productDimensions)}
              valueType={formatDimensions(product.productDimensions) === "ไม่ระบุ" ? "empty" : "default"}
            />

            <InfoRow
              label="น้ำหนักสินค้า"
              value={formatWeight(product.productDimensions?.weight)}
              valueType={formatWeight(product.productDimensions?.weight) === "ไม่ระบุ" ? "empty" : "default"}
            />

            <InfoRow
              label="ขนาดลัง"
              value={formatDimensions(product.cartonDimensions)}
              valueType={formatDimensions(product.cartonDimensions) === "ไม่ระบุ" ? "empty" : "default"}
            />

            <InfoRow
              label="น้ำหนักลัง"
              value={formatWeight(product.cartonDimensions?.weight)}
              valueType={formatWeight(product.cartonDimensions?.weight) === "ไม่ระบุ" ? "empty" : "default"}
            />
          </div>
        </div>

        {/* Actions */}
        <DrawerActions theme={theme}>
          <Button type="default" onClick={onClose} block>
            ปิด
          </Button>
        </DrawerActions>
      </ProductDetails>
    </Drawer>
  );
};

export default ProductDetailDrawer;
