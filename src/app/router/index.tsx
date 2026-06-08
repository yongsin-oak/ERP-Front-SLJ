import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@layouts";
import { Spinner } from "@design-system";
import { PrivateRoute } from "./PrivateRoute";
import { RoleGuard } from "./RoleGuard";
import { RouteError } from "./RouteError";
import { LoginPage } from "@features/auth";
import type { Role } from "@features/auth/types";

function Page({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner fullPage />}>{children}</Suspense>;
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
  import("@features/stock-entry").then((m) => ({ default: m.StockReceivePage })),
);
const StockDamagePage = lazy(() =>
  import("@features/stock-entry").then((m) => ({ default: m.StockDamagePage })),
);
const StockAdjustPage = lazy(() =>
  import("@features/stock-entry").then((m) => ({ default: m.StockAdjustPage })),
);
const StockHistoryPage = lazy(() =>
  import("@features/stock-entry").then((m) => ({ default: m.StockHistoryPage })),
);

function Guarded({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: Role[];
}) {
  return <RoleGuard roles={roles}>{children}</RoleGuard>;
}

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
      { index: true, element: <Navigate to="/dashboard" replace /> },
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
            <Guarded roles={["SuperAdmin"]}>
              <BrandPage />
            </Guarded>
          </Page>
        ),
      },
      {
        path: "category",
        element: (
          <Page>
            <Guarded roles={["SuperAdmin"]}>
              <CategoryPage />
            </Guarded>
          </Page>
        ),
      },
      {
        path: "shop",
        element: (
          <Page>
            <Guarded roles={["SuperAdmin"]}>
              <ShopPage />
            </Guarded>
          </Page>
        ),
      },
      {
        path: "employee",
        element: (
          <Page>
            <Guarded roles={["SuperAdmin"]}>
              <EmployeePage />
            </Guarded>
          </Page>
        ),
      },
      {
        path: "role",
        element: (
          <Page>
            <Guarded roles={["SuperAdmin"]}>
              <RolePage />
            </Guarded>
          </Page>
        ),
      },
      {
        path: "user",
        element: (
          <Page>
            <Guarded roles={["SuperAdmin"]}>
              <UserPage />
            </Guarded>
          </Page>
        ),
      },
      {
        path: "terminal",
        element: (
          <Page>
            <Guarded roles={["SuperAdmin"]}>
              <TerminalPage />
            </Guarded>
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
            <Guarded roles={["SuperAdmin"]}>
              <StockAdjustPage />
            </Guarded>
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
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
