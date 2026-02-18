import Text from "@components/common/Text";

const Home = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Text
        h1
        bold
        center
        responsive
        mobileSize="2xl"
        tabletSize="3xl"
        desktopSize="4xl"
      >
        ยินดีต้อนรับสู่ระบบ ERP
      </Text>

      <Text
        s1
        center
        responsive
        mobileSize="xs"
        desktopSize="sm"
        style={{ marginTop: "12px", opacity: 0.7 }}
      >
        จัดการข้อมูลธุรกิจอย่างมีประสิทธิภาพ
      </Text>
    </div>
  );
};

export default Home;
