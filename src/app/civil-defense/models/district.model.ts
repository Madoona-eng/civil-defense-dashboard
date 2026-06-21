export interface District {
  id: string;
  code?: number;
  name: string;
}

export interface CreateDistrictRequest {
  code: number;
  name: string;
}

export interface UpdateDistrictRequest {
  code: number;
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}