import { Empty as AntEmpty } from 'antd';
import type { EmptyProps } from 'antd';

export function Empty({ description = 'ไม่มีข้อมูล', ...props }: EmptyProps) {
  return <AntEmpty description={description} {...props} />;
}
