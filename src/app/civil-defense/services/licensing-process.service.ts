import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  CreateLicensingProcessRequest
} from '../models/licensing-process.model';

@Injectable({
  providedIn: 'root'
})
export class LicensingProcessService {
  private readonly apiUrl = '/api/LicensingProcess';

  constructor(private readonly http: HttpClient) {}

  create(payload: CreateLicensingProcessRequest): Observable<ApiResponse<any>> {
    const formData = new FormData();

    formData.append('SubmissionDate', payload.submissionDate);
    formData.append('RequestingEntityId', payload.requestingEntityId);
    formData.append('EstablishmentName', payload.establishmentName);
    formData.append('EstablishmentAddress', payload.establishmentAddress);
    formData.append('DistrictId', payload.districtId);
    formData.append('ActivityTypeId', payload.activityTypeId);
    formData.append('ApplicantName', payload.applicantName);
    formData.append('ApplicantRole', payload.applicantRole);
    formData.append('NationalId', payload.nationalId);
    formData.append('ResponsibleManager', payload.responsibleManager);
    formData.append('Phone', payload.phone);

    payload.entityLetters.forEach(file => {
      formData.append('EntityLetters', file);
    });

    payload.proofDocuments.forEach(file => {
      formData.append('ProofDocuments', file);
    });

    payload.engineeringReports.forEach(file => {
      formData.append('EngineeringReports', file);
    });

    payload.otherAttachments.forEach(file => {
      formData.append('OtherAttachments', file);
    });

    return this.http.post<ApiResponse<any>>(this.apiUrl, formData);
  }
}