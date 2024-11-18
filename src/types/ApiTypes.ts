export interface DefaultResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
