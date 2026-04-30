import { Form as AntForm } from 'antd';
import type { FormItemProps as AntFormItemProps } from 'antd';

export type FormItemProps = AntFormItemProps;

export const Form = Object.assign(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function FormWrapper({ layout = 'vertical', ...props }: any) {
    return <AntForm layout={layout} {...props} />;
  },
  {
    Item: AntForm.Item,
    useForm: AntForm.useForm,
    useWatch: AntForm.useWatch,
  }
);
