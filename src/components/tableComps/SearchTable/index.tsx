import React from "react";
import { Input, Button, Tooltip } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Theme, useTheme } from "@emotion/react";
import { SPACING, BORDER_RADIUS } from "../../../theme/constants";
import { useProductStore } from "../store/productStore";

const SearchContainer = styled.div<{ theme: Theme }>`
  display: flex;
  align-items: center;
  gap: ${SPACING.md};
  margin-bottom: ${SPACING.md};
  padding: ${SPACING.md};
  background: ${(props) => props.theme.backgroundElevated_};
  border-radius: ${BORDER_RADIUS.lg};
  border: 1px solid ${(props) => props.theme.splitLine_};

  .search-input {
    flex: 1;
    max-width: 400px;
  }

  .bulk-actions {
    display: flex;
    align-items: center;
    gap: ${SPACING.sm};
    flex-shrink: 0;
    min-width: 0;
  }

  .selected-indicator {
    display: flex;
    align-items: center;
    gap: ${SPACING.xs};
    padding: ${SPACING.xs} ${SPACING.sm};
    background: #1890ff15;
    border: 1px solid #1890ff;
    border-radius: ${BORDER_RADIUS.sm};
    color: #1890ff;
    font-weight: 500;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: ${SPACING.sm};

    .search-input {
      max-width: none;
    }

    .bulk-actions {
      justify-content: space-between;
    }
  }
`;

const SearchTable: React.FC = () => {
  const theme = useTheme();
  const { searchTerm, setSearchTerm, openAdvancedFilterModal } =
    useProductStore();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <SearchContainer theme={theme}>
      <div className="search-input">
        <Input.Search
          placeholder="ค้นหาสินค้า (ชื่อ, บาร์โค้ด, ยี่ห้อ, หมวดหมู่...)"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          allowClear
          size="large"
          prefix={<SearchOutlined />}
        />
      </div>

      <div className="bulk-actions">
        <Tooltip title="กรองขั้นสูง">
          <Button
            icon={<FilterOutlined />}
            onClick={openAdvancedFilterModal}
            size="large"
          >
            กรอง
          </Button>
        </Tooltip>
      </div>
    </SearchContainer>
  );
};

export default SearchTable;
