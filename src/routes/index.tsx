import { Route, Routes } from "react-router-dom";
import Test from "../pages/Test";
import Mainlayout from "../layout/Mainlayout";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Mainlayout />}>
        <Route path="/" element={<Test />} />
      </Route>
    </Routes>
  );
};

export default Routers;
