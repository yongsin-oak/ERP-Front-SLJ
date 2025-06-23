import { Route, Routes } from "react-router-dom";
import Mainlayout from "../layout/Mainlayout";
import Home from "../pages/home";
import User from "../pages/user";
import Employee from "../pages/employee";
import Login from "../pages/login";
import ProductStock from "../pages/product-stock";
import NotFoundPage from "../pages/error/404";
import ErrorPage from "../pages/error/500";
import PrivateRoute from "./PrivateRoute";
import ECommerce from "../pages/sell/ecommerce";
import Deliver from "../pages/sell/Delivery";
import DirectSell from "../pages/sell/DirectSell";
import POS from "../pages/sell/POS";
import Example from "../pages/example";

const Routers = () => {
  const genR = (path: string, element: React.ReactElement) => {
    return {
      path,
      element,
    };
  };
  const routes = [
    genR("/", <Home />),
    genR("/sell/pos", <POS />),
    genR("/sell/online", <DirectSell />),
    genR("/sell/delivery", <Deliver />),
    genR("/sell/ecommerce", <ECommerce />),
    genR("/product-stock", <ProductStock />),
    genR("/user", <User />),
    genR("/employee", <Employee />),
    genR("/example", <Example />),
  ];

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route
        element={
          <PrivateRoute>
            <Mainlayout />
          </PrivateRoute>
        }
      >
        {routes.map((route) => (
          <Route
            key={route.path}
            errorElement={<ErrorPage />}
            element={<PrivateRoute>{route.element}</PrivateRoute>}
            path={route.path}
          />
        ))}
      </Route>
    </Routes>
  );
};

export default Routers;
