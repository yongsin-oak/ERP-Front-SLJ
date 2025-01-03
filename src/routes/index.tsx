import { Route, Routes } from "react-router-dom";
import Mainlayout from "../layout/Mainlayout";
import Home from "../pages/Home";
import ProductStock from "../pages/ProductStock";

const Routers = () => {
  const routes = [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/product-stock",
      element: <ProductStock />,
    },
  ];
  return (
    <Routes>
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
