import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../Button';
import { AppIcons } from '../../icons';
import { PageShell } from './index';

const PRODUCTS = [
  { sku: 'SLJ-0001', name: 'สบู่สมุนไพรขมิ้น', stock: 320 },
  { sku: 'SLJ-0002', name: 'แชมพูอัญชัน 250ml', stock: 145 },
  { sku: 'SLJ-0003', name: 'น้ำยาล้างจานมะนาว', stock: 12 },
];

const ProductRows = () => (
  <div className="divide-y divide-border rounded-lg border border-border">
    {PRODUCTS.map(p => (
      <div key={p.sku} className="flex items-center justify-between px-4 py-3 text-sm">
        <div>
          <div className="font-medium text-foreground">{p.name}</div>
          <div className="text-xs text-muted-foreground">{p.sku}</div>
        </div>
        <div className="text-muted-foreground">คงเหลือ {p.stock} ชิ้น</div>
      </div>
    ))}
  </div>
);

const meta = {
  title: 'Design System/PageShell',
  component: PageShell,
  tags: ['autodocs'],
  args: { children: <ProductRows /> },
} satisfies Meta<typeof PageShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContentState: Story = {};

/** สถานะโหลด — Spinner แบบ fullPage (สูงเต็มจอตามพฤติกรรมจริงของ component) */
export const Loading: Story = {
  args: { isLoading: true },
};

export const EmptyState: Story = {
  args: {
    isEmpty: true,
    emptyDescription: 'ยังไม่มีสินค้าในระบบ',
    emptyAction: (
      <Button variant="primary" icon={<AppIcons.add />}>เพิ่มสินค้าแรก</Button>
    ),
  },
};

export const ErrorState: Story = {
  args: {
    isError: true,
    errorMessage: 'โหลดข้อมูลสินค้าไม่สำเร็จ กรุณารีเฟรชหน้าใหม่อีกครั้ง',
    onRetry: () => {},
  },
};

type ShellState = 'loading' | 'error' | 'empty' | 'content';

const STATE_OPTIONS: { key: ShellState; label: string }[] = [
  { key: 'loading', label: 'กำลังโหลด' },
  { key: 'error', label: 'ผิดพลาด' },
  { key: 'empty', label: 'ไม่มีข้อมูล' },
  { key: 'content', label: 'มีข้อมูล' },
];

const RETRY_DELAY_MS = 1200;

const Demo = () => {
  const [state, setState] = useState<ShellState>('error');
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const retry = () => {
    setState('loading');
    timerRef.current = window.setTimeout(() => setState('content'), RETRY_DELAY_MS);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATE_OPTIONS.map(opt => (
          <Button
            key={opt.key}
            size="small"
            variant={state === opt.key ? 'primary' : 'secondary'}
            onClick={() => setState(opt.key)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-border p-4">
        <PageShell
          isLoading={state === 'loading'}
          isError={state === 'error'}
          isEmpty={state === 'empty'}
          errorMessage="โหลดข้อมูลสินค้าไม่สำเร็จ"
          onRetry={retry}
          emptyDescription="ยังไม่มีสินค้าในระบบ"
          emptyAction={<Button variant="primary" icon={<AppIcons.add />}>เพิ่มสินค้าแรก</Button>}
        >
          <ProductRows />
        </PageShell>
      </div>
    </div>
  );
};

export const InteractiveDemo: Story = {
  render: () => <Demo />,
};
