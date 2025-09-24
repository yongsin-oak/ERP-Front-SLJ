import { MButton } from "@components/common";
import { FormInputs } from "@components/Form";
import { InputFields } from "@components/Form/FormInputs/interface";
import { Editable, MTable } from "@components/tableComps";
import { Platform } from "@enums/Platform.enum";
import { useShopStore } from "@features/shop";
import { Shop } from "@interfaces/shop";
import { Form, Modal } from "antd";
import { useEffect, useState } from "react";

const ShopPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { loadShops, items } = useShopStore();
  const addShopInputFields: InputFields[] = [
    {
      name: "name",
      label: "ชื่อร้านค้า",
      span: 12,
      inputProps: {
        placeholder: "ชื่อร้านค้า",
      },
    },
    {
      name: "platform",
      label: "แพลตฟอร์ม",
      span: 12,
      inputComponent: "select",
      inputProps: {
        options: [
          { label: "Shopee", value: Platform.Shopee },
          { label: "Lazada", value: Platform.Lazada },
          { label: "TikTok", value: Platform.TikTok },
        ],
        placeholder: "แพลตฟอร์ม",
      },
    },
  ];

  useEffect(() => {
    loadShops({ page: 1, limit: 10, platform: undefined });
  }, [loadShops]);

  return (
    <>
      <MButton onClick={() => setModalOpen(true)}>เพิ่มร้านค้า</MButton>

      <Form>
        <Modal open={modalOpen} onCancel={() => setModalOpen(false)}>
          <FormInputs inputFields={addShopInputFields} />
        </Modal>
      </Form>

      <Editable<Shop>
        columns={[
          {
            title: "ชื่อร้านค้า",
            dataIndex: "name",
            key: "name",
            editable: true,
          },
          {
            title: "แพลตฟอร์ม",
            dataIndex: "platform",
            key: "platform",
          },
        ]}
        dataSource={items}
        onSaveCol={() => {}}
        rowKey="id"
      ></Editable>
    </>
  );
};

export default ShopPage;
