# Text Component Usage Guide

Text component ที่ปรับปรุงแล้วสำหรับการใช้งานใน ERP-Front-SLJ โดยมีการรองรับ responsive อัตโนมัติ

## การใช้งาน

```tsx
import Text from '../../components/common/Text';
```

## Font Size Props

### Heading Sizes (Auto Responsive)
```tsx
<Text h1>หัวข้อใหญ่ที่สุด</Text>     // 48px -> 30px (tablet) -> 24px (mobile)
<Text h2>หัวข้อรอง</Text>           // 30px -> 24px (tablet) -> 20px (mobile)
<Text h3>หัวข้อย่อย</Text>          // 24px -> 20px (tablet) -> 18px (mobile)
<Text h4>หัวข้อเล็ก</Text>          // 20px -> 18px (tablet) -> 16px (mobile)
<Text h5>หัวข้อเล็กมาก</Text>       // 18px -> 16px (tablet) -> 14px (mobile)
<Text h6>หัวข้อเล็กสุด</Text>       // 16px -> 14px (mobile)
```

### Body Sizes
```tsx
<Text>ข้อความปกติ</Text>           // 16px (ไม่เปลี่ยน)
<Text s1>ข้อความเล็ก</Text>        // 14px (ไม่เปลี่ยน)
<Text s2>ข้อความเล็กมาก</Text>     // 12px (ไม่เปลี่ยน)
<Text s3>ข้อความเล็กสุด</Text>     // 10px (ไม่เปลี่ยน)
```

## Font Weight Props

```tsx
<Text medium>ข้อความหนาปานกลาง</Text>   // font-weight: 500
<Text semiBold>ข้อความหนาค่อนข้างหนา</Text> // font-weight: 600
<Text bold>ข้อความหนา</Text>             // font-weight: 700
```

## Alignment Props

```tsx
<Text center>ข้อความจัดกึ่งกลาง</Text>
```

## Custom Props

```tsx
<Text error>ข้อความแสดงข้อผิดพลาด</Text>  // สีแดง
<Text color="#ff0000">ข้อความสีแดง</Text>  // สีกำหนดเอง
```

## Advanced Responsive (Optional)

หากต้องการควบคุม responsive เอง:

```tsx
<Text 
  responsive
  desktopSize="2xl"    // 24px on desktop
  tabletSize="xl"      // 20px on tablet
  mobileSize="lg"      // 18px on mobile
>
  ข้อความ responsive แบบกำหนดเอง
</Text>
```

## Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 992px  
- **Desktop**: > 992px

## การทำงานของ Auto Responsive

### h1 (หัวข้อใหญ่)
- Desktop: 48px
- Tablet: 30px
- Mobile: 24px

### h2 (หัวข้อรอง)
- Desktop: 30px
- Tablet: 24px
- Mobile: 20px

### h3 (หัวข้อย่อย)
- Desktop: 24px
- Tablet: 20px
- Mobile: 18px

### h4 (หัวข้อเล็ก)
- Desktop: 20px
- Tablet: 18px
- Mobile: 16px

### h5 (หัวข้อเล็กมาก)
- Desktop: 18px
- Tablet: 16px
- Mobile: 14px

### h6 (หัวข้อเล็กสุด)
- Desktop: 16px
- Mobile: 14px

## ตัวอย่างการใช้งาน

```tsx
const MyComponent = () => {
  return (
    <div>
      <Text h1 center>ระบบ ERP</Text>
      <Text h2 semiBold>จัดการสินค้า</Text>
      <Text h3>รายการสินค้า</Text>
      
      <Text>รายละเอียดสินค้า: ข้อความยาวๆ ที่อธิบายรายละเอียดต่างๆ</Text>
      
      <Text s1>ข้อมูลเพิ่มเติม</Text>
      <Text s2>หมายเหตุ</Text>
      <Text s3>ลิขสิทธิ์</Text>
      
      <Text error>กรุณากรอกข้อมูลให้ครบถ้วน</Text>
    </div>
  );
};
```

## ประโยชน์ของ Auto Responsive

1. **ไม่ต้องใส่ props เพิ่มเติม** - ขนาดตัวอักษรปรับอัตโนมัติ
2. **ความสอดคล้อง** - ทุกหน้าใช้ขนาดเดียวกัน
3. **Mobile First** - ดูดีในทุกขนาดหน้าจอ
4. **ง่ายต่อการใช้งาน** - แค่ระบุ h1, h2, h3, etc.

## การทดสอบ

ไปที่ `/text-example` เพื่อดูตัวอย่างการทำงานและลองปรับขนาดหน้าจอ
