# Style Constants Usage Guide

โฟลเดอร์ `src/theme/constants.ts` มีค่าสไตล์ที่ใช้ซ้ำในโปรเจค เพื่อให้การออกแบบ UI มีความสอดคล้องกัน

## การใช้งาน

```tsx
import { BORDER_RADIUS, SPACING, BOX_SHADOW } from '@theme/constants';
// หรือ
import { BORDER_RADIUS, SPACING, BOX_SHADOW } from '@theme';
```

## ประเภทของ Constants

### 1. BORDER_RADIUS
ขนาดมุมโค้ง
```tsx
BORDER_RADIUS.xs     // '4px'
BORDER_RADIUS.sm     // '8px'
BORDER_RADIUS.md     // '12px'
BORDER_RADIUS.lg     // '16px'
BORDER_RADIUS.xl     // '20px'
BORDER_RADIUS['2xl'] // '24px'
BORDER_RADIUS['3xl'] // '32px'
BORDER_RADIUS.round  // '50%'
BORDER_RADIUS.pill   // '9999px'
```

### 2. SPACING
ระยะห่าง padding, margin
```tsx
SPACING.xs     // '4px'
SPACING.sm     // '8px'
SPACING.md     // '12px'
SPACING.lg     // '16px'
SPACING.xl     // '20px'
SPACING['2xl'] // '24px'
SPACING['3xl'] // '32px'
SPACING['4xl'] // '40px'
SPACING['5xl'] // '48px'
SPACING['6xl'] // '64px'
```

### 3. BOX_SHADOW
เงา
```tsx
BOX_SHADOW.none         // 'none'
BOX_SHADOW.sm           // เงาเล็ก
BOX_SHADOW.base         // เงามาตรฐาน
BOX_SHADOW.md           // เงาปานกลาง
BOX_SHADOW.lg           // เงาใหญ่
BOX_SHADOW.xl           // เงาใหญ่มาก
BOX_SHADOW['2xl']       // เงาใหญ่สุด
BOX_SHADOW.floating     // เงาสำหรับปุ่มลอย (light mode)
BOX_SHADOW.floatingDark // เงาสำหรับปุ่มลอย (dark mode)
```

### 4. Z_INDEX
ลำดับการซ้อนทับ
```tsx
Z_INDEX.dropdown       // 1000
Z_INDEX.sticky         // 1020
Z_INDEX.fixed          // 1030
Z_INDEX.modalBackdrop  // 1040
Z_INDEX.modal          // 1050
Z_INDEX.popover        // 1060
Z_INDEX.tooltip        // 1070
Z_INDEX.notification   // 1080
Z_INDEX.floating       // 1000
```

### 5. FONT_SIZE
ขนาดตัวอักษร
```tsx
FONT_SIZE.xs     // '12px'
FONT_SIZE.sm     // '14px'
FONT_SIZE.base   // '16px'
FONT_SIZE.lg     // '18px'
FONT_SIZE.xl     // '20px'
FONT_SIZE['2xl'] // '24px'
FONT_SIZE['3xl'] // '30px'
FONT_SIZE['4xl'] // '36px'
FONT_SIZE['5xl'] // '48px'
FONT_SIZE['6xl'] // '60px'
```

### 6. FONT_WEIGHT
ความหนาตัวอักษร
```tsx
FONT_WEIGHT.light     // 300
FONT_WEIGHT.normal    // 400
FONT_WEIGHT.medium    // 500
FONT_WEIGHT.semibold  // 600
FONT_WEIGHT.bold      // 700
FONT_WEIGHT.extrabold // 800
```

### 7. TRANSITION
การเคลื่อนไหว
```tsx
TRANSITION.fast      // '0.15s ease'
TRANSITION.base      // '0.3s ease'
TRANSITION.slow      // '0.5s ease'
TRANSITION.all       // 'all 0.3s ease'
TRANSITION.colors    // สำหรับสี
TRANSITION.transform // สำหรับการเปลี่ยนรูปร่าง
```

### 8. BREAKPOINTS
จุดหักมุมสำหรับ responsive
```tsx
BREAKPOINTS.xs     // '480px'
BREAKPOINTS.sm     // '576px'
BREAKPOINTS.md     // '768px'
BREAKPOINTS.lg     // '992px'
BREAKPOINTS.xl     // '1200px'
BREAKPOINTS['2xl'] // '1400px'
```

### 9. Style Mixins
รูปแบบที่ใช้บ่อย
```tsx
FLEX_CENTER      // จัดกึ่งกลางแนวนอนและแนวตั้ง
FLEX_BETWEEN     // จัดให้ห่างที่สุดระหว่างซ้าย-ขวา
ABSOLUTE_CENTER  // จัดกึ่งกลางด้วย absolute position
TRUNCATE_TEXT    // ตัดข้อความยาวด้วย ellipsis
```

## ตัวอย่างการใช้งาน

```tsx
import { BORDER_RADIUS, SPACING, BOX_SHADOW, FLEX_CENTER } from '@theme/constants';

const StyledCard = styled.div`
  ${FLEX_CENTER}
  padding: ${SPACING.lg};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${BOX_SHADOW.md};
`;

// หรือใน inline style
<div
  style={{
    padding: SPACING['2xl'],
    borderRadius: BORDER_RADIUS.lg,
    boxShadow: BOX_SHADOW.floating,
    ...FLEX_CENTER,
  }}
>
  Content
</div>
```

## ประโยชน์
1. **ความสอดคล้อง** - ใช้ค่าเดียวกันทั่วโปรเจค
2. **ง่ายต่อการแก้ไข** - แก้ที่เดียวใช้ได้ทั่วโปรเจค
3. **ลด Hardcode** - ไม่ต้องจำค่าต่างๆ
4. **TypeScript Support** - มี type safety และ autocomplete
