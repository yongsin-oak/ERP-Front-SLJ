import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@layouts";
import { AppIcons } from "@/lib/icons";
import { PrivateRoute } from "./PrivateRoute";
import { RoleGuard } from "./RoleGuard";
import { RouteError } from "./RouteError";
import { LoginPage, useAuth } from "@features/auth";
import { getLandingPath } from "@config/access";

/** ตัวคั่นระหว่างโหลด chunk ของหน้า — กินแค่พื้นที่ content เพราะ layout ยังอยู่ */
function PageFallback() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="กำลังโหลด"
    >
      <AppIcons.loading spin className="size-5 text-primary" />
    </div>
  );
}

/**
 * ห่อทุกหน้าด้วย RoleGuard — สิทธิ์อ่านจาก `ROUTE_ROLES` ตาม path ปัจจุบัน
 * guard อยู่นอก Suspense เพื่อไม่ให้โหลด chunk ของหน้าที่ผู้ใช้เข้าไม่ได้
 */
function Page({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard>
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
    </RoleGuard>
  );
}

/** เข้า root แล้วเด้งไปหน้าเริ่มต้นของ role นั้น — terminal ไปหน้าบันทึกออเดอร์ */
function IndexRedirect() {
  const user = useAuth((s) => s.user);
  return <Navigate to={getLandingPath(user)} replace />;
}

const DashboardPage = lazy(() =>
  import("@features/dashboard").then((m) => ({ default: m.DashboardPage })),
);
const InventoryPage = lazy(() =>
  import("@features/inventory").then((m) => ({ default: m.InventoryPage })),
);
const EmployeePage = lazy(() =>
  import("@features/employee").then((m) => ({ default: m.EmployeePage })),
);
const OrderEntryPage = lazy(() =>
  import("@features/order").then((m) => ({ default: m.OrderEntryPage })),
);
const OrderHistoryPage = lazy(() =>
  import("@features/order").then((m) => ({ default: m.OrderHistoryPage })),
);
const BrandPage = lazy(() =>
  import("@features/brand").then((m) => ({ default: m.BrandPage })),
);
const CategoryPage = lazy(() =>
  import("@features/category").then((m) => ({ default: m.CategoryPage })),
);
const ShopPage = lazy(() =>
  import("@features/shop").then((m) => ({ default: m.ShopPage })),
);
const RolePage = lazy(() =>
  import("@features/role").then((m) => ({ default: m.RolePage })),
);
const UserPage = lazy(() =>
  import("@features/user").then((m) => ({ default: m.UserPage })),
);
const TerminalPage = lazy(() =>
  import("@features/terminal").then((m) => ({ default: m.TerminalPage })),
);
const SupplierPage = lazy(() =>
  import("@features/supplier").then((m) => ({ default: m.SupplierPage })),
);
const StockReceivePage = lazy(() =>
  import("@features/stock-entry").then((m) => ({
    default: m.StockReceivePage,
  })),
);
const StockDamagePage = lazy(() =>
  import("@features/stock-entry").then((m) => ({ default: m.StockDamagePage })),
);
const StockAdjustPage = lazy(() =>
  import("@features/stock-entry").then((m) => ({ default: m.StockAdjustPage })),
);
const StockHistoryPage = lazy(() =>
  import("@features/stock-entry").then((m) => ({
    default: m.StockHistoryPage,
  })),
);
const ReportPage = lazy(() =>
  import("@features/report").then((m) => ({ default: m.ReportPage })),
);
const StockCountListPage = lazy(() =>
  import("@features/stock-count").then((m) => ({
    default: m.StockCountListPage,
  })),
);
const StockCountDetailPage = lazy(() =>
  import("@features/stock-count").then((m) => ({
    default: m.StockCountDetailPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@features/auth/pages/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteError />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <IndexRedirect /> },
      {
        path: "dashboard",
        element: (
          <Page>
            <DashboardPage />
          </Page>
        ),
      },
      {
        path: "order",
        element: (
          <Page>
            <OrderEntryPage />
          </Page>
        ),
      },
      {
        path: "order/history",
        element: (
          <Page>
            <OrderHistoryPage />
          </Page>
        ),
      },
      {
        path: "inventory",
        element: (
          <Page>
            <InventoryPage />
          </Page>
        ),
      },
      {
        path: "brand",
        element: (
          <Page>
            <BrandPage />
          </Page>
        ),
      },
      {
        path: "category",
        element: (
          <Page>
            <CategoryPage />
          </Page>
        ),
      },
      {
        path: "shop",
        element: (
          <Page>
            <ShopPage />
          </Page>
        ),
      },
      {
        path: "employee",
        element: (
          <Page>
            <EmployeePage />
          </Page>
        ),
      },
      {
        path: "role",
        element: (
          <Page>
            <RolePage />
          </Page>
        ),
      },
      {
        path: "user",
        element: (
          <Page>
            <UserPage />
          </Page>
        ),
      },
      {
        path: "terminal",
        element: (
          <Page>
            <TerminalPage />
          </Page>
        ),
      },
      {
        path: "supplier",
        element: (
          <Page>
            <SupplierPage />
          </Page>
        ),
      },
      {
        path: "stock/receive",
        element: (
          <Page>
            <StockReceivePage />
          </Page>
        ),
      },
      {
        path: "stock/damage",
        element: (
          <Page>
            <StockDamagePage />
          </Page>
        ),
      },
      {
        path: "stock/adjust",
        element: (
          <Page>
            <StockAdjustPage />
          </Page>
        ),
      },
      {
        path: "stock/history",
        element: (
          <Page>
            <StockHistoryPage />
          </Page>
        ),
      },
      {
        path: "stock/count",
        element: (
          <Page>
            <StockCountListPage />
          </Page>
        ),
      },
      {
        path: "stock/count/:id",
        element: (
          <Page>
            <StockCountDetailPage />
          </Page>
        ),
      },
      {
        path: "report",
        element: (
          <Page>
            <ReportPage />
          </Page>
        ),
      },
      {
        path: "profile",
        element: (
          <Page>
            <ProfilePage />
          </Page>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
