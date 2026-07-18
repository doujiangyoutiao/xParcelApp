export interface PageQueryParam {
  skipCount: number;
  maxResultCount: number;
}

export interface PageResult<T> {
  items: T;
  totalCount: number;
}
