import { useWindowSize } from "@uidotdev/usehooks";
import { Col, Flex, Checkbox, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useMemo, useState } from "react";
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { orderBy, get } from "lodash";
import { useTheme } from "@emotion/react";
import * as XLSX from "xlsx";

// Components
import MButton from "../../components/common/MButton";
import MModal from "../../components/common/MModal";
import MUpload from "../../components/common/MUpload";
import ExcelImport from "../../components/common/ExcelImport";
import Table from "../../components/tableComps/Table";
import ProductFormComp from "./form/ProductForm";
import DesktopControls from "./components/DesktopControls";
import MobileControlsComponent from "./components/MobileControls";
import SearchAndActions from "./components/SearchAndActions";
import AdvancedFilter from "./components/AdvancedFilter";

// Hooks and Utils
import { isMobile } from "../../utils/responsive";
import { useProductStore } from "./store/productStore";
import { onUploadProducts } from "./hooks/product.hook";
import { useAuth } from "../../store";
import { Role } from "../../enum/Role.enum";

// Types and Styles
import { FormProductData, ProductData } from "./interface/interface";
import { essentialColumns } from "./table/productColumns";
import { createHighlightedColumns } from "./table/highlightedColumns";
import { ProductStockContainer } from "./styles";

// Components for rendering
import ProductCardList from "./components/ProductCardList.tsx";
import ProductDetailDrawer from "./components/ProductDetailDrawer.tsx";

type SortField = "barcode" | "name" | "remaining" | "brand" | "category";

