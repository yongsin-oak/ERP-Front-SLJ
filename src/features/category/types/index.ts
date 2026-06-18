export interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  description?: string | null;
  parentId: string | null;
  children: CategoryTreeNode[];
}

export interface CreateCategoryDto {
  name: string;
  parentId?: string;
  description?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
