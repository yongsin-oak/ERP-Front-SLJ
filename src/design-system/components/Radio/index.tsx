import { Radio as AntRadio } from 'antd';
import type { RadioProps, RadioGroupProps } from 'antd';

export type { RadioProps, RadioGroupProps };

export const Radio = Object.assign(AntRadio, {
  Group: AntRadio.Group,
  Button: AntRadio.Button,
});
