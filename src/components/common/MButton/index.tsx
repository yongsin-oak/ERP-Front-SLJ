import { Button, ButtonProps } from "antd";

export interface MButtonProps extends ButtonProps {
  children?: React.ReactNode;
}
const MButton = ({ children, type = "primary", ...props }: MButtonProps) => {
  return (
    <Button type={type} {...props}>
      {children}
    </Button>
  );
};

export default MButton;
