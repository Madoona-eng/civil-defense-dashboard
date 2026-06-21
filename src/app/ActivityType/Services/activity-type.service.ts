import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivityType, ApiResponse, CreateActivityTypeRequest, UpdateActivityTypeRequest } from '../Models/activity-type.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityTypeService {

   private readonly baseUrl = '/api/ActivityType';
 
   constructor(private readonly http: HttpClient) {}
 
   getAll(): Observable<ApiResponse<ActivityType[]>> {
     return this.http.get<ApiResponse<ActivityType[]>>(this.baseUrl);
   }
 
   getById(id: string): Observable<ApiResponse<ActivityType>> {
     return this.http.get<ApiResponse<ActivityType>>(`${this.baseUrl}/${id}`);
   }
 
   create(payload: CreateActivityTypeRequest): Observable<ApiResponse<boolean>> {
     return this.http.post<ApiResponse<boolean>>(this.baseUrl, payload);
   }
 
   update(id: string, payload: UpdateActivityTypeRequest): Observable<ApiResponse<boolean>> {
     return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${id}`, payload);
   }
 
   delete(id: string): Observable<ApiResponse<boolean>> {
     return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
   }
}
