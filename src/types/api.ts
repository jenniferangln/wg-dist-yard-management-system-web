export interface Response<T, U = string[]> {
  id: any;
  data: T;
  message: U;
  logId: string;
}
