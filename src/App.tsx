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
import { useAuth, useStoreTheme } from "./stores";
import { themes } from "./theme";
import { ThemeProvider } from "@emotion/react";
import "@ant-design/v5-patch-for-react-19";

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
