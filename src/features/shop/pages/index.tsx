import { MButton } from "@components/common";
import { FormInputs } from "@components/Form";
import { InputFields } from "@components/Form/FormInputs/interface";
import { MTable } from "@components/tableComps";
import { Platform } from "@features/shop/enums/Platform.enum";
import { useShopStore } from "@features/shop";
import { Shop } from "@types";
import { Form, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import Paragraph from "antd/es/typography/Paragraph";
import { useEffect, useState } from "react";

interface ModalState {
  shopId?: string;
  open: boolean;
  state?: "add" | "edit";
}
interface FormFields {
  name: string;
  description?: string;
  platform: Platform;
}

const ShopPage = () => {
  const [modalState, setModalState] = useState<ModalState>({
    shopId: undefined,
    open: false,
    state: "add",
  });
  const {
    loadShops,
    items,
    loading,
    loadingUpdate: loadingSave,
    create,
    update,
    total,
    setPage,
    remove,
  } = useShopStore();
  const [form] = useForm<FormFields>();
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
        onSelect: (value: { label: string; value: Platform }) => {
          form.setFieldsValue({ platform: value.value });
        },
        placeholder: "แพลตฟอร์ม",
      },
    },
    {
      name: "description",
      label: "รายละเอียด",
      span: 24,
      required: false,
      customInput: <TextArea rows={4} placeholder="รายละเอียดร้านค้า" />,
    },
  ];

  const handleSubmit = (values: FormFields) => {
    console.log(values);
    switch (modalState.state) {
      case "add":
        create(values).then(() => {
          setModalState({ open: false, state: undefined });
          form.resetFields();
        });
        break;
      case "edit":
        {
          const currentShopId = modalState.shopId;
          if (!currentShopId) return;
          update(currentShopId, values).then(() => {
            setModalState({ open: false, state: undefined });
            form.resetFields();
          });
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    loadShops({ page: 1, limit: 10, platform: undefined });
  }, [loadShops]);

  return (
    <>
      <MButton
        onClick={() =>
          setModalState({
            open: true,
            state: "add",
          })
        }
      >
        เพิ่มร้านค้า
      </MButton>

      <Form form={form} onFinish={handleSubmit}>
        <Modal
          open={modalState.open}
          onCancel={() => {
            setModalState({ open: false, state: undefined });
            form.resetFields();
          }}
          title="เพิ่มร้านค้า"
          onOk={() => form.submit()}
          okButtonProps={{ loading: loadingSave }}
        >
          <FormInputs<FormFields>
            inputFields={addShopInputFields}
            formProps={form}
          />
        </Modal>
      </Form>

      <MTable<Shop>
        columns={[
          {
            title: "ชื่อร้านค้า",
            dataIndex: "name",
            key: "name",
            width: "30%",
            render: (text: string) =>
              text ? (
                <Paragraph
                  ellipsis={{
                    rows: 2, // จำนวนบรรทัดที่ให้แสดงก่อนตัด
                    expandable: true, // ให้กดดูเพิ่มเติม
                    symbol: "ดูเพิ่มเติม", // ข้อความที่ให้กด
                  }}
                >
                  {text}
                </Paragraph>
              ) : (
                "-"
              ),
          },
          {
            title: "แพลตฟอร์ม",
            dataIndex: "platform",
            key: "platform",
            width: "30%",
            render: (text: string) =>
              text ? (
                <Paragraph
                  ellipsis={{
                    rows: 2, // จำนวนบรรทัดที่ให้แสดงก่อนตัด
                    expandable: true, // ให้กดดูเพิ่มเติม
                    symbol: "ดูเพิ่มเติม", // ข้อความที่ให้กด
                  }}
                >
                  {text}
                </Paragraph>
              ) : (
                "-"
              ),
          },
          {
            title: "รายละเอียด",
            dataIndex: "description",
            key: "description",
            width: "40%",
            render: (text: string) =>
              text ? (
                <Paragraph
                  ellipsis={{
                    rows: 2, // จำนวนบรรทัดที่ให้แสดงก่อนตัด
                    expandable: true, // ให้กดดูเพิ่มเติม
                    symbol: "ดูเพิ่มเติม", // ข้อความที่ให้กด
                  }}
                >
                  {text}
                </Paragraph>
              ) : (
                "-"
              ),
          },
        ]}
        loading={loading}
        tableName="ร้านค้า"
        dataSource={items}
        actions={{
          onEdit: (record) => {
            form.setFieldsValue({
              name: record.name,
              platform: record.platform,
            });
            setModalState({
              open: true,
              state: "edit",
              shopId: record.id,
            });
          },
          onDelete: (record) => {
            remove(record.id);
          },
        }}
        size="small"
        rowKey="id"
        pagination={{
          total: total,
          onChange(page, pageSize) {
            loadShops({ page, limit: pageSize });
            setPage(page);
          },
        }}
      />
    </>
  );
};

export default ShopPage;
