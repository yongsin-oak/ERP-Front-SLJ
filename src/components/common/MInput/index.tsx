import { Input, InputProps } from "antd";

export interface MInputProps extends InputProps {
  children?: React.ReactNode;
}
const MInput: React.FC<MInputProps> = ({ children, ...props }) => {
  return <Input {...props}>{children}</Input>;
};

export default MInput;
