import "./App.css";
import { ConfigProvider } from "antd";
import { ThemeProvider } from "@emotion/react";
import lightTheme from "./theme/lightMode.module.scss";
import { BrowserRouter } from "react-router-dom";
import Routers from "./routes";

function App() {
  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#E0282E",
          },
        }}
      >
        <ThemeProvider theme={lightTheme}>
          <BrowserRouter>
            <Routers></Routers>
          </BrowserRouter>
        </ThemeProvider>
      </ConfigProvider>
    </>
  );
}

export default App;
