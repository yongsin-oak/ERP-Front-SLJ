import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Text from "../Text";
import { Flex } from "antd";

interface Props {
  onBack?: () => void;
  text?: string;
  style?: React.CSSProperties;
}
const BackButton = ({ onBack, text, style }: Props) => {
  const navigate = useNavigate();
  return (
    <Flex gap={4} style={style}>
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
