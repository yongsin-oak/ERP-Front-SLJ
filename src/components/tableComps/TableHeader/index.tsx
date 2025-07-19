import React from "react";
import { Button, Tooltip, Typography } from "antd";
import { AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import Text from "@components/common/Text";
import { ViewControls } from "./styles";
import { useTheme } from "@emotion/react";

export interface TableHeaderProps {
  viewMode: "card" | "table";
  setViewMode: (mode: "card" | "table") => void;
  tableName?: string;
  totalItems?: number;
  showViewToggle?: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  viewMode,
  setViewMode,
  tableName = "ตาราง",
  totalItems = 0,
  showViewToggle = true,
}) => {
  const theme = useTheme();

  return (
    <ViewControls theme={theme}>
      <div className="left-controls">
        <Text h5 style={{ margin: 0 }}>
          {tableName}
        </Text>
        <Typography.Text type="secondary">{totalItems} รายการ</Typography.Text>
      </div>

      {showViewToggle && (
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
      )}
    </ViewControls>
  );
};

export default TableHeader;
