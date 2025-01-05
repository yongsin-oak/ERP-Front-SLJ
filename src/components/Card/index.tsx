import { Card as ACard } from "antd";

interface Props {
  title?: string | React.ReactNode;
}
const Card = ({ title }: Props) => {
  return <ACard title={title} ></ACard>;
};

export default Card;
