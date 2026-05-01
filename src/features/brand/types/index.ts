export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBrandDto {
  name: string;
  description?: string;
}

export type UpdateBrandDto = Partial<CreateBrandDto>;
