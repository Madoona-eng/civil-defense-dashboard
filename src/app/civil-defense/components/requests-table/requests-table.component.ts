import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CIVIL_DEFENSE_STATUS_LABELS,
  CivilDefenseRequest,
  CivilDefenseRequestStatus,
  DepartmentWorkflowKey,
  WORKFLOW_STATE_LABELS,
  WORKFLOW_STEP_LABELS,
  WorkflowStepState
} from '../../models/civil-defense-request.model';

interface WorkflowViewItem {
  key: DepartmentWorkflowKey;
  label: string;
  state: WorkflowStepState;
  stateLabel: string;
}

@Component({
  selector: 'app-civil-defense-requests-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requests-table.component.html',
  styleUrls: ['./requests-table.component.scss']
})
export class RequestsTableComponent {
  @Input() requests: CivilDefenseRequest[] = [];

  @Output() edit = new EventEmitter<CivilDefenseRequest>();
  @Output() removed = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<{ id: string; status: CivilDefenseRequestStatus; note?: string }>();
  @Output() inspection = new EventEmitter<CivilDefenseRequest>();

  readonly workflowKeys: DepartmentWorkflowKey[] = [
    'engineeringAdministration',
    'researchAdministration',
    'stateProperty',
    'legalAffairs',
    'civilDefense',
    'specializedAdministration'
  ];

  getStatusLabel(status: CivilDefenseRequestStatus): string {
    return CIVIL_DEFENSE_STATUS_LABELS[status];
  }

  getWorkflowStateLabel(state: WorkflowStepState): string {
    return WORKFLOW_STATE_LABELS[state];
  }

  getWorkflowSteps(item: CivilDefenseRequest): WorkflowViewItem[] {
    return this.workflowKeys.map(key => {
      const state = item.departmentWorkflow?.[key]?.state ?? 'WAITING';

      return {
        key,
        label: WORKFLOW_STEP_LABELS[key],
        state,
        stateLabel: this.getWorkflowStateLabel(state)
      };
    });
  }

  getAttachmentsCount(item: CivilDefenseRequest): number {
    return Object.values(item.attachments ?? {}).filter(Boolean).length;
  }

  reviewDocuments(item: CivilDefenseRequest): void {
    this.statusChange.emit({
      id: item.id,
      status: 'DOCUMENT_REVIEW',
      note: 'تم إرسال الطلب إلى مراجعة الأوراق والإدارات المختصة'
    });
  }

  scheduleInspection(item: CivilDefenseRequest): void {
    this.statusChange.emit({
      id: item.id,
      status: 'INSPECTION_SCHEDULED',
      note: 'تم إرسال الطلب إلى الحماية المدنية لتحديد المعاينة'
    });
  }

  markFinalApproval(item: CivilDefenseRequest): void {
    this.statusChange.emit({
      id: item.id,
      status: 'FINAL_APPROVAL',
      note: 'تم إصدار الموافقة النهائية'
    });
  }

  reject(item: CivilDefenseRequest): void {
    this.statusChange.emit({
      id: item.id,
      status: 'REJECTED',
      note: 'تم رفض الطلب'
    });
  }

  archive(item: CivilDefenseRequest): void {
    this.statusChange.emit({
      id: item.id,
      status: 'ARCHIVED',
      note: 'تمت أرشفة الطلب'
    });
  }

  canReview(item: CivilDefenseRequest): boolean {
    return item.status === 'NEW';
  }

  canSchedule(item: CivilDefenseRequest): boolean {
    return item.status === 'DOCUMENT_REVIEW' || item.status === 'NEEDS_COMPLETION';
  }

  canOpenInspection(item: CivilDefenseRequest): boolean {
    return item.status === 'INSPECTION_SCHEDULED' || item.status === 'INSPECTED' || item.status === 'NEEDS_COMPLETION';
  }

  canApprove(item: CivilDefenseRequest): boolean {
    return item.status === 'COMPLIANT';
  }

  canReject(item: CivilDefenseRequest): boolean {
    return item.status !== 'ARCHIVED' && item.status !== 'FINAL_APPROVAL' && item.status !== 'REJECTED';
  }

  canArchive(item: CivilDefenseRequest): boolean {
    return item.status === 'FINAL_APPROVAL' || item.status === 'REJECTED';
  }

  trackByRequestId(_: number, item: CivilDefenseRequest): string {
    return item.id;
  }

  trackByWorkflowKey(_: number, item: WorkflowViewItem): DepartmentWorkflowKey {
    return item.key;
  }
}
