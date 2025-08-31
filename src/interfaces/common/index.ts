export interface PaginationDataResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}