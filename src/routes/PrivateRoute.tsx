import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoadingUser, isAuth } = useAuth();
  const location = useLocation();

  if (isLoadingUser) {
    return <div>Loading...</div>;
  }
  return isAuth ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
export default PrivateRoute;
