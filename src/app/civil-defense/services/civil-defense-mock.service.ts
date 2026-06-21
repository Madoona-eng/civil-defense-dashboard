import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of, tap } from 'rxjs';
import {
  CIVIL_DEFENSE_STATUS_LABELS,
  CivilDefenseInspection,
  CivilDefenseRequest,
  CivilDefenseRequestPayload,
  CivilDefenseRequestStatus,
  DepartmentWorkflow,
  EMPTY_WORKFLOW,
  HazardLevel
} from '../models/civil-defense-request.model';

@Injectable({
  providedIn: 'root'
})
export class CivilDefenseMockService {
  private readonly storageKey = 'civil_defense_requests_mock_data_v2';
  private readonly requestsJsonUrl = 'assets/mock/civil-defense-requests.json';
  private readonly activityTypesJsonUrl = 'assets/mock/activity-types.json';
  private readonly hazardLevelsJsonUrl = 'assets/mock/hazard-levels.json';

  private readonly requestsSubject = new BehaviorSubject<CivilDefenseRequest[]>([]);
  private readonly activityTypesSubject = new BehaviorSubject<string[]>([]);
  private readonly hazardLevelsSubject = new BehaviorSubject<HazardLevel[]>([]);

  readonly requests$ = this.requestsSubject.asObservable();
  readonly activityTypes$ = this.activityTypesSubject.asObservable();
  readonly hazardLevels$ = this.hazardLevelsSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  init(): Observable<CivilDefenseRequest[]> {
    const cached = this.readFromStorage();

    if (cached.length > 0) {
      this.requestsSubject.next(cached);
      return of(cached);
    }

    return this.http.get<CivilDefenseRequest[]>(this.requestsJsonUrl).pipe(
      tap(data => this.setData(data.map(item => this.normalizeRequest(item))))
    );
  }

  loadLookups(): Observable<{ activityTypes: string[]; hazardLevels: HazardLevel[] }> {
    return forkJoin({
      activityTypes: this.http.get<string[]>(this.activityTypesJsonUrl),
      hazardLevels: this.http.get<HazardLevel[]>(this.hazardLevelsJsonUrl)
    }).pipe(
      tap(result => {
        this.activityTypesSubject.next(result.activityTypes);
        this.hazardLevelsSubject.next(result.hazardLevels);
      })
    );
  }

  getCurrentData(): CivilDefenseRequest[] {
    return this.requestsSubject.value;
  }

  getById(id: string): CivilDefenseRequest | undefined {
    return this.getCurrentData().find(item => item.id === id);
  }

