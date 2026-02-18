export interface PaginationDataResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
export interface PaginationDataQuery {
  page?: number;
  limit?: number;
}

export interface Timestamped { 
  createdAt: Date;
  updatedAt: Date;
}
