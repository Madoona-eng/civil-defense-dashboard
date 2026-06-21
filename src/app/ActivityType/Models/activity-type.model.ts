export interface ActivityType {
  id: string;
  code?: number;
  name: string;
}

export interface CreateActivityTypeRequest {
  code: number;
  name: string;
}

export interface UpdateActivityTypeRequest {
  code: number;
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}