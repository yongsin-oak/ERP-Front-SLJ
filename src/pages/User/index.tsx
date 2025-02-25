import { useAuth } from "../../store";

const User = () => {
  const { user } = useAuth();
  return <div>{user}</div>;
};

export default User;
