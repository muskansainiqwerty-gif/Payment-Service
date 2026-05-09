export interface CreateResponse {
  error: boolean;
  message: string;
  data: object | object[] | null;
  status: number;
}