  addRequest(payload: CivilDefenseRequestPayload): void {
    const status: CivilDefenseRequestStatus = 'NEW';
    const now = new Date().toISOString();

    const newRequest: CivilDefenseRequest = {
      ...payload,
      id: this.createId(),
      requestNumber: this.generateRequestNumber(),
      departmentWorkflow: this.createDefaultWorkflow(),
      status,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status,
          label: CIVIL_DEFENSE_STATUS_LABELS[status],
          date: now,
          note: 'تم إنشاء طلب ترخيص / موافقة حماية مدنية'
        }
      ]
    };

    this.setData([newRequest, ...this.getCurrentData()]);
  }

  updateRequest(id: string, payload: CivilDefenseRequestPayload): void {
    const now = new Date().toISOString();

    const updated = this.getCurrentData().map(item => {
      if (item.id !== id) return item;

      return this.normalizeRequest({
        ...item,
        ...payload,
        departmentWorkflow: item.departmentWorkflow ?? this.createDefaultWorkflow(),
        updatedAt: now
      });
    });

    this.setData(updated);
  }

  deleteRequest(id: string): void {
    this.setData(this.getCurrentData().filter(item => item.id !== id));
  }

  changeStatus(id: string, status: CivilDefenseRequestStatus, note?: string): void {
    const now = new Date().toISOString();

    const updated = this.getCurrentData().map(item => {
      if (item.id !== id) return item;

      const workflow = this.updateWorkflowByStatus(item.departmentWorkflow, status, now);

      return {
        ...item,
        status,
        departmentWorkflow: workflow,
        updatedAt: now,
        statusHistory: [
          ...(item.statusHistory ?? []),
          {
            status,
            label: CIVIL_DEFENSE_STATUS_LABELS[status],
            date: now,
            note: note ?? 'تم تغيير حالة الطلب'
          }
        ]
      };
    });

    this.setData(updated);
  }

  saveInspection(id: string, inspection: CivilDefenseInspection): void {
    const now = new Date().toISOString();
    const status = this.getStatusFromInspection(inspection);

    const updated = this.getCurrentData().map(item => {
      if (item.id !== id) return item;

      return {
        ...item,
        inspection,
        status,
        departmentWorkflow: this.updateWorkflowByStatus(item.departmentWorkflow, status, now),
        updatedAt: now,
        statusHistory: [
          ...(item.statusHistory ?? []),
          {
            status,
            label: CIVIL_DEFENSE_STATUS_LABELS[status],
            date: now,
            note: 'تم حفظ بيانات المعاينة'
          }
        ]
      };
    });

    this.setData(updated);
  }

  resetToJson(): Observable<CivilDefenseRequest[]> {
    localStorage.removeItem(this.storageKey);

    return this.http.get<CivilDefenseRequest[]>(this.requestsJsonUrl).pipe(
      tap(data => this.setData(data.map(item => this.normalizeRequest(item))))
    );
  }

  private getStatusFromInspection(inspection: CivilDefenseInspection): CivilDefenseRequestStatus {
    if (inspection.result === 'COMPLIANT') return 'COMPLIANT';
    if (inspection.result === 'NEEDS_COMPLETION') return 'NEEDS_COMPLETION';
    if (inspection.result === 'REJECTED') return 'REJECTED';
    if (inspection.scheduledDate && !inspection.inspectionDate) return 'INSPECTION_SCHEDULED';
    return 'INSPECTED';
  }

  private updateWorkflowByStatus(
    workflow: DepartmentWorkflow | undefined,
    status: CivilDefenseRequestStatus,
    now: string
  ): DepartmentWorkflow {
    const updated = this.cloneWorkflow(workflow);

    if (status === 'DOCUMENT_REVIEW') {
      updated.engineeringAdministration = { ...updated.engineeringAdministration, state: 'SENT', sentDate: now };
      updated.researchAdministration = { ...updated.researchAdministration, state: 'SENT', sentDate: now };
      updated.stateProperty = { ...updated.stateProperty, state: 'SENT', sentDate: now };
      updated.legalAffairs = { ...updated.legalAffairs, state: 'SENT', sentDate: now };
    }

    if (status === 'INSPECTION_SCHEDULED') {
      updated.civilDefense = { ...updated.civilDefense, state: 'SENT', sentDate: now };
    }

    if (status === 'INSPECTED') {
      updated.civilDefense = { ...updated.civilDefense, state: 'RECEIVED', receivedDate: now };
    }

    if (status === 'NEEDS_COMPLETION') {
      updated.civilDefense = { ...updated.civilDefense, state: 'NEEDS_ACTION', receivedDate: now, notes: 'مطلوب استيفاء اشتراطات' };
    }

    if (status === 'COMPLIANT') {
      updated.civilDefense = { ...updated.civilDefense, state: 'COMPLETED', receivedDate: now, notes: 'مطابق لاشتراطات الحماية المدنية' };
      updated.specializedAdministration = { ...updated.specializedAdministration, state: 'SENT', sentDate: now };
    }

    if (status === 'FINAL_APPROVAL') {
      updated.specializedAdministration = { ...updated.specializedAdministration, state: 'COMPLETED', receivedDate: now, notes: 'تم الاعتماد النهائي' };
    }

    if (status === 'ARCHIVED') {
      updated.engineeringAdministration = { ...updated.engineeringAdministration, state: 'COMPLETED' };
      updated.researchAdministration = { ...updated.researchAdministration, state: 'COMPLETED' };
      updated.stateProperty = { ...updated.stateProperty, state: 'COMPLETED' };
      updated.legalAffairs = { ...updated.legalAffairs, state: 'COMPLETED' };
      updated.civilDefense = { ...updated.civilDefense, state: 'COMPLETED' };
      updated.specializedAdministration = { ...updated.specializedAdministration, state: 'COMPLETED' };
    }

    if (status === 'REJECTED') {
      updated.specializedAdministration = { ...updated.specializedAdministration, state: 'NEEDS_ACTION', receivedDate: now, notes: 'تم رفض الطلب' };
    }

    return updated;
  }

  private setData(data: CivilDefenseRequest[]): void {
    const normalized = data.map(item => this.normalizeRequest(item));
    this.requestsSubject.next(normalized);
    localStorage.setItem(this.storageKey, JSON.stringify(normalized));
  }

  private readFromStorage(): CivilDefenseRequest[] {
    const cached = localStorage.getItem(this.storageKey);
    if (!cached) return [];

    try {
      return (JSON.parse(cached) as CivilDefenseRequest[]).map(item => this.normalizeRequest(item));
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  private normalizeRequest(item: Partial<CivilDefenseRequest>): CivilDefenseRequest {
    const now = new Date().toISOString();

    return {
      id: item.id ?? this.createId(),
      requestNumber: item.requestNumber ?? this.generateRequestNumber(),
      governorateCode: item.governorateCode ?? '28',
      transactionCode: item.transactionCode ?? '',
      activityCode: item.activityCode ?? '',
      requestDate: item.requestDate ?? this.todayAsInputValue(),
      incomingDate: item.incomingDate ?? '',
      licenseNumber: item.licenseNumber ?? '',
      trackingCode: item.trackingCode ?? '',
      requestingEntity: item.requestingEntity ?? 'مواطن',
      applicantName: item.applicantName ?? '',
      nationalId: item.nationalId ?? '',
      mobile: item.mobile ?? '',
      applicantPhone: item.applicantPhone ?? '',
      applicantAddress: item.applicantAddress ?? '',
      applicantRole: item.applicantRole ?? 'مالك',
      facilityName: item.facilityName ?? '',
      activityType: item.activityType ?? '',
      facilityAddress: item.facilityAddress ?? '',
      center: item.center ?? '',
      village: item.village ?? '',
      area: Number(item.area ?? 0),
      floorsCount: Number(item.floorsCount ?? 1),
      workNature: item.workNature ?? '',
      hazardLevel: item.hazardLevel ?? 'متوسطة',
      attachments: {
        requestLetterFile: item.attachments?.requestLetterFile ?? '',
        nationalIdFile: item.attachments?.nationalIdFile ?? '',
        ownershipContractFile: item.attachments?.ownershipContractFile ?? '',
        engineeringDrawingFile: item.attachments?.engineeringDrawingFile ?? '',
        siteSketchFile: item.attachments?.siteSketchFile ?? '',
        commercialRegisterFile: item.attachments?.commercialRegisterFile ?? '',
        taxCardFile: item.attachments?.taxCardFile ?? '',
        photosFile: item.attachments?.photosFile ?? '',
        otherFile: item.attachments?.otherFile ?? ''
      },
      departmentWorkflow: this.cloneWorkflow(item.departmentWorkflow),
      inspection: item.inspection,
      status: item.status ?? 'NEW',
      notes: item.notes ?? '',
      createdAt: item.createdAt ?? now,
      updatedAt: item.updatedAt ?? now,
      statusHistory: item.statusHistory ?? []
    };
  }

  private createDefaultWorkflow(): DepartmentWorkflow {
    return this.cloneWorkflow(EMPTY_WORKFLOW);
  }

  private cloneWorkflow(workflow?: DepartmentWorkflow): DepartmentWorkflow {
    const base = workflow ?? EMPTY_WORKFLOW;

    return {
      engineeringAdministration: { ...EMPTY_WORKFLOW.engineeringAdministration, ...base.engineeringAdministration },
      researchAdministration: { ...EMPTY_WORKFLOW.researchAdministration, ...base.researchAdministration },
      stateProperty: { ...EMPTY_WORKFLOW.stateProperty, ...base.stateProperty },
      legalAffairs: { ...EMPTY_WORKFLOW.legalAffairs, ...base.legalAffairs },
      civilDefense: { ...EMPTY_WORKFLOW.civilDefense, ...base.civilDefense },
      specializedAdministration: { ...EMPTY_WORKFLOW.specializedAdministration, ...base.specializedAdministration }
    };
  }

  private generateRequestNumber(): string {
    const year = new Date().getFullYear();
    const numbers = this.getCurrentData()
      .map(item => item.requestNumber.match(/CD-\d{4}-(\d+)/)?.[1])
      .filter((value): value is string => Boolean(value))
      .map(value => Number(value));

    const next = numbers.length ? Math.max(...numbers) + 1 : 1;
    return `CD-${year}-${String(next).padStart(4, '0')}`;
  }

  private todayAsInputValue(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
