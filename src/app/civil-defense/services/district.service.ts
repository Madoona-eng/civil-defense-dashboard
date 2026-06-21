import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  CreateDistrictRequest,
  District,
  UpdateDistrictRequest
} from '../models/district.model';

@Injectable({
  providedIn: 'root'
})
export class DistrictService {
  private readonly baseUrl = '/api/District';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ApiResponse<District[]>> {
    return this.http.get<ApiResponse<District[]>>(this.baseUrl);
  }

  getById(id: string): Observable<ApiResponse<District>> {
    return this.http.get<ApiResponse<District>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateDistrictRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateDistrictRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }
}