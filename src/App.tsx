import "./App.scss";
import { ConfigProvider } from "antd";
import { ThemeProvider } from "@emotion/react";
import lightTheme from "./theme/lightMode.module.scss";
import darkTheme from "./theme/darkMode.module.scss";
import { BrowserRouter } from "react-router-dom";
import Routers from "./routes";
import { useStoreTheme } from "./store";

function App() {
  const { themeMode } = useStoreTheme();
  const isDark = themeMode === "dark";
  const theme = isDark ? darkTheme : lightTheme;
  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#e0282e",
            colorInfo: "#e0282e",
            colorSuccess: "#52c41a",
            colorWarning: "#faad14",
            colorError: "#ff4d4f",
            colorLink: "#c1252a",
            colorTextBase: isDark ? "#fff" : "#000",
            colorBgBase: isDark ? "#000" : "#fff",
          },
          components: {
            Menu: {
              darkItemBg: theme.background_,
              darkPopupBg: theme.background_,
            },
            Layout: {
              siderBg: theme.background_,
              triggerBg: theme.background_,
            },
          },
        }}
      >
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Routers></Routers>
          </BrowserRouter>
        </ThemeProvider>
      </ConfigProvider>
    </>
  );
}

export default App;
