import { Route, Routes } from "react-router-dom";
import Mainlayout from "@layouts/Mainlayout";
import PrivateRoute from "./PrivateRoute";
import Login from "@features/auth/pages";
import NotFoundPage from "@pages/error/404";
import ErrorPage from "@pages/error/500";
import EcommercePage from "@features/sell/pages";
import HomePage from "@features/home/pages";
import EmployeePage from "@features/employee/pages";

const Routers = () => {
  const genR = (path: string, element: React.ReactElement) => {
    return {
      path,
      element,
    };
  };
  const routes = [
    genR("/", <HomePage />),
    // genR("/sell/pos", <POS />),
    // genR("/sell/online", <DirectSell />),
    // genR("/sell/delivery", <Deliver />),
    genR("/sell/ecommerce", <EcommercePage />),
    // genR("/sell/ecommerce/history", <HistoryOrder />),
    // genR("/product-stock", <ProductStock />),
    // genR("/user", <User />),
    genR("/employee", <EmployeePage />),
    // genR("/shop", <ShopPage />),
  ];

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Routers;
