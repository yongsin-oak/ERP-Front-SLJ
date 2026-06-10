import type { CSSProperties, ReactNode } from "react";
import { Card, Statistic } from "antd";
import type { StatisticProps } from "antd";

export interface SummaryCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: ReactNode;
  color?: string;
  formatter?: StatisticProps["formatter"];
  style?: CSSProperties;
}

export function SummaryCard({
  title,
  value,
  suffix,
  prefix,
  color,
  formatter,
  style,
}: SummaryCardProps) {
  return (
    <Card size="small" style={style}>
      <Statistic
        title={title}
        value={value}
        suffix={suffix}
        prefix={prefix}
        formatter={formatter}
        styles={{ content: { fontSize: 20, color } }}
      />
    </Card>
  );
}
