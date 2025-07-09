import { Flex } from "antd";
import Text from "../../components/common/Text";
import { SPACING } from "../../theme/constants";

const TextExample = () => {
  return (
    <div style={{ padding: SPACING["2xl"] }}>
      <Flex vertical gap={SPACING.lg}>
        <Text h1>หัวข้อใหญ่ H1 - ลองปรับขนาดหน้าจอดู</Text>
        <Text h2>หัวข้อ H2 - จะเล็กลงอัตโนมัติ</Text>
        <Text h3>หัวข้อ H3 - ตามขนาดหน้าจอ</Text>
        <Text h4>หัวข้อ H4 - Responsive</Text>
        <Text h5>หัวข้อ H5 - ไม่ต้อง props</Text>
        <Text h6>หัวข้อ H6 - ปรับเอง</Text>
        <Text>
          ข้อความปกติ - มีความยาวพอสมควร เพื่อดูการเปลี่ยนแปลงเมื่อหน้าจอเล็กลง
        </Text>
        <Text s1>ข้อความเล็ก S1</Text>
        <Text s2>ข้อความเล็กมาก S2</Text>
        <Text s3>ข้อความเล็กที่สุด S3</Text>

        <div style={{ marginTop: SPACING.xl }}>
          <Text h3 bold>
            คำแนะนำ:
          </Text>
          <ul style={{ marginTop: SPACING.sm }}>
            <li>
              <Text>ลองเปลี่ยนขนาดหน้าจอ (resize browser window)</Text>
            </li>
            <li>
              <Text>ดูว่าตัวอักษรลดขนาดอัตโนมัติหรือไม่</Text>
            </li>
            <li>
              <Text>ทดสอบใน mobile, tablet, desktop</Text>
            </li>
          </ul>
        </div>
      </Flex>
    </div>
  );
};

export default TextExample;
