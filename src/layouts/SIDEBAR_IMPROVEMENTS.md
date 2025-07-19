# Sidebar Layout Improvements

การปรับปรุง UI ของ sidebar ใน MainLayout เพื่อให้ดูสวยและใช้งานง่ายขึ้น

## การเปลี่ยนแปลงที่ทำ

### 1. **SidebarHeader**
- เพิ่ม header บนสุดของ sidebar (ความสูง 64px)
- มี gradient background ที่สวย
- แสดงไอคอน ShopOutlined + ชื่อ "ERP System"
- เมื่อ collapse แสดงแค่ไอคอน
- มี hover effect และ shadow

### 2. **Menu Styling**
- เพิ่ม border-radius ให้ menu items
- ปรับความสูงเป็น 44px
- เพิ่ม margin ระหว่าง items
- ปรับ hover และ selected states
- เพิ่มขนาดไอคอน
- ลบ border ด้านขวา

### 3. **LogoutButton Wrapper**
- วางไว้ด้านล่างสุด
- ลบ border-top ออก
- ปรับ padding ให้เหมาะสม
- ทำให้ button เต็มความกว้าง

### 4. **SidebarContent**
- ใช้ flexbox layout
- เพิ่ม custom scrollbar
- จัดการ overflow อย่างเหมาะสม

### 5. **Responsive Design**
- Desktop: แสดงไอคอน + ข้อความ
- Mobile drawer: แสดงเหมือน desktop แต่เล็กกว่า
- Collapsed: แสดงแค่ไอคอน

## Structure ใหม่

```tsx
<Sider>
  <SidebarHeader>
    {/* Brand + Icon */}
  </SidebarHeader>
  
  <SidebarContent>
    <MenuWrapper>
      <Menu />
    </MenuWrapper>
    
    <LogoutWrapper>
      <LogoutButton />
    </LogoutWrapper>
  </SidebarContent>
</Sider>
```

## การใช้งาน Style Constants

ใช้ constants จาก `theme/constants.ts`:
- `SPACING` สำหรับ padding/margin
- `BORDER_RADIUS` สำหรับมุมโค้ง
- `TRANSITION` สำหรับ animations

## ผลลัพธ์

1. **ดูสวยขึ้น** - มี header, spacing ที่เหมาะสม
2. **ใช้งานง่าย** - menu items มีขนาดที่เหมาะสม
3. **Responsive** - ทำงานดีทั้ง desktop และ mobile
4. **ความสอดคล้อง** - ใช้ theme colors และ constants

## การทดสอบ

1. ลองเปิด/ปิด sidebar (collapse/expand)
2. ทดสอบใน mobile view
3. ลองใช้ dark/light theme
4. ตรวจสอบ hover effects
