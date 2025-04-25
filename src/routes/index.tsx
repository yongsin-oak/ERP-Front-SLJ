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
import { isEmpty } from "lodash";
import { useToken } from "../store/BearerToken";
import ProductStock from "../pages/product-stock";

const Routers = () => {
  const { token } = useToken();
  const genR = (path: string, element: React.ReactNode) => {
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
      {isEmpty(token) ? (
        <Route path="/" element={<Login />} />
      ) : (
        <Route element={<Mainlayout />}>
          {routes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
          <Route path="*" element={<div>Not Found</div>} />
        </Route>
      )}
    </Routes>
  );
};

export default Routers;
