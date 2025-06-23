import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Text from "../Text";
import { Flex } from "antd";
import { useTheme } from "@emotion/react";

interface Props {
  onBack?: () => void;
  text?: string;
  style?: React.CSSProperties;
  sticky?: boolean;
}
const BackButton = ({ onBack, text, style, sticky }: Props) => {
  const navigate = useNavigate();
  const theme = useTheme();
  return (
    <Flex
      gap={4}
      style={{
        position: sticky ? "sticky" : "static",
        backgroundColor: theme.background_,
        padding: 16,
        top: 0,
        zIndex: 1,
        ...style,
      }}
    >
      <ArrowLeftOutlined
        style={{ fontSize: 24 }}
        onClick={onBack || (() => navigate(-1))}
      />
      <Text h4 semiBold>
        {text}
      </Text>
    </Flex>
  );
};

export default BackButton;
