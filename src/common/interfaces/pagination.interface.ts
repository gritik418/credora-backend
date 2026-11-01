export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PaginatedResponse<T, K extends string = 'data'> = {
  [key in K]: T;
} & {
  meta: PaginationMeta;
};
