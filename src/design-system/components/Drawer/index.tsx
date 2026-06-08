import { Drawer as AntDrawer } from 'antd';
import type { DrawerProps as AntDrawerProps } from 'antd';

export interface DrawerProps extends AntDrawerProps {}

export function Drawer({ width = 480, destroyOnClose = true, ...props }: DrawerProps) {
  return <AntDrawer width={width} destroyOnClose={destroyOnClose} {...props} />;
}
