import { ThemeProvider } from "@emotion/react";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useEffect } from "react";
import { CookiesProvider } from "react-cookie";
import { BrowserRouter } from "react-router-dom";
import "./App.scss";
import FloatingThemeButton from "./components/common/FloatingThemeButton";
import Routers from "./routes";
import { useAuth, useStoreTheme } from "./store";
import { themes } from "./theme";

dayjs.extend(buddhistEra);
dayjs.extend(utc);
dayjs.extend(timezone);

function App() {
  const { themeMode } = useStoreTheme();
  const theme = themes[themeMode];
  const { getMe } = useAuth();
  useEffect(() => {
    getMe();
  }, [getMe]);
  useEffect(() => {
    console.log("Backend API URL:", import.meta.env.VITE_BACKEND_API_URL);
  }, []);
  return (
    <>
      <ConfigProvider theme={theme.antd}>
        <ThemeProvider theme={theme.emotion}>
          <CookiesProvider>
            <BrowserRouter>
              <Routers></Routers>
            </BrowserRouter>
          </CookiesProvider>

          {/* Floating Theme Button - Available on all pages */}
          <FloatingThemeButton />
        </ThemeProvider>
      </ConfigProvider>
    </>
  );
}

export default App;
