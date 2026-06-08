import { useState } from 'react';
import type { ReactNode } from 'react';
import styled from '@emotion/styled';
import { Flex, Steps } from 'antd';
import { Drawer } from '../Drawer';
import { Button } from '../Button';
import { colors, spacing } from '../../tokens';
import { Text } from '../Typography';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConfirmDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Step 1: form content */
  formContent: ReactNode;
  /** Step 2: summary to confirm before submitting */
  summary: ReactNode;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  width?: number;
  confirmLabel?: string;
  /** Shown when step is review — e.g. "ยืนยันการลบ 50 รายการ?" */
  confirmTitle?: string;
  /** If provided, back button on step 1 will not show; use this to handle back */
  onFormBack?: () => void;
}

// ── Styled ────────────────────────────────────────────────────────────────────

const Footer = styled(Flex)`
  padding: ${spacing[4]} ${spacing[6]};
  border-top: 1px solid ${colors.border.default};
  background: ${colors.bg.base};
  position: sticky;
  bottom: 0;
`;

const WarningBox = styled.div`
  background: ${colors.semantic.warningBg};
  border: 1px solid ${colors.semantic.warningBorder};
  border-radius: 6px;
  padding: ${spacing[3]} ${spacing[4]};
  margin-bottom: ${spacing[4]};
`;

// ── Component ─────────────────────────────────────────────────────────────────

const STEP_LABELS = ['กรอกข้อมูล', 'ยืนยัน'];

export function ConfirmDrawer({
  open,
  onClose,
  title,
  formContent,
  summary,
  onConfirm,
  loading = false,
  width = 520,
  confirmLabel = 'ยืนยัน',
  confirmTitle,
}: ConfirmDrawerProps) {
  const [step, setStep] = useState(0);

  function handleClose() {
    setStep(0);
    onClose();
  }

  async function handleConfirm() {
    await onConfirm();
    setStep(0);
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={title}
      width={width}
      footer={null}
    >
      <Flex vertical style={{ height: '100%' }}>
        {/* Step indicator */}
        <div style={{ padding: `${spacing[2]} 0 ${spacing[5]}` }}>
          <Steps
            current={step}
            size="small"
            items={STEP_LABELS.map(label => ({ title: label }))}
          />
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: spacing[16] }}>
          {step === 0 ? (
            formContent
          ) : (
            <div>
              {confirmTitle && (
                <WarningBox>
                  <Text size="sm" strong style={{ color: colors.semantic.warningText }}>
                    {confirmTitle}
                  </Text>
                </WarningBox>
              )}
              {summary}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <Footer justify="space-between" align="center">
          {step === 0 ? (
            <>
              <Button variant="ghost" onClick={handleClose} disabled={loading}>
                ยกเลิก
              </Button>
              <Button variant="primary" onClick={() => setStep(1)}>
                ถัดไป →
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(0)} disabled={loading}>
                ← ย้อนกลับ
              </Button>
              <Button variant="primary" onClick={handleConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </>
          )}
        </Footer>
      </Flex>
    </Drawer>
  );
}
