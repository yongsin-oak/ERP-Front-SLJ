import { Checkbox as AntCheckbox } from 'antd';
import type { CheckboxProps, CheckboxGroupProps } from 'antd/es/checkbox';

export type { CheckboxProps, CheckboxGroupProps };

export const Checkbox = Object.assign(AntCheckbox, {
  Group: AntCheckbox.Group,
});
