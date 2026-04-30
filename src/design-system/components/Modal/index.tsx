import { Modal as AntModal } from 'antd';
import type { ModalProps as AntModalProps } from 'antd';

export interface ModalProps extends AntModalProps {}

export function Modal({ width = 560, ...props }: ModalProps) {
  return <AntModal width={width} destroyOnHidden {...props} />;
}
