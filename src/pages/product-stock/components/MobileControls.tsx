import React from "react";
import { Button, Flex, Select, Tooltip, Space } from "antd";
import { MobileControls } from "../styles";
import { useTheme } from "@emotion/react";
import { useProductStore } from "../store/productStore";

type SortField = "barcode" | "name" | "remaining" | "brand" | "category";

interface MobileControlsProps {
  handleSort: (field: SortField) => void;
  getSortIcon: (field: SortField) => React.ReactNode;
}

const MobileControlsComponent: React.FC<MobileControlsProps> = ({
  handleSort,
  getSortIcon,
}) => {
  const theme = useTheme();
  const { sortField, setSortField, sortOrder } = useProductStore();
  return (
    <MobileControls theme={theme}>
      <Flex justify="space-between" align="center">
        <Space>
          <Select
            value={sortField}
            onChange={(value) => setSortField(value)}
            options={[
              { value: "name", label: "ชื่อสินค้า" },
              { value: "barcode", label: "บาร์โค้ด" },
              { value: "remaining", label: "จำนวนคงเหลือ" },
              { value: "brand", label: "ยี่ห้อ" },
              { value: "category", label: "หมวดหมู่" },
            ]}
            style={{ width: 140 }}
            size="small"
          />
          <Tooltip
            title={`เรียงลำดับ ${
              sortOrder === "asc" ? "จากน้อยไปมาก" : "จากมากไปน้อย"
            }`}
          >
            <Button
              icon={getSortIcon(sortField)}
              onClick={() => handleSort(sortField)}
              type="text"
              size="small"
            />
          </Tooltip>
        </Space>
      </Flex>
    </MobileControls>
  );
};

export default MobileControlsComponent;
