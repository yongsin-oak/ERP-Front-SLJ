import React from "react";
import { Drawer, Space } from "antd";
import {
  InfoCircleOutlined,
  DollarOutlined,
  BoxPlotOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import Text from "../../../components/common/Text";
import {
  formatDimensions,
  formatWeight,
  formatPrice,
  formatQuantity,
} from "../utils/formatters";
import { ProductDetails, DrawerActions, InfoRow, StockBadge } from "../styles";
import { useProductStore } from "../store/productStore";
import { isMobile } from "../../../utils/responsive";
import { useWindowSize } from "@uidotdev/usehooks";
import MButton from "@components/common/MButton";

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
            <InfoRow theme={theme}>
              <span className="label">ยี่ห้อ:</span>
              <span
                className={`value ${
                  !product?.brand?.name ? "value--empty" : ""
                }`}
              >
                {product?.brand?.name || "ไม่ระบุ"}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">หมวดหมู่:</span>
              <span
                className={`value ${
                  !product?.category?.name ? "value--empty" : ""
                }`}
              >
                {product?.category?.name || "ไม่ระบุ"}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">จำนวนคงเหลือ:</span>
              <span className="value">{formatQuantity(product.remaining)}</span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">จำนวนขั้นต่ำ:</span>
              <span
                className={`value ${!product.minStock ? "value--empty" : ""}`}
              >
                {formatQuantity(product.minStock)}
              </span>
            </InfoRow>
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
            <InfoRow theme={theme}>
              <span className="label">ราคาซื้อ/แพ็ค:</span>
              <span
                className={`value ${
                  !product.costPrice?.pack ? "value--empty" : "value--price"
                }`}
              >
                {formatPrice(product.costPrice?.pack)}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">ราคาซื้อ/ลัง:</span>
              <span
                className={`value ${
                  !product.costPrice?.carton ? "value--empty" : "value--price"
                }`}
              >
                {formatPrice(product.costPrice?.carton)}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">ราคาขาย/แพ็ค:</span>
              <span
                className={`value ${
                  !product.sellPrice?.pack ? "value--empty" : "value--price"
                }`}
              >
                {formatPrice(product.sellPrice?.pack)}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">ราคาขาย/ลัง:</span>
              <span
                className={`value ${
                  !product.sellPrice?.carton ? "value--empty" : "value--price"
                }`}
              >
                {formatPrice(product.sellPrice?.carton)}
              </span>
            </InfoRow>
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
            <InfoRow theme={theme}>
              <span className="label">จำนวนต่อแพ็ค:</span>
              <span
                className={`value ${
                  !product.piecesPerPack ? "value--empty" : ""
                }`}
              >
                {formatQuantity(product.piecesPerPack, "ชิ้น/แพ็ค")}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">แพ็คต่อลัง:</span>
              <span
                className={`value ${
                  !product.packPerCarton ? "value--empty" : ""
                }`}
              >
                {formatQuantity(product.packPerCarton, "แพ็ค/ลัง")}
              </span>
            </InfoRow>
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
            <InfoRow theme={theme}>
              <span className="label">ขนาดสินค้า:</span>
              <span
                className={`value ${
                  formatDimensions(product.productDimensions) === "ไม่ระบุ"
                    ? "value--empty"
                    : ""
                }`}
              >
                {formatDimensions(product.productDimensions)}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">น้ำหนักสินค้า:</span>
              <span
                className={`value ${
                  formatWeight(product.productDimensions?.weight) === "ไม่ระบุ"
                    ? "value--empty"
                    : ""
                }`}
              >
                {formatWeight(product.productDimensions?.weight)}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">ขนาดลัง:</span>
              <span
                className={`value ${
                  formatDimensions(product.cartonDimensions) === "ไม่ระบุ"
                    ? "value--empty"
                    : ""
                }`}
              >
                {formatDimensions(product.cartonDimensions)}
              </span>
            </InfoRow>

            <InfoRow theme={theme}>
              <span className="label">น้ำหนักลัง:</span>
              <span
                className={`value ${
                  formatWeight(product.cartonDimensions?.weight) === "ไม่ระบุ"
                    ? "value--empty"
                    : ""
                }`}
              >
                {formatWeight(product.cartonDimensions?.weight)}
              </span>
            </InfoRow>
          </div>
        </div>

        {/* Actions */}
        <DrawerActions theme={theme}>
          <MButton type="default" onClick={onClose} block>
            ปิด
          </MButton>
        </DrawerActions>
      </ProductDetails>
    </Drawer>
  );
};

export default ProductDetailDrawer;
