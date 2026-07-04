import * as React from 'react';
import { Tabs as UITabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tabBarExtraContent?: React.ReactNode;
}

export function Tabs({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  className,
  style,
  tabBarExtraContent,
}: TabsProps) {
  const hasContent = items.some((it) => it.children != null);
  const fallback = defaultActiveKey ?? items[0]?.key;

  return (
    <UITabs
      value={activeKey}
      defaultValue={activeKey === undefined ? fallback : undefined}
      onValueChange={onChange}
      className={cn(className)}
      style={style}
    >
      <div className={cn(tabBarExtraContent != null && 'flex items-center justify-between gap-4')}>
        <TabsList>
          {items.map((it) => (
            <TabsTrigger key={it.key} value={it.key} disabled={it.disabled}>
              {it.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabBarExtraContent}
      </div>
      {hasContent &&
        items.map((it) =>
          it.children != null ? (
            <TabsContent key={it.key} value={it.key}>
              {it.children}
            </TabsContent>
          ) : null,
        )}
    </UITabs>
  );
}
