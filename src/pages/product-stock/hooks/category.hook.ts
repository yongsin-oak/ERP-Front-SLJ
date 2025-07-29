import { message } from "antd";
import req from "@utils/req";

export interface CategoryData {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
  children?: CategoryData[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

// Get all categories
export const onGetCategories = async ({
  setData,
  setLoading,
}: {
  setData: React.Dispatch<React.SetStateAction<CategoryData[] | undefined>>;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  try {
    setLoading?.(true);
    const response = await req.get("/api/v1/category");
    setData(response.data);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    message.error(
      error?.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่"
    );
  } finally {
    setLoading?.(false);
  }
};

// Get category tree structure
export const onGetCategoryTree = async ({
  setData,
  setLoading,
}: {
  setData: React.Dispatch<React.SetStateAction<CategoryData[] | undefined>>;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  try {
    setLoading?.(true);
    const response = await req.get("/api/v1/category/tree");
    setData(response.data);
  } catch (error: any) {
    console.error("Error fetching category tree:", error);
    message.error(
      error?.response?.data?.message ||
        "เกิดข้อผิดพลาดในการดึงข้อมูลโครงสร้างหมวดหมู่"
    );
  } finally {
    setLoading?.(false);
  }
};

// Get category by ID
export const onGetCategoryById = async (
  id: string
): Promise<CategoryData | null> => {
  try {
    const response = await req.get(`/api/v1/category/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching category:", error);
    message.error(
      error?.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่"
    );
    return null;
  }
};

// Create new category
export const onCreateCategory = async ({
  data,
  final,
}: {
  data: CreateCategoryData;
  final?: () => void;
}): Promise<CategoryData | null> => {
  try {
    const response = await req.post("/api/v1/category", data);
    message.success("เพิ่มหมวดหมู่สำเร็จ");
    final?.();
    return response.data;
  } catch (error: any) {
    console.error("Error creating category:", error);
    message.error(
      error?.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่"
    );
    return null;
  }
};

// Update category
export const onUpdateCategory = async ({
  id,
  data,
  final,
}: {
  id: string;
  data: UpdateCategoryData;
  final?: () => void;
}): Promise<CategoryData | null> => {
  try {
    const response = await req.patch(`/api/v1/category/${id}`, data);
    message.success("อัปเดตหมวดหมู่สำเร็จ");
    final?.();
    return response.data;
  } catch (error: any) {
    console.error("Error updating category:", error);
    message.error(
      error?.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่"
    );
    return null;
  }
};

// Delete category
export const onDeleteCategory = async ({
  id,
  final,
}: {
  id: string;
  final?: () => void;
}): Promise<boolean> => {
  try {
    await req.delete(`/api/v1/category/${id}`);
    message.success("ลบหมวดหมู่สำเร็จ");
    final?.();
    return true;
  } catch (error: any) {
    console.error("Error deleting category:", error);
    message.error(
      error?.response?.data?.message || "เกิดข้อผิดพลาดในการลบหมวดหมู่"
    );
    return false;
  }
};

// Helper function to flatten category tree for dropdown options
export const flattenCategoryTree = (
  categories: CategoryData[],
  level = 0
): Array<{ label: string; value: string }> => {
  const result: Array<{ label: string; value: string }> = [];

  categories.forEach((category) => {
    const prefix = "　".repeat(level); // Japanese space for indentation
    result.push({
      label: `${prefix}${category.name}`,
      value: category.id,
    });

    if (category.children && category.children.length > 0) {
      result.push(...flattenCategoryTree(category.children, level + 1));
    }
  });

  return result;
};
