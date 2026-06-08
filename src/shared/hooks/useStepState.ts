import { useCallback } from 'react';
import { useSessionStorage } from './useSessionStorage';

const STEP_PREFIX = 'step:';

/**
 * Persist multi-step form progress to sessionStorage.
 * User can close the tab mid-flow and return to the same step.
 * Clears automatically when the session ends (tab close).
 *
 * Usage:
 *   const step = useStepState('order-entry', 4);
 *   step.next();   step.back();   step.goTo(2);   step.reset();
 */
export function useStepState(key: string, totalSteps: number) {
  const [step, setStep, removeStep] = useSessionStorage<number>(`${STEP_PREFIX}${key}`, 0);

  const clamp = (n: number) => Math.min(Math.max(n, 0), totalSteps - 1);

  const goTo = useCallback(
    (n: number) => setStep(clamp(n)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setStep, totalSteps],
  );

  const next = useCallback(() => goTo(step + 1), [step, goTo]);
  const back = useCallback(() => goTo(step - 1), [step, goTo]);
  const reset = useCallback(() => { removeStep(); }, [removeStep]);

  return {
    step,
    goTo,
    next,
    back,
    reset,
    isFirst: step === 0,
    isLast: step === totalSteps - 1,
  } as const;
}
