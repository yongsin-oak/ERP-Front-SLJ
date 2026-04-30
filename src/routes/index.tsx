import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@layouts';
import { Spinner } from '@design-system';
import { PrivateRoute } from './PrivateRoute';
import { LoginPage } from '@features/auth';

function Page({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner fullPage />}>{children}</Suspense>;
}

const DashboardPage = lazy(() =>
  import('@features/dashboard').then((m) => ({ default: m.DashboardPage })),
);
const InventoryPage = lazy(() =>
  import('@features/inventory').then((m) => ({ default: m.InventoryPage })),
);
const EmployeePage = lazy(() =>
  import('@features/employee').then((m) => ({ default: m.EmployeePage })),
);
const OrderPage = lazy(() =>
  import('@features/order').then((m) => ({ default: m.OrderPage })),
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Page><DashboardPage /></Page> },
      { path: 'inventory', element: <Page><InventoryPage /></Page> },
      { path: 'employee', element: <Page><EmployeePage /></Page> },
      { path: 'order', element: <Page><OrderPage /></Page> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
