import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { useTheme } from "@emotion/react";
import { useWindowSize } from "@uidotdev/usehooks";
import {
  Table as AntTable,
  Button,
  Col,
  Flex,
  message,
  Modal,
  Upload,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { get, orderBy } from "lodash";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

// Components
import MButton from "@components/common/MButton";
import MTable from "@components/tableComps/Table";
import AdvancedFilter from "./components/AdvancedFilter";
import SearchAndActions from "./components/SearchAndActions";
import ProductFormComp from "./form/ProductForm";

// Hooks and Utils
import { Role } from "@enums/Role.enum.ts";
import { useAuth } from "@stores/index.ts";
import { isMobile } from "@utils/responsive";
import { onUploadProducts } from "./hooks/product.hook";
import { useProductStore } from "./store/productStore";

// Types and Styles
import { FormProductData, ProductData } from "./interface/index.tsx";
import {createHighlightedColumns } from "./table/highlightedColumns";
import { additionalColumns, essentialColumns } from "./table/productColumns";

// Components for rendering
import { ColumnsType } from "antd/es/table/InternalTable";
import ProductDetailDrawer from "./components/ProductDetailDrawer.tsx";

type SortField = "barcode" | "name" | "remaining" | "brand" | "category";

const ProductStock = () => {
  // Auth store
  const { user } = useAuth();
  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // State for Excel import modal
  const [excelImportModalOpen, setExcelImportModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<Record<string, unknown>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );

  // Check if user is superadmin
  const isSuperAdmin = user?.role === Role.SuperAdmin;

  // Zustand store
  const {
    data,
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
    addSelectedItem,
    clearSelectedItems,
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

  const handleViewDetails = (product: ProductData) => {
    openDetailDrawer(product);
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
  const handleExcelFileSelect = (file: File) => {
    setExcelFile(file);

    // Read Excel file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setExcelData(jsonData as Record<string, unknown>[]);

        // Auto-detect column mapping
        if (jsonData.length > 0) {
          const excelColumns = Object.keys(
            jsonData[0] as Record<string, unknown>
          );
          const autoMapping: Record<string, string> = {};

          // Auto-map common column names
          excelColumns.forEach((col) => {
            const lowerCol = col.toLowerCase();
            if (lowerCol.includes("barcode") || lowerCol.includes("รหัส")) {
              autoMapping[col] = "barcode";
            } else if (lowerCol.includes("name") || lowerCol.includes("ชื่อ")) {
              autoMapping[col] = "name";
            } else if (
              lowerCol.includes("brand") ||
              lowerCol.includes("ยี่ห้อ")
            ) {
              autoMapping[col] = "brand";
            } else if (
              lowerCol.includes("category") ||
              lowerCol.includes("หมวดหมู่")
            ) {
              autoMapping[col] = "category";
            } else if (
              lowerCol.includes("price") ||
              lowerCol.includes("ราคา")
            ) {
              autoMapping[col] = "sellPrice";
            } else if (
              lowerCol.includes("stock") ||
              lowerCol.includes("คงเหลือ")
            ) {
              autoMapping[col] = "remaining";
            }
          });

          setColumnMapping(autoMapping);
        }
      } catch (error) {
        console.error("Error reading Excel file:", error);
        message.error("ไม่สามารถอ่านไฟล์ Excel ได้");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelImportConfirm = async () => {
    if (!excelData.length) {
      message.error("ไม่พบข้อมูลในไฟล์ Excel");
      return;
    }

    try {
      // Transform Excel data to FormProductData format
      const transformedData: FormProductData[] = excelData.map(
        (row: Record<string, unknown>) => {
          const formData: Partial<FormProductData> = {};

          Object.entries(columnMapping).forEach(([excelCol, formField]) => {
            if (row[excelCol] !== undefined && row[excelCol] !== null) {
              (formData as Record<string, unknown>)[formField] = row[excelCol];
            }
          });

          return formData as FormProductData;
        }
      );

      // Upload each item
      for (const item of transformedData) {
        await onUploadProducts({
          data: item,
          final: () => {},
        });
      }

      message.success(
        `นำเข้าข้อมูล ${transformedData.length} รายการเรียบร้อยแล้ว`
      );
      setExcelImportModalOpen(false);
      setExcelFile(null);
      setExcelData([]);
      setColumnMapping({});
    } catch (error) {
      console.error("Excel import error:", error);
      message.error("เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
    }
  };

  const handleExcelImportCancel = () => {
    setExcelImportModalOpen(false);
    setExcelFile(null);
    setExcelData([]);
    setColumnMapping({});
  };

  // Enhanced table columns with selection and actions
  const tableColumns: ColumnsType<ProductData> = [
    ...(searchTerm ? createHighlightedColumns(searchTerm) : essentialColumns),
    ...additionalColumns,
    {
      title: "",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: unknown, record: ProductData) => {
        const productRecord = record;
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
      {/* {!mobile && <DesktopControls />} */}

      {/* Mobile Controls */}
      {/* {mobile ||
        (viewMode === "card" && (
          <MobileControlsComponent
            handleSort={handleSort}
            getSortIcon={getSortIcon}
          />
        ))} */}

      {/* Content */}
      {/* {viewMode === "card" || mobile ? (
        <ProductCardList
          onEditProduct={openEditModal}
          onDeleteProduct={(product) => {
            // Create a temporary selection and delete
            clearSelectedItems();
            addSelectedItem(product.barcode);
            setTimeout(() => handleDeleteSelected(), 0);
          }}
        />
      ) : ( */}
      <MTable<ProductData>
        // ===== ใช้งานง่าย =====
        columns={tableColumns}
        titleColumn="name"
        columnsAdditional={["brand", "category", "remaining"]}
        columnsShow={["brand", "category", "remaining"]}
        dataSource={filteredAndSortedData}
        rowKey="barcode"
        selectable={true}
        onSelectionChange={(selectedRows) => {
          clearSelectedItems();
          selectedRows.forEach((row) => addSelectedItem(row.barcode));
        }}
        scroll={{ x: 800 }}
      />
      {/* )} */}

      {/* Product Detail Drawer */}
      <ProductDetailDrawer />

      {/* Advanced Filter Modal */}
      <AdvancedFilter />

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
          setData={loadProducts}
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
          setData={loadProducts}
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
        onCancel={handleExcelImportCancel}
        footer={null}
        width={mobile ? "100%" : 800}
        centered
      >
        <div style={{ padding: 16 }}>
          <Upload
            accept=".xls,.xlsx"
            beforeUpload={(file) => {
              handleExcelFileSelect(file);
              return false; // Prevent automatic upload
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} size="large" block>
              เลือกไฟล์ Excel
            </Button>
          </Upload>

          {excelFile && (
            <div style={{ marginTop: 16 }}>
              <strong>ไฟล์ที่เลือก:</strong> {excelFile.name}
            </div>
          )}

          {excelData.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>ตัวอย่างข้อมูลในไฟล์:</strong>
              <AntTable
                columns={Object.keys(excelData[0]).map((key) => ({
                  title: key,
                  dataIndex: key,
                  key,
                }))}
                dataSource={excelData}
                pagination={false}
                rowKey={(_, index) => index || 0}
                style={{ marginTop: 8 }}
              />
            </div>
          )}

          {Object.keys(columnMapping).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>การแมปคอลัมน์:</strong>
              <AntTable
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
                pagination={false}
                style={{ marginTop: 8 }}
              />
            </div>
          )}

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <Button
              type="primary"
              onClick={handleExcelImportConfirm}
              size="large"
              block
            >
              นำเข้าข้อมูล
            </Button>
            <Button onClick={handleExcelImportCancel} size="large" block danger>
              ยกเลิก
            </Button>
          </div>
        </div>
      </Modal>
    </Flex>
  );
};

export default ProductStock;
