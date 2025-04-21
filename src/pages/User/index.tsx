import { useEffect } from "react";
import { useAuth } from "../../store";
import req from "../../utils/req";

const User = () => {
  const { user } = useAuth();
  const getProfile = async () => {
    try {
      const res = await req.get("/profile");
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getProfile();
  }, []);
  console.log(user);
  return <div>{user}</div>;
};

export default User;
