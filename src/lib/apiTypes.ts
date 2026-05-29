export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiData<T> {
  data: T;
}

/**
 * Base for all paginated list query params.
 * Feature-specific params interfaces should extend this.
 *
 * interface ProductParams extends PageParams { search?: string; brandId?: string }
 */
export interface PageParams {
  page: number;
  limit: number;
}

/**
 * Derives an update DTO from a create DTO:
 * makes all fields optional and strips immutable keys K.
 *
 * type UpdateProductDto = UpdateDto<CreateProductDto, 'barcode'>
 * type UpdateBrandDto   = UpdateDto<CreateBrandDto>           // K defaults to never
 */
export type UpdateDto<T, K extends keyof T = never> = Partial<Omit<T, K>>;
