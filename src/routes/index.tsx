import { Route, Routes } from "react-router-dom";
import Mainlayout from "../layout/Mainlayout";
import Employee from "../pages/employee";
import NotFoundPage from "../pages/error/404";
import ErrorPage from "../pages/error/500";
import Example from "../pages/example";
import Home from "../pages/home";
import Login from "../pages/login";
import ProductStock from "../pages/product-stock";
import Deliver from "../pages/sell/Delivery";
import DirectSell from "../pages/sell/DirectSell";
import ECommerce from "../pages/sell/ecommerce";
import POS from "../pages/sell/POS";
import User from "../pages/user";
import PrivateRoute from "./PrivateRoute";

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
