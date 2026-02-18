import { Route, Routes } from "react-router-dom";
import Mainlayout from "@layouts/Mainlayout";
import PrivateRoute from "./PrivateRoute";
import Home from "@features/dashboard/pages";
import POS from "@features/sell/pages/pos";
import DirectSell from "@features/sell/pages/directSell";
import Deliver from "@features/sell/pages/delivery";
import ECommerce from "@features/sell/pages/ecommerce";
import ProductStock from "@features/product/pages";
import User from "@features/user/pages";
import Employee from "@features/employee/pages";
import Example from "@pages/example";
import Login from "@features/auth/pages";
import NotFoundPage from "@pages/error/404";
import ErrorPage from "@pages/error/500";
import HistoryOrder from "@features/sell/pages/ecommerce/history/HistoryOrder";
import ShopPage from "@features/shop/pages";

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
    genR("/sell/ecommerce/history", <HistoryOrder />),
    genR("/product-stock", <ProductStock />),
    genR("/user", <User />),
    genR("/employee", <Employee />),
    genR("/example", <Example />),
    genR("/shop", <ShopPage />),
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
            element={route.element}
            path={route.path}
          />
        ))}
      </Route>
    </Routes>
  );
};

export default Routers;
