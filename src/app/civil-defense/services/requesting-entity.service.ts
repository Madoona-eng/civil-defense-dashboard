import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  CreateRequestingEntityRequest,
  RequestingEntity,
  UpdateRequestingEntityRequest
} from '../models/requesting-entity.model';

@Injectable({
  providedIn: 'root'
})
export class RequestingEntityService {
  private readonly baseUrl = '/api/RequestingEntity';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ApiResponse<RequestingEntity[]>> {
    return this.http.get<ApiResponse<RequestingEntity[]>>(this.baseUrl);
  }

  getById(id: string): Observable<ApiResponse<RequestingEntity>> {
    return this.http.get<ApiResponse<RequestingEntity>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateRequestingEntityRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(this.baseUrl, payload);
  }

  update(
    id: string,
    payload: UpdateRequestingEntityRequest
  ): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }
}