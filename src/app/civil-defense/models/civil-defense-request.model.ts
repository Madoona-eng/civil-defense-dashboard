export type HazardLevel = 'منخفضة' | 'متوسطة' | 'عالية';

export type CivilDefenseRequestStatus =
  | 'NEW'
  | 'DOCUMENT_REVIEW'
  | 'INSPECTION_SCHEDULED'
  | 'INSPECTED'
  | 'NEEDS_COMPLETION'
  | 'COMPLIANT'
  | 'FINAL_APPROVAL'
  | 'ARCHIVED'
  | 'REJECTED';

export type InspectionResult = '' | 'COMPLIANT' | 'NEEDS_COMPLETION' | 'REJECTED';

export type WorkflowStepState = 'WAITING' | 'SENT' | 'RECEIVED' | 'COMPLETED' | 'NEEDS_ACTION';

export type DepartmentWorkflowKey =
  | 'engineeringAdministration'
  | 'researchAdministration'
  | 'stateProperty'
  | 'legalAffairs'
  | 'civilDefense'
  | 'specializedAdministration';

export interface DepartmentWorkflowStep {
  state: WorkflowStepState;
  sentDate?: string;
  receivedDate?: string;
  notes?: string;
}

export interface DepartmentWorkflow {
  engineeringAdministration: DepartmentWorkflowStep;
  researchAdministration: DepartmentWorkflowStep;
  stateProperty: DepartmentWorkflowStep;
  legalAffairs: DepartmentWorkflowStep;
  civilDefense: DepartmentWorkflowStep;
  specializedAdministration: DepartmentWorkflowStep;
}

export interface CivilDefenseAttachments {
  requestLetterFile?: string;
  nationalIdFile?: string;
  ownershipContractFile?: string;
  engineeringDrawingFile?: string;
  siteSketchFile?: string;
  commercialRegisterFile?: string;
  taxCardFile?: string;
  photosFile?: string;
  otherFile?: string;
}

export interface CivilDefenseInspection {
  scheduledDate?: string;
  inspectionDate?: string;
  inspectorName?: string;
  hasFireExtinguishers: boolean;
  hasEmergencyExits: boolean;
  hasFireAlarm: boolean;
  hasFireNetwork: boolean;
  hasVentilation: boolean;
  notes?: string;
  recommendations?: string;
  requiredActions?: string;
  nextInspectionDate?: string;
  reportFile?: string;
  result: InspectionResult;
}

export interface CivilDefenseStatusHistory {
  status: CivilDefenseRequestStatus;
  label: string;
  date: string;
  note?: string;
}

export interface CivilDefenseRequest {
  id: string;
  requestNumber: string;

  governorateCode: string;
  transactionCode: string;
  activityCode: string;
  requestDate: string;
  incomingDate?: string;
  licenseNumber?: string;
  trackingCode?: string;
  requestingEntity: string;

  applicantName: string;
  nationalId: string;
  mobile: string;
  applicantPhone?: string;
  applicantAddress: string;
  applicantRole: string;

  facilityName: string;
  activityType: string;
  facilityAddress: string;
  center: string;
  village: string;
  area: number;
  floorsCount: number;
  workNature: string;
  hazardLevel: HazardLevel;

  attachments: CivilDefenseAttachments;
  departmentWorkflow: DepartmentWorkflow;
  inspection?: CivilDefenseInspection;

  status: CivilDefenseRequestStatus;
  notes?: string;

  createdAt: string;
  updatedAt?: string;
  statusHistory?: CivilDefenseStatusHistory[];
}

export type CivilDefenseRequestPayload = Omit<
  CivilDefenseRequest,
  | 'id'
  | 'requestNumber'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'inspection'
  | 'statusHistory'
  | 'departmentWorkflow'
>;

export const CIVIL_DEFENSE_STATUS_LABELS: Record<CivilDefenseRequestStatus, string> = {
  NEW: 'طلب جديد',
  DOCUMENT_REVIEW: 'مراجعة الأوراق',
  INSPECTION_SCHEDULED: 'تحديد معاينة',
  INSPECTED: 'تمت المعاينة',
  NEEDS_COMPLETION: 'مطلوب استيفاء',
  COMPLIANT: 'مطابق',
  FINAL_APPROVAL: 'موافقة نهائية',
  ARCHIVED: 'أرشفة',
  REJECTED: 'مرفوض'
};

export const INSPECTION_RESULT_LABELS: Record<InspectionResult, string> = {
  '': 'لم يتم التحديد',
  COMPLIANT: 'مطابق',
  NEEDS_COMPLETION: 'مطلوب استيفاء',
  REJECTED: 'مرفوض'
};

export const WORKFLOW_STEP_LABELS: Record<DepartmentWorkflowKey, string> = {
  engineeringAdministration: 'الإدارة الهندسية',
  researchAdministration: 'إدارة البحوث',
  stateProperty: 'أملاك الدولة',
  legalAffairs: 'الشئون القانونية',
  civilDefense: 'الحماية المدنية',
  specializedAdministration: 'الإدارة المختصة'
};

export const WORKFLOW_STATE_LABELS: Record<WorkflowStepState, string> = {
  WAITING: 'منتظر',
  SENT: 'مرسل',
  RECEIVED: 'وارد',
  COMPLETED: 'منتهي',
  NEEDS_ACTION: 'ملاحظة'
};

export const EMPTY_INSPECTION: CivilDefenseInspection = {
  scheduledDate: '',
  inspectionDate: '',
  inspectorName: '',
  hasFireExtinguishers: false,
  hasEmergencyExits: false,
  hasFireAlarm: false,
  hasFireNetwork: false,
  hasVentilation: false,
  notes: '',
  recommendations: '',
  requiredActions: '',
  nextInspectionDate: '',
  reportFile: '',
  result: ''
};

export const EMPTY_WORKFLOW: DepartmentWorkflow = {
  engineeringAdministration: { state: 'WAITING', notes: '' },
  researchAdministration: { state: 'WAITING', notes: '' },
  stateProperty: { state: 'WAITING', notes: '' },
  legalAffairs: { state: 'WAITING', notes: '' },
  civilDefense: { state: 'WAITING', notes: '' },
  specializedAdministration: { state: 'WAITING', notes: '' }
};
