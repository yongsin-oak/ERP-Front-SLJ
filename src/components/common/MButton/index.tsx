import { Button, ButtonProps } from "antd";

export interface MButtonProps extends ButtonProps {
  children?: React.ReactNode;
  fullWidth?: boolean;
}
const MButton = ({
  children,
  fullWidth,
  type = "primary",
  ...props
}: MButtonProps) => {
  return (
    <Button
      style={{
        width: fullWidth ? "100%" : "fit-content",
        ...props.style,
      }}
      type={type}
      {...props}
    >
      {children}
    </Button>
  );
};

export default MButton;
