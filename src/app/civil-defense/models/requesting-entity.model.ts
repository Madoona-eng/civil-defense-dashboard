export interface RequestingEntity {
  id: string;
  code?: number;
  name: string;
}

export interface CreateRequestingEntityRequest {
  code: number;
  name: string;
}

export interface UpdateRequestingEntityRequest {
  code: number;
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}