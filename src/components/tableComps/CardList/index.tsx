import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import MButton from "@components/common/MButton";
import Text from "@components/common/Text";
import { useTheme } from "@emotion/react";
import { highlightText } from "@utils/highlightText";
import { Checkbox, Collapse, Flex, Space, Tooltip } from "antd";
import { findIndex, get } from "lodash";
import { CardListProps } from "./interface";
import {
  CardBody,
  CardListContainer,
  CardListHeader,
  EmptyState,
  InfoRow,
} from "./styles";

const CardList = <T extends object>({
  dataSource = [],
  columns = [],
  columnsShow = [],
  titleColumn,
  subtitleColumn,
  selectedItems = [],
  searchTerm = "",
  onSelectItem,
  onEditItem,
  onDeleteItem,
  additionalDetailsLabel = "ข้อมูลเพิ่มเติม",
  emptyStateMessage = "ไม่พบข้อมูล",
  rowKey,
}: CardListProps<T>) => {
  const theme = useTheme();
  const renderCard = (record: T) => {
    const id = get(record, rowKey);
    const mainFields = columnsShow.map((key) => ({
      label: columns.find((col) => col.key === key)?.title || key,
      value: columns.find((col) => col.key === key)?.render
        ? columns
            .find((col) => col.key === key)
            ?.render?.(get(record, key), record, findIndex(dataSource, record))
        : get(record, key),
    }));

    const allKeys = columns.map((col) => col.key).filter(Boolean);
    console.log(columns);
    console.log(allKeys);
    const additionalKeys = allKeys.filter(
      (key) =>
        !columnsShow.includes(key as string) &&
        key !== titleColumn &&
        key !== subtitleColumn
    );

    const additionalFields = additionalKeys.map((key) => ({
      label: columns.find((col) => col.key === key)?.title || key,
      value: columns.find((col) => col.key === key)?.render
        ? columns
            .find((col) => col.key === key)
            ?.render?.(
              get(record, key as string),
              record,
              findIndex(dataSource, record)
            )
        : get(record, key as string),
    }));
    console.log(record, additionalKeys);
    console.log(additionalFields);
    return (
      <CardListContainer key={id} theme={theme}>
        <CardListHeader theme={theme}>
          <Flex align="center" gap="12px">
            <Checkbox
              checked={selectedItems.includes(id)}
              onChange={(e) => onSelectItem?.(id, e.target.checked)}
            />
            <div className="item-title">
              <Text h6 bold>
                {highlightText(
                  String(get(record, titleColumn) ?? ""),
                  searchTerm
                )}
              </Text>
              {subtitleColumn && (
                <div className="barcode">
                  {highlightText(
                    String(get(record, subtitleColumn) ?? ""),
                    searchTerm
                  )}
                </div>
              )}
            </div>
          </Flex>

          <Flex align="center" gap="8px">
            {onEditItem && (
              <Tooltip title="แก้ไข">
                <MButton
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEditItem(record)}
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
                  onClick={() => onDeleteItem(record)}
                />
              </Tooltip>
            )}
            {/* {record.status && (
              <div className="status-info">
                <StatusBadge
                  value={record.status.value}
                  minValue={record.status.minValue}
                  label={record.status.label}
                />
                {record.status.minValue &&
                  record.status.value <= record.status.minValue && (
                    <Tooltip
                      title={`เหลือน้อย (ขั้นต่ำ: ${record.status.minValue})`}
                    >
                      <InfoCircleOutlined
                        style={{ color: "#faad14", marginLeft: 4 }}
                      />
                    </Tooltip>
                  )}
              </div>
            )} */}
          </Flex>
        </CardListHeader>

        <CardBody theme={theme}>
          {mainFields.map((field, i) => (
            <InfoRow key={i} theme={theme}>
              <Text s1 color={theme.textSecondary_}>
                {field.label as string}:
              </Text>
              <Text
                s1
                bold
                className={`value ${!field.value ? "value--empty" : ""}`}
              >
                {highlightText(String(field.value ?? "ไม่ระบุ"), searchTerm)}
              </Text>
            </InfoRow>
          ))}

          {additionalFields.length > 0 && (
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
                      {additionalFields.map((field, i) => (
                        <InfoRow key={i} theme={theme}>
                          <Text s1 color={theme.textSecondary_}>
                            {field.label as string}:
                          </Text>
                          <Text
                            s1
                            bold
                            className={`value ${!field.value ? "value--empty" : ""}`}
                          >
                            {String(field.value ?? "ไม่ระบุ")}
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
    );
  };

  if (!dataSource || dataSource.length === 0) {
    return (
      <EmptyState theme={theme}>
        <Text type="secondary">{emptyStateMessage}</Text>
      </EmptyState>
    );
  }

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={16}>
      {dataSource.map(renderCard)}
    </Space>
  );
};

export default CardList;
