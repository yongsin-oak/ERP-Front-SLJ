import { notification } from 'antd';
import { AppIcons } from '@design-system';

notification.config({ maxCount: 5, placement: 'topRight' });

const DURATION = { success: 4, warning: 6, error: 0 } as const;

let _seq = 0;

export const notify = {
  success(title: string, description?: string) {
    notification.success({ message: title, description, duration: DURATION.success });
  },

  warning(title: string, description?: string) {
    notification.warning({ message: title, description, duration: DURATION.warning });
  },

  error(title: string, description?: string) {
    notification.error({ message: title, description, duration: DURATION.error });
  },

  /** Returns a key — pass to `resolve()` or `dismiss()` when done */
  loading(title: string, description?: string): string {
    const key = `notify-${++_seq}`;
    notification.open({ key, message: title, description, duration: 0, icon: <AppIcons.loading spin /> });
    return key;
  },

  /** Replace a loading notification in-place with the final result */
  resolve(key: string, type: keyof typeof DURATION, title: string, description?: string) {
    notification[type]({ key, message: title, description, duration: DURATION[type] });
  },

  dismiss(key: string) {
    notification.destroy(key);
  },
};
