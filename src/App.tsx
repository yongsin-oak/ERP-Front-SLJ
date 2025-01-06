import "./App.scss";
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
            colorPrimary: theme.red100_,
            colorInfo: theme.red100_,
            colorSuccess: theme.green100_,
            colorWarning: theme.orange100_,
            colorError: theme.red300_,
            colorLink: theme.red200_,
            colorTextBase: isDark ? "#fff" : "#000",
            colorBgBase: isDark ? "#000" : "#fff",
          },
          components: {
            Menu: {
              darkItemBg: theme.background_,
              darkPopupBg: theme.background_,
              darkSubMenuItemBg: theme.background_,
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
