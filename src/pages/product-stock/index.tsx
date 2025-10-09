import { DeleteOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { Button, Col, Flex, message, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import { get, orderBy } from "lodash";
import { useEffect, useMemo, useState } from "react";

// Components
import { ExcelImport } from "@components/common";
import MButton from "@components/common/MButton";
import ProductFormComp from "./form/ProductForm";

// Hooks and Utils
import { Role } from "@features/employee/enums/Role.enum";
import { useAuth } from "@stores/index.ts";
import { isMobile } from "@utils/common/responsive.ts";
import { onUploadProducts } from "@hooks/product";
import { useProductStore } from "@stores/product/productStore.ts";

// Types and Styles
import { FormProductData, ProductData } from "@interfaces/product";
import { additionalColumns, essentialColumns } from "./table/productColumns";
import { productFieldMappings } from "./config/fieldMappings";

// Components for rendering
import { ColumnsType } from "antd/es/table/InternalTable";
import MTable from "@components/tableComps/MTable";

const COLUMNS_SHOW = ["barcode", "name", "brand", "category", "remaining"];

const ProductStock = () => {
  // Auth store
  const { user } = useAuth();
  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // State for Excel import modal
  const [excelImportModalOpen, setExcelImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Check if user is superadmin
  const isSuperAdmin = user?.role === Role.SuperAdmin;

  // Zustand store
  const {
    data,
    totalData,
    searchTerm,
    selectedItems,
    sortField,
    sortOrder,
    uploadModalOpen,
    editModalOpen,
    editingProduct,
    filters,
    // Actions
    loadProducts,
    setViewMode,
    openUploadModal,
    closeUploadModal,
    closeEditModal,
    updateSingleProduct,
    deleteProducts,
  } = useProductStore();

  // Form instances
  const [form] = useForm();
  const [editForm] = useForm<FormProductData>();

  // Hooks
  const { width } = useWindowSize();
  const mobile = isMobile(width);
  const theme = useTheme();

  // Load data on mount
  useEffect(() => {
    loadProducts({ page, limit: pageSize });
  }, [loadProducts, page, pageSize]);

  // Reset form when modal closes
  useEffect(() => {
    if (uploadModalOpen) {
      form.resetFields();
    }
  }, [uploadModalOpen, form]);

  // Populate edit form when editing product changes
  useEffect(() => {
    if (editingProduct && editModalOpen) {
      // ตรวจสอบและแปลงหน่วยน้ำหนักสินค้า
      const productWeight = editingProduct.productDimensions?.weight || 0;
      const productWeightUnit = productWeight > 1000 ? "kg" : "g";
      const productWeightValue =
        productWeight > 1000 ? productWeight / 1000 : productWeight;

      // ตรวจสอบและแปลงหน่วยน้ำหนักกล่อง
      const cartonWeight = editingProduct.cartonDimensions?.weight || 0;
      const cartonWeightUnit = cartonWeight > 1000 ? "kg" : "g";
      const cartonWeightValue =
        cartonWeight > 1000 ? cartonWeight / 1000 : cartonWeight;

      // ตรวจสอบและแปลงหน่วยสินค้าขั้นต่ำ
      const minStock = editingProduct.minStock || 0;
      const packPerCarton = editingProduct.packPerCarton || 1;
      const minStockUnit =
        packPerCarton && minStock > packPerCarton ? "carton" : "pack";
      const minStockValue =
        packPerCarton && minStock > packPerCarton
          ? minStock / packPerCarton
          : minStock;

      // ตรวจสอบและแปลงหน่วยสินค้าคงเหลือ
      const remaining = editingProduct.remaining || 0;
      const remainingUnit =
        packPerCarton && remaining > packPerCarton ? "carton" : "pack";
      const remainingValue =
        packPerCarton && remaining > packPerCarton
          ? remaining / packPerCarton
          : remaining;

      // Convert ProductData to FormProductData format
      const formData = {
        ...editingProduct,
        // อัปเดต dimensions ด้วยค่าที่แปลงแล้ว
        productDimensions: editingProduct.productDimensions
          ? {
              ...editingProduct.productDimensions,
              weight: productWeightValue,
            }
          : null,
        cartonDimensions: editingProduct.cartonDimensions
          ? {
              ...editingProduct.cartonDimensions,
              weight: cartonWeightValue,
            }
          : null,
        // อัปเดตค่าที่แปลงแล้ว
        minStock: minStockValue,
        remaining: remainingValue,
        unit: {
          cartonWeight: cartonWeightUnit,
          minStock: minStockUnit,
          productWeight: productWeightUnit,
          remaining: remainingUnit,
        },
      };
      editForm.setFieldsValue(formData);
    }
  }, [editingProduct, editModalOpen, editForm]);

  // Auto switch to card view on mobile
  useEffect(() => {
    if (mobile) {
      setViewMode("card");
    }
  }, [mobile, setViewMode]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.barcode.toLowerCase().includes(searchLower) ||
          item.brand?.name?.toLowerCase().includes(searchLower) ||
          item.category?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply advanced filters
    if (filters.stockLevel !== "all") {
      filtered = filtered.filter((item) => {
        switch (filters.stockLevel) {
          case "low":
            return item.minStock && item.remaining <= item.minStock;
          case "out":
            return item.remaining === 0;
          case "normal":
            return item.remaining > (item.minStock || 0);
          default:
            return true;
        }
      });
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(
        (item) => item.brand && filters.brands.includes(item.brand.id)
      );
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(
        (item) => item.category && filters.categories.includes(item.category.id)
      );
    }

    // Price range filter
    filtered = filtered.filter((item) => {
      const price = item.sellPrice?.pack || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Sort data
    return orderBy(
      filtered,
      [
        (item) => {
          switch (sortField) {
            case "brand":
              return get(item, "brand.name", "") || "";
            case "category":
              return get(item, "category.name", "") || "";
            case "remaining":
              return item.remaining || 0;
            default:
              return item[sortField] || "";
          }
        },
      ],
      [sortOrder]
    );
  }, [data, searchTerm, filters, sortField, sortOrder]);

  const handleEditSubmit = async (values: FormProductData) => {
    if (!editingProduct) return;

    try {
      await updateSingleProduct(editingProduct.barcode, values, {
        page,
        limit: 10,
      });
      message.success("แก้ไขสินค้าเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Update error:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขสินค้า");
    }
  };

  // Delete handlers
  const handleDeleteSelected = () => {
    if (!isSuperAdmin) {
      message.error("คุณไม่มีสิทธิ์ในการลบสินค้า");
      return;
    }

    if (selectedItems.length === 0) {
      message.warning("กรุณาเลือกสินค้าที่ต้องการลบ");
      return;
    }

    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!isSuperAdmin) {
      message.error("คุณไม่มีสิทธิ์ในการลบสินค้า");
      return;
    }

    try {
      await deleteProducts(selectedItems, { page, limit: pageSize });
      message.success(`ลบสินค้า ${selectedItems.length} รายการเรียบร้อยแล้ว`);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Delete error:", error);
      message.error("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  // Handle Excel import with new component
  const handleExcelImport = async (data: FormProductData[]) => {
    try {
      // Upload each item
      for (const item of data) {
        await onUploadProducts({
          data: item,
          final: () => {},
        });
      }

      // Refresh the data
      loadProducts({ page, limit: pageSize });

      // Close modal
      setExcelImportModalOpen(false);
    } catch (error) {
      console.error("Excel import error:", error);
      throw error; // Re-throw so ExcelImport component can handle it
    }
  };

  // Enhanced table columns with selection and actions
  const tableColumns: ColumnsType<ProductData> = [
    ...essentialColumns,
    ...additionalColumns,
  ];

  return (
    <Flex vertical gap={16}>
      {/* Header with Upload button */}
      <Flex justify="space-between" align="center">
        <Col>
          <MButton
            icon={<FileExcelOutlined />}
            onClick={() => setExcelImportModalOpen(true)}
            size="large"
          >
            นำเข้า Excel
          </MButton>
        </Col>
        <Col>
          <MButton onClick={openUploadModal}>Upload</MButton>
        </Col>
      </Flex>

      {/* Selected Items Actions Bar - Show above table/cards */}
      {selectedItems.length > 0 && (
        <Flex
          justify="space-between"
          align="center"
          style={{
            padding: "12px 16px",
            background: theme.backgroundElevated_,
            border: `1px solid ${theme.splitLine_}`,
            borderRadius: "8px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              color: theme.textTertiary_,
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            เลือกแล้ว {selectedItems.length} รายการ
          </div>
          {isSuperAdmin && (
            <MButton
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteSelected}
              size="small"
            >
              ลบรายการที่เลือก
            </MButton>
          )}
        </Flex>
      )}
      <MTable<ProductData>
        columns={tableColumns}
        dataSource={filteredAndSortedData}
        columnsShow={COLUMNS_SHOW}
        rowKey="barcode"
        searchable
        // selectable
        haveDrawer
        onSelectionChange={(selected) => {
          useProductStore
            .getState()
            .setSelectedItems(selected.map((item) => item.barcode));
        }}
        pagination={{
          total: totalData,
          onChange(page, pageSize) {
            loadProducts({ page, limit: pageSize });
            setPage(page);
            setPageSize(pageSize);
          },
        }}
      />
      {/* )} */}

      {/* Upload Modal */}
      <Modal
        title="Upload Products"
        open={uploadModalOpen}
        onCancel={closeUploadModal}
        footer={null}
        width={mobile ? "100%" : 800}
        centered
      >
        <ProductFormComp
          form={form}
          setData={() => {
            loadProducts({ page, limit: pageSize });
          }}
          setOpen={closeUploadModal}
        />
      </Modal>

      {/* Single Product Edit Modal */}
      <Modal
        title={`แก้ไขสินค้า: ${editingProduct?.name || ""}`}
        open={editModalOpen}
        onCancel={closeEditModal}
        footer={null}
        width={mobile ? "100%" : 800}
        centered
      >
        <ProductFormComp
          form={editForm}
          setData={() => {
            loadProducts({ page, limit: pageSize });
          }}
          setOpen={closeEditModal}
          onSubmit={handleEditSubmit}
          isEdit={true}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="ยืนยันการลบสินค้า"
        open={deleteModalOpen}
        onCancel={handleDeleteCancel}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={handleDeleteCancel}>ยกเลิก</Button>
            <Button type="primary" danger onClick={handleDeleteConfirm}>
              ยืนยันการลบ
            </Button>
          </div>
        }
      >
        <p>คุณแน่ใจหรือว่าต้องการลบสินค้า {selectedItems.length} รายการ?</p>
      </Modal>

      {/* Excel Import Modal */}
      <Modal
        title="นำเข้าสินค้าจาก Excel"
        open={excelImportModalOpen}
        onCancel={() => setExcelImportModalOpen(false)}
        footer={null}
        width={mobile ? "100%" : 1200}
        centered
        destroyOnClose
      >
        <ExcelImport<FormProductData>
          fieldMappings={productFieldMappings}
          onImport={handleExcelImport}
          templateName="product_template"
          title="นำเข้าข้อมูลสินค้า"
          description="อัปโหลดไฟล์ Excel เพื่อนำเข้าข้อมูลสินค้าหลายรายการพร้อมกัน"
        />
      </Modal>
    </Flex>
  );
};

export default ProductStock;
