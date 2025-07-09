# Text Component Usage Guide

Text component ที่ปรับปรุงแล้วใช้ FONT_SIZE constants และรองรับ responsive design

## การใช้งานพื้นฐาน

```tsx
import Text from './components/common/Text';

// ขนาดหัวข้อ
<Text h1>หัวข้อใหญ่</Text>
<Text h2>หัวข้อระดับ 2</Text>
<Text h3>หัวข้อระดับ 3</Text>
<Text h4>หัวข้อระดับ 4</Text>
<Text h5>หัวข้อระดับ 5</Text>
<Text h6>หัวข้อระดับ 6</Text>

// ขนาดเล็ก
<Text s1>ข้อความขนาดเล็ก 1</Text>
<Text s2>ข้อความขนาดเล็ก 2</Text>
<Text s3>ข้อความขนาดเล็ก 3</Text>

// น้ำหนักตัวอักษร
<Text medium>ข้อความหนาปานกลาง</Text>
<Text semiBold>ข้อความค่อนข้างหนา</Text>
<Text bold>ข้อความหนา</Text>

// จัดกึ่งกลาง
<Text center>ข้อความกึ่งกลาง</Text>

// สีแสดงข้อผิดพลาด
<Text error>ข้อความแสดงข้อผิดพลาด</Text>
```

## การใช้งาน Responsive

```tsx
// ขนาดเปลี่ยนตามหน้าจอ
<Text 
  responsive
  mobileSize="sm"     // 14px บนมือถือ (≤ 768px)
  tabletSize="base"   // 16px บนแท็บเล็ต (768px - 992px)
  desktopSize="lg"    // 18px บนเดสก์ท็อป (≥ 992px)
>
  ข้อความที่ปรับขนาดตามหน้าจอ
</Text>

// ตัวอย่างหัวข้อที่ responsive
<Text 
  h1
  responsive
  mobileSize="2xl"    // 24px บนมือถือ
  tabletSize="3xl"    // 30px บนแท็บเล็ต  
  desktopSize="5xl"   // 48px บนเดสก์ท็อป
>
  หัวข้อที่ปรับขนาดได้
</Text>

// รวมหลาย props
<Text 
  h2
  bold
  center
  responsive
  mobileSize="xl"
  desktopSize="3xl"
  color="#007bff"
>
  หัวข้อครบครัน
</Text>
```

## ขนาดตัวอักษรที่ใช้ได้

- `xs` = 12px
- `sm` = 14px  
- `base` = 16px (default)
- `lg` = 18px
- `xl` = 20px
- `2xl` = 24px
- `3xl` = 30px
- `4xl` = 36px
- `5xl` = 48px
- `6xl` = 60px

## น้ำหนักตัวอักษร

- `medium` = 500
- `semiBold` = 600
- `bold` = 700

## Breakpoints

- Mobile: ≤ 768px
- Tablet: 768px - 992px  
- Desktop: ≥ 992px

## ตัวอย่างการใช้งานจริง

```tsx
// Header responsive
<Text 
  h1 
  bold 
  responsive
  mobileSize="2xl"
  desktopSize="4xl"
>
  ระบบ ERP
</Text>

// Subtitle
<Text 
  s1 
  responsive
  mobileSize="xs"
  desktopSize="sm"
  color="#666"
>
  จัดการข้อมูลอย่างมีประสิทธิภาพ
</Text>

// Error message
<Text error s2>
  กรุณากรอกข้อมูลให้ถูกต้อง
</Text>

// Card title ที่ปรับขนาดได้
<Text 
  h3 
  semiBold 
  responsive
  mobileSize="lg"
  desktopSize="xl"
>
  รายการสินค้า
</Text>
```
