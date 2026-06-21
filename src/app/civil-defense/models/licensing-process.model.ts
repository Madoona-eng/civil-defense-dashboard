export interface CreateLicensingProcessRequest {
  submissionDate: string;
  requestingEntityId: string;
  establishmentName: string;
  establishmentAddress: string;
  districtId: string;
  activityTypeId: string;
  applicantName: string;
  applicantRole: string;
  nationalId: string;
  responsibleManager: string;
  phone: string;

  entityLetters: File[];
  proofDocuments: File[];
  engineeringReports: File[];
  otherAttachments: File[];
}

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
  message: string;
}