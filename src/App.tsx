import "./App.scss";
import "./App.scss";
import { ConfigProvider } from "antd";
import { ThemeProvider } from "@emotion/react";
import lightTheme from "./theme/lightMode.module.scss";
import darkTheme from "./theme/darkMode.module.scss";
import { BrowserRouter } from "react-router-dom";
import Routers from "./routes";
import { useAuth, useStoreTheme } from "./store";
import buddhistEra from "dayjs/plugin/buddhistEra";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import { CookiesProvider } from "react-cookie";
import { useEffect } from "react";

dayjs.extend(buddhistEra);
dayjs.extend(utc);
dayjs.extend(timezone);

function App() {
  const { themeMode } = useStoreTheme();
  const { getMe } = useAuth();
  const isDark = themeMode === "dark";
  const theme = isDark ? darkTheme : lightTheme;
  useEffect(() => {
    getMe();
  }, [getMe]);
  useEffect(() => {
    console.log('Backend API URL:', import.meta.env.VITE_BACKEND_API_URL);
  }, []);
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
          <CookiesProvider>
            <BrowserRouter>
              <Routers></Routers>
            </BrowserRouter>
          </CookiesProvider>
        </ThemeProvider>
      </ConfigProvider>
    </>
  );
}

export default App;
