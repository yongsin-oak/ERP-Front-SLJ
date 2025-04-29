import { Navigate } from "react-router-dom";
import { useToken } from "../store/BearerToken";

const PrivateRoute = ({ element }: { element: React.ReactElement }) => {
  const { token } = useToken();
  return token ? element : <Navigate to="/login" replace />;
};
export default PrivateRoute;
