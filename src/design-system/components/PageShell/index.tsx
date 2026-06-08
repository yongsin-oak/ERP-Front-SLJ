import type { ReactNode } from 'react';
import { Spinner } from '../Spinner';
import { Empty } from '../Empty';

export interface PageShellProps {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  isLoading,
  isError,
  isEmpty,
  errorMessage = 'Failed to load data. Please refresh the page.',
  emptyDescription,
  emptyAction,
  children,
}: PageShellProps) {
  if (isLoading) return <Spinner fullPage />;
  if (isError) return <Empty description={errorMessage} />;
  if (isEmpty) return <Empty description={emptyDescription}>{emptyAction}</Empty>;
  return <>{children}</>;
}
