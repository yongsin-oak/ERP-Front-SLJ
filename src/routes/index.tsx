import { Route, Routes } from "react-router-dom";
import Mainlayout from "../layout/Mainlayout";
import Home from "../pages/Home";
import POS from "../pages/Sell/POS";
import DirectSell from "../pages/Sell/DirectSell";
import Deliver from "../pages/Sell/Delivery";
import ECommerce from "../pages/Sell/ECommerce";
import User from "../pages/User";
import Employee from "../pages/Employee";
import Login from "../pages/Login";
import { useToken } from "../store/BearerToken";
import ProductStock from "../pages/product-stock";
import NotFoundPage from "../pages/Error/404";
import ErrorPage from "../pages/Error/500";
import PrivateRoute from "./PrivateRoute";

const Routers = () => {
  const { token } = useToken();
  const genR = (path: string, element: React.ReactElement) => {
    return {
      path,
      element,
    };
  };
  const routes = [
    genR("/", <Home />),
    genR("/sell-pos", <POS />),
    genR("/sell-online", <DirectSell />),
    genR("/sell-delivery", <Deliver />),
    genR("/sell-ecommerce", <ECommerce />),
    genR("/product-stock", <ProductStock />),
    genR("/user", <User />),
    genR("/employee", <Employee />),
  ];
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route element={token ? <Mainlayout /> : null}>
        {routes.map((route) => (
          <Route
            key={route.path}
            errorElement={<ErrorPage />}
            element={<PrivateRoute element={route.element} />}
            path={route.path}
          />
        ))}
      </Route>
    </Routes>
  );
};

export default Routers;
