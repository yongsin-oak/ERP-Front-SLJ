import React from "react";
import { Flex, Checkbox, Tooltip, Collapse, Space } from "antd";
import {
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import Text from "@components/common/Text";
import { highlightText } from "@utils/highlightText";
import {
  CardBody,
  CardListContainer,
  CardListHeader,
  EmptyState,
  InfoRow,
} from "./styles";
import { SPACING } from "@theme/constants";
import StatusBadge from "@components/common/StatusBadge";
import MButton from "@components/common/MButton";

export interface CardItem {
  id: string | number;
  title: string;
  subtitle?: string;
  status?: {
    value: number;
    minValue?: number;
    label: string;
  };
  mainFields: Array<{
    label: string;
    value: string | number | null;
    type?: "text" | "price" | "number";
  }>;
  additionalFields?: Array<{
    label: string;
    value: string | number | null;
    type?: "text" | "price" | "number";
  }>;
}

export interface CardListProps {
  data: CardItem[];
  selectedItems?: (string | number)[];
  searchTerm?: string;
  onSelectItem?: (id: string | number, checked: boolean) => void;
  onEditItem?: (item: CardItem) => void;
  onDeleteItem?: (item: CardItem) => void;
  emptyStateMessage?: string;
  additionalDetailsLabel?: string;
  renderStatusBadge?: (status: CardItem["status"]) => React.ReactNode;
  selectable?: boolean;
}

const CardList: React.FC<CardListProps> = ({
  data,
  selectedItems,
  searchTerm,
  onSelectItem,
  onEditItem,
  onDeleteItem,
  emptyStateMessage = "ไม่พบข้อมูล",
  additionalDetailsLabel = "ข้อมูลเพิ่มเติม",
  renderStatusBadge,
  selectable = false,
}) => {
  const theme = useTheme();

  const formatValue = (
    value: string | number | null,
    type: string = "text"
  ) => {
    if (!value) return "ไม่ระบุ";

    switch (type) {
      case "price":
        return `${Number(value).toLocaleString()} ฿`;
      case "number":
        return Number(value).toLocaleString();
      default:
        return String(value);
    }
  };

  const highlightValue = (value: string, searchTerm?: string) => {
    if (!searchTerm) return value;
    return highlightText(value, searchTerm);
  };

  if (!data || data.length === 0) {
    return (
      <EmptyState theme={theme}>
        <Text type="secondary">{emptyStateMessage}</Text>
      </EmptyState>
    );
  }

  return (
    <Flex vertical gap={16}>
      {data.map((item) => (
        <CardListContainer theme={theme} key={item.id}>
          <CardListHeader theme={theme}>
            <Flex align="center" gap={SPACING.md}>
              {selectable && (
                <Checkbox
                  checked={selectedItems?.includes(item.id)}
                  onChange={(e) => onSelectItem?.(item.id, e.target.checked)}
                />
              )}
              <div className="item-title">
                <Text h6 bold style={{ margin: 0, lineHeight: 1.3 }}>
                  {highlightValue(item.title, searchTerm)}
                </Text>
                {item.subtitle && (
                  <div className="item-subtitle">
                    {highlightValue(item.subtitle, searchTerm)}
                  </div>
                )}
              </div>
            </Flex>

            <Flex align="center" gap={SPACING.sm}>
              {onEditItem && (
                <Tooltip title="แก้ไข">
                  <MButton
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEditItem(item)}
                  />
                </Tooltip>
              )}
              {onDeleteItem && (
                <Tooltip title="ลบ">
                  <MButton
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => onDeleteItem(item)}
                  />
                </Tooltip>
              )}

              {item.status && (
                <div className="status-info">
                  {renderStatusBadge ? (
                    renderStatusBadge(item.status)
                  ) : (
                    <StatusBadge
                      value={item.status.value}
                      minValue={item.status.minValue}
                      label={item.status.label}
                    />
                  )}
                  {item.status.minValue &&
                    item.status.value <= item.status.minValue && (
                      <Tooltip
                        title={`เหลือน้อย (ขั้นต่ำ: ${item.status.minValue})`}
                      >
                        <InfoCircleOutlined
                          style={{ color: "#faad14", marginLeft: 4 }}
                        />
                      </Tooltip>
                    )}
                </div>
              )}
            </Flex>
          </CardListHeader>

          <CardBody theme={theme}>
            {item.mainFields.map((field, index) => (
              <InfoRow key={index} theme={theme}>
                <Text s1 color={theme.textSecondary_}>
                  {field.label}:
                </Text>
                <Text
                  s1
                  bold
                  className={`value ${
                    !field.value
                      ? "value--empty"
                      : field.type === "price"
                      ? "value--price"
                      : ""
                  }`}
                >
                  {field.value
                    ? highlightValue(
                        formatValue(field.value, field.type),
                        searchTerm
                      )
                    : "ไม่ระบุ"}
                </Text>
              </InfoRow>
            ))}

            {item.additionalFields && item.additionalFields.length > 0 && (
              <Collapse
                ghost
                size="small"
                items={[
                  {
                    key: "1",
                    label: (
                      <Text s2 color={theme.textSecondary_}>
                        {additionalDetailsLabel}
                      </Text>
                    ),
                    children: (
                      <Space
                        direction="vertical"
                        size={8}
                        style={{ width: "100%" }}
                      >
                        {item.additionalFields.map((field, index) => (
                          <InfoRow key={index} theme={theme}>
                            <Text s1 color={theme.textSecondary_}>
                              {field.label}:
                            </Text>
                            <Text
                              s1
                              bold
                              className={`value ${
                                !field.value
                                  ? "value--empty"
                                  : field.type === "price"
                                  ? "value--price"
                                  : ""
                              }`}
                            >
                              {field.value
                                ? formatValue(field.value, field.type)
                                : "ไม่ระบุ"}
                            </Text>
                          </InfoRow>
                        ))}
                      </Space>
                    ),
                  },
                ]}
              />
            )}
          </CardBody>
        </CardListContainer>
      ))}
    </Flex>
  );
};

export default CardList;
