import { Route, Routes } from "react-router-dom";
import Mainlayout from "../layouts/Mainlayout";
import PrivateRoute from "./PrivateRoute";
import Home from "../pages/_home";
import POS from "../pages/_sell/_pos";
import DirectSell from "../pages/_sell/_directSell";
import Deliver from "../pages/_sell/_delivery";
import ECommerce from "../pages/_sell/_ecommerce";
import ProductStock from "../pages/product-stock";
import User from "../pages/_user";
import Employee from "../pages/_employee";
import Example from "../pages/example";
import Login from "../pages/login";
import NotFoundPage from "../pages/_error/404";
import ErrorPage from "../pages/_error/500";
import HistoryOrder from "../pages/_sell/_ecommerce/history/HistoryOrder";

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
