export interface Response<T, U = string[]> {
  data: T;
  message: U;
  logId: string;
}