const ProductStock = () => {
  // Auth store
  const { user } = useAuth();
  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // State for Excel import modal
  const [excelImportModalOpen, setExcelImportModalOpen] = useState(false);

  // Check if user is superadmin
  const isSuperAdmin = user?.role === Role.SuperAdmin;

  // Zustand store
  const {
    data,
    searchTerm,
    selectedItems,
    sortField,
    sortOrder,
    viewMode,
    uploadModalOpen,
    editModalOpen,
    editingProduct,
    filters,
    // Actions
    loadProducts,
    addSelectedItem,
    removeSelectedItem,
    clearSelectedItems,
    selectAllItems,
    setSortField,
    setSortOrder,
    setViewMode,
    openUploadModal,
    closeUploadModal,
    openEditModal,
    closeEditModal,
    openDetailDrawer,
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
    loadProducts();
  }, [loadProducts]);

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
      const formData: FormProductData = {
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
    } else if (!editModalOpen) {
      editForm.resetFields();
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

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FilterOutlined style={{ opacity: 0.3 }} />;
    return sortOrder === "asc" ? (
      <SortAscendingOutlined />
    ) : (
      <SortDescendingOutlined />
    );
  };

  const handleViewDetails = (product: ProductData) => {
    openDetailDrawer(product);
  };

  // Bulk actions
  const handleSelectItem = (barcode: string, checked: boolean) => {
    if (checked) {
      addSelectedItem(barcode);
    } else {
      removeSelectedItem(barcode);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAllItems(filteredAndSortedData);
    } else {
      clearSelectedItems();
    }
  };

  const handleEditSubmit = async (values: FormProductData) => {
    if (!editingProduct) return;

    try {
      await updateSingleProduct(editingProduct.barcode, values);
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
      await deleteProducts(selectedItems);
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

  // Excel import handlers
  const handleExcelImport = async (data: FormProductData[]) => {
    // Upload each item
    for (const item of data) {
      await onUploadProducts({
        data: item,
        final: () => {},
      });
    }
    
    await loadProducts(); // Refresh data
  };

  const autoDetectMapping = (excelColumns: string[]): Record<string, string> => {
    const autoMapping: Record<string, string> = {};

    // Auto-map common column names
    excelColumns.forEach((col) => {
      const lowerCol = col.toLowerCase();
      if (lowerCol.includes("barcode") || lowerCol.includes("รหัส")) {
        autoMapping[col] = "barcode";
      } else if (lowerCol.includes("name") || lowerCol.includes("ชื่อ")) {
        autoMapping[col] = "name";
      } else if (lowerCol.includes("brand") || lowerCol.includes("ยี่ห้อ")) {
        autoMapping[col] = "brand";
      } else if (lowerCol.includes("category") || lowerCol.includes("หมวดหมู่")) {
        autoMapping[col] = "category";
      } else if (lowerCol.includes("price") || lowerCol.includes("ราคา")) {
        autoMapping[col] = "sellPrice";
      } else if (lowerCol.includes("stock") || lowerCol.includes("คงเหลือ")) {
        autoMapping[col] = "remaining";
      }
    });

    return autoMapping;
  };

  const transformExcelData = (rawData: Record<string, unknown>[]): FormProductData[] => {
    // Since ExcelImport component handles column mapping internally,
    // this will receive the already mapped data
    return rawData.map(row => row as FormProductData);
  };

  // Enhanced table columns with selection and actions
  const tableColumns = [
    {
      title: (
        <Checkbox
          checked={
            selectedItems.length === filteredAndSortedData.length &&
            filteredAndSortedData.length > 0
          }
          indeterminate={
            selectedItems.length > 0 &&
            selectedItems.length < filteredAndSortedData.length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      key: "selection",
      width: 50,
      render: (_: unknown, record: unknown) => {
        const productRecord = record as ProductData;
        return (
          <Checkbox
            checked={selectedItems.includes(productRecord.barcode)}
            onChange={(e) =>
              handleSelectItem(productRecord.barcode, e.target.checked)
            }
          />
        );
      },
    },
    // Use highlighted columns when search term is present, cast to any to avoid type conflicts

    ...(searchTerm ? createHighlightedColumns(searchTerm) : essentialColumns),
    {
      title: "การดำเนินการ",
      key: "actions",
      width: 150,
      fixed: "right" as const,
      render: (_: unknown, record: unknown) => {
        const productRecord = record as ProductData;
        return (
          <div style={{ display: "flex", gap: 4 }}>
            <MButton
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(productRecord)}
              title="แก้ไข"
            />
            <MButton
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(productRecord)}
              title="ดูรายละเอียด"
            />
            {isSuperAdmin && (
              <MButton
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  // Create a temporary selection and delete
                  clearSelectedItems();
                  addSelectedItem(productRecord.barcode);
                  setTimeout(() => handleDeleteSelected(), 0);
                }}
                title="ลบสินค้า"
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <ProductStockContainer theme={theme}>
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
            <MButton type="primary" onClick={openUploadModal}>
              Upload
            </MButton>
          </Col>
        </Flex>

        {/* Search and Actions */}
        <SearchAndActions />

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

        {/* Desktop Controls */}
        {!mobile && <DesktopControls />}

        {/* Mobile Controls */}
        {mobile ||
          (viewMode === "card" && (
            <MobileControlsComponent
              handleSort={handleSort}
              getSortIcon={getSortIcon}
            />
          ))}

        {/* Content */}
        {viewMode === "card" || mobile ? (
          <ProductCardList
            onEditProduct={openEditModal}
            onDeleteProduct={(product) => {
              // Create a temporary selection and delete
              clearSelectedItems();
              addSelectedItem(product.barcode);
              setTimeout(() => handleDeleteSelected(), 0);
            }}
          />
        ) : (
          <Table
            columns={tableColumns as never}
            dataSource={filteredAndSortedData}
            scroll={{ x: 800 }}
            rowKey="barcode"
            limit={20}
          />
        )}

        {/* Product Detail Drawer */}
        <ProductDetailDrawer />

        {/* Advanced Filter Modal */}
        <AdvancedFilter />

        {/* Upload Modal */}
        <MModal
          title="Upload Products"
          open={uploadModalOpen}
          onCancel={closeUploadModal}
          footer={null}
          responsive
        >
          <ProductFormComp
            form={form}
            setData={loadProducts}
            setOpen={closeUploadModal}
          />
        </MModal>

        {/* Single Product Edit Modal */}
        <MModal
          title={`แก้ไขสินค้า: ${editingProduct?.name || ""}`}
          open={editModalOpen}
          onCancel={closeEditModal}
          footer={null}
          responsive
        >
          <ProductFormComp
            form={editForm}
            setData={loadProducts}
            setOpen={closeEditModal}
            onSubmit={handleEditSubmit}
            isEdit={true}
          />
        </MModal>

        {/* Delete Confirmation Modal */}
        <MModal
          title="ยืนยันการลบสินค้า"
          open={deleteModalOpen}
          onCancel={handleDeleteCancel}
          footer={
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <MButton onClick={handleDeleteCancel}>ยกเลิก</MButton>
              <MButton type="primary" danger onClick={handleDeleteConfirm}>
                ยืนยันการลบ
              </MButton>
            </div>
          }
        >
          <p>คุณแน่ใจหรือว่าต้องการลบสินค้า {selectedItems.length} รายการ?</p>
        </MModal>

        {/* Excel Import Modal */}
        <MModal
          title="นำเข้าสินค้าจาก Excel"
          open={excelImportModalOpen}
          onCancel={handleExcelImportCancel}
          footer={null}
          responsive
        >
          <div style={{ padding: 16 }}>
            <MUpload
              accept=".xls,.xlsx"
              beforeUpload={(file: File) => {
                handleExcelFileSelect(file);
                return false; // Prevent automatic upload
              }}
              showUploadList={false}
            >
              <MButton icon={<UploadOutlined />} size="large" fullWidth>
                เลือกไฟล์ Excel
              </MButton>
            </MUpload>

            {excelFile && (
              <div style={{ marginTop: 16 }}>
                <strong>ไฟล์ที่เลือก:</strong> {excelFile.name}
              </div>
            )}

            {excelData.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>ตัวอย่างข้อมูลในไฟล์:</strong>
                <Table
                  columns={Object.keys(excelData[0]).map((key) => ({
                    title: key,
                    dataIndex: key,
                    key,
                  }))}
                  dataSource={excelData}
                  responsive={false}
                  limit={5}
                  jumper={false}
                  rowKey={(_, index) => index || 0}
                />
              </div>
            )}

            {Object.keys(columnMapping).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <strong>การแมปคอลัมน์:</strong>
                <Table
                  columns={[
                    {
                      title: "คอลัมน์ในไฟล์ Excel",
                      dataIndex: "excelColumn",
                      key: "excelColumn",
                    },
                    {
                      title: "ฟิลด์ในระบบ",
                      dataIndex: "formField",
                      key: "formField",
                    },
                  ]}
                  dataSource={Object.entries(columnMapping).map(
                    ([excelCol, formField]) => ({
                      excelColumn: excelCol,
                      formField,
                    })
                  )}
                  responsive={false}
                  limit={10}
                  jumper={false}
                />
              </div>
            )}

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <MButton
                type="primary"
                onClick={handleExcelImportConfirm}
                size="large"
                fullWidth
              >
                นำเข้าข้อมูล
              </MButton>
              <MButton
                onClick={handleExcelImportCancel}
                size="large"
                fullWidth
                danger
              >
                ยกเลิก
              </MButton>
            </div>
          </div>
        </MModal>
      </Flex>
    </ProductStockContainer>
  );
};

export default ProductStock;
