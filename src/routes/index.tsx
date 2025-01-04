import { Route, Routes } from "react-router-dom";
import Mainlayout from "../layout/Mainlayout";
import Home from "../pages/Home";
import ProductStock from "../pages/ProductStock";
import POS from "../pages/Sell/POS";
import DirectSell from "../pages/Sell/DirectSell";
import Deliver from "../pages/Sell/Delivery";
import ECommerce from "../pages/Sell/ECommerce";
import User from "../pages/User";
import Finance from "../pages/Finance";
import Employee from "../pages/Employee";

const Routers = () => {
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
    genR("user", <User />),
    genR("finance", <Finance />),
    genR("employee", <Employee />),
  ];
  return (
    <Routes>
      <Route element={<Mainlayout />}>
        {routes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
        <Route path="*" element={<div>Not Found</div>} />
      <Route element={<Mainlayout />}>
        {routes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
        <Route path="*" element={<div>Not Found</div>} />
      </Route>
    </Routes>
  );
};

export default Routers;
