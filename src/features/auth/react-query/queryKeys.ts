export const authKeys = {
  all: ['auth'] as const,
  /** รายชื่อ terminal สำหรับ dropdown หน้า login */
  terminals: () => [...authKeys.all, 'terminals'] as const,
};
