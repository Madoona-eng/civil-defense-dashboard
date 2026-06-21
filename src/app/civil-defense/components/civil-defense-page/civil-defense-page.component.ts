import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  CIVIL_DEFENSE_STATUS_LABELS,
  CivilDefenseInspection,
  CivilDefenseRequest,
  CivilDefenseRequestPayload,
  CivilDefenseRequestStatus,
  HazardLevel
} from '../../models/civil-defense-request.model';

import { AuthUser } from '../../../auth/models/auth-user.model';
import { AuthService } from '../../../auth/services/auth.service';

import { CivilDefenseMockService } from '../../services/civil-defense-mock.service';

import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';


type StatusFilter = 'ALL' | CivilDefenseRequestStatus;

interface StatusCard {
  key: StatusFilter;
  label: string;
  hint: string;
}

@Component({
  selector: 'app-civil-defense-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardSidebarComponent,

  ],
  templateUrl: './civil-defense-page.component.html',
  styleUrls: ['./civil-defense-page.component.scss']
})
export class CivilDefensePageComponent implements OnInit {
  requests: CivilDefenseRequest[] = [];
  filteredRequests: CivilDefenseRequest[] = [];

  activityTypes: string[] = [];
  hazardLevels: HazardLevel[] = [];

  selectedStatus: StatusFilter = 'ALL';
  searchTerm = '';

  currentUser: AuthUser | null = null;

  requestToEdit: CivilDefenseRequest | null = null;
  requestForInspection: CivilDefenseRequest | null = null;

  showRequestForm = false;

  readonly statusCards: StatusCard[] = [
    { key: 'ALL', label: 'كل الطلبات', hint: 'إجمالي الملفات' },
    { key: 'NEW', label: 'طلبات جديدة', hint: 'لسه متسجلة' },
    { key: 'DOCUMENT_REVIEW', label: 'مراجعة الأوراق', hint: 'إرسال للإدارات' },
    { key: 'INSPECTION_SCHEDULED', label: 'إجراء المعاينة', hint: 'جاهزة للنزول' },
    { key: 'NEEDS_COMPLETION', label: 'مطلوب استيفاء', hint: 'ناقص اشتراطات' },
    { key: 'COMPLIANT', label: 'مطابق', hint: 'جاهز للموافقة' },
    { key: 'FINAL_APPROVAL', label: 'موافقة نهائية', hint: 'تم الاعتماد' },
    { key: 'ARCHIVED', label: 'الأرشيف العام', hint: 'طلبات مقفولة' },
    { key: 'REJECTED', label: 'مرفوض', hint: 'طلبات مرفوضة' }
  ];

  constructor(
    private readonly civilDefenseService: CivilDefenseMockService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadLookups();

    this.civilDefenseService.init().subscribe();

    this.civilDefenseService.requests$.subscribe(data => {
      this.requests = data;
      this.refreshSelectedReferences();
      this.applyFilters();
    });
  }

  selectStatus(status: StatusFilter | string): void {
    this.selectedStatus = status as StatusFilter;
    this.applyFilters();
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  openCreateRequest(): void {
    this.requestToEdit = null;
    this.showRequestForm = true;
  }

  openEditRequest(item: CivilDefenseRequest): void {
    this.requestToEdit = item;
    this.showRequestForm = true;
  }

  closeRequestForm(): void {
    this.showRequestForm = false;
    this.requestToEdit = null;
  }

  scrollToForm(): void {
    this.openCreateRequest();
  }

  openInspectionQueue(): void {
    this.selectStatus('INSPECTION_SCHEDULED');
  }

  openFinalApprovals(): void {
    this.selectStatus('COMPLIANT');
  }

  openArchive(): void {
    this.selectStatus('ARCHIVED');
  }

  openActivityTypesManager(): void {
    this.router.navigateByUrl('/civil-defense/activity-types');
  }

  openDistrictManager(): void {
    this.router.navigateByUrl('/civil-defense/districts');
  }

  openRequestingEntitiesManager(): void {
    this.router.navigateByUrl('/civil-defense/requesting-entities');
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredRequests = this.requests.filter(item => {
      const matchesStatus =
        this.selectedStatus === 'ALL' || item.status === this.selectedStatus;

      const searchableText = [
        item.requestNumber,
        item.governorateCode,
        item.transactionCode,
        item.activityCode,
        item.licenseNumber,
        item.trackingCode,
        item.requestingEntity,
        item.facilityName,
        item.applicantName,
        item.mobile,
        item.nationalId,
        item.activityType,
        item.center,
        item.village,
        item.facilityAddress
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !term || searchableText.includes(term);

      return matchesStatus && matchesSearch;
    });
  }

  getCount(status: StatusFilter): number {
    if (status === 'ALL') {
      return this.requests.length;
    }

    return this.requests.filter(item => item.status === status).length;
  }

  getStatusLabel(status: CivilDefenseRequestStatus): string {
    return CIVIL_DEFENSE_STATUS_LABELS[status];
  }

  getSelectedStatusLabel(): string {
    return this.selectedStatus === 'ALL'
      ? 'كل الطلبات'
      : this.getStatusLabel(this.selectedStatus);
  }

  getUserName(): string {
    const user: any = this.currentUser;
    return user?.name || user?.username || 'Admin';
  }

  getUserRole(): string {
    const user: any = this.currentUser;
    return user?.role || 'مدير النظام';
  }

  saveRequest(payload: CivilDefenseRequestPayload): void {
    if (this.requestToEdit) {
      this.civilDefenseService.updateRequest(this.requestToEdit.id, payload);
      this.closeRequestForm();
      return;
    }

    this.civilDefenseService.addRequest(payload);
    this.closeRequestForm();
  }

  onRequestSaved(payload: CivilDefenseRequestPayload): void {
    this.saveRequest(payload);
  }

  editRequest(item: CivilDefenseRequest): void {
    this.openEditRequest(item);
  }

  cancelEdit(): void {
    this.closeRequestForm();
  }

  deleteRequest(id: string): void {
    const confirmed = confirm('هل تريدين حذف هذا الطلب؟');
    if (!confirmed) return;

    this.civilDefenseService.deleteRequest(id);

    if (this.requestToEdit?.id === id) {
      this.closeRequestForm();
    }

    if (this.requestForInspection?.id === id) {
      this.closeInspection();
    }
  }

  changeStatus(event: {
    id: string;
    status: CivilDefenseRequestStatus;
    note?: string;
  }): void {
    this.civilDefenseService.changeStatus(event.id, event.status, event.note);
  }

  openInspection(item: CivilDefenseRequest): void {
    this.requestForInspection = item;
  }

  closeInspection(): void {
    this.requestForInspection = null;
  }

  saveInspection(event: {
    requestId: string;
    inspection: CivilDefenseInspection;
  }): void {
    this.civilDefenseService.saveInspection(event.requestId, event.inspection);
    this.closeInspection();
  }

  resetMockData(): void {
    const confirmed = confirm(
      'سيتم حذف البيانات المحفوظة في المتصفح والرجوع لبيانات JSON التجريبية. هل تريدين المتابعة؟'
    );

    if (!confirmed) return;

    this.closeRequestForm();
    this.requestForInspection = null;

    this.civilDefenseService.resetToJson().subscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  trackByStatusKey(_: number, item: StatusCard): StatusFilter {
    return item.key;
  }

  private loadLookups(): void {
    this.civilDefenseService.loadLookups().subscribe(result => {
      this.activityTypes = result.activityTypes;
      this.hazardLevels = result.hazardLevels;
    });
  }

  private refreshSelectedReferences(): void {
    if (this.requestToEdit) {
      this.requestToEdit =
        this.requests.find(item => item.id === this.requestToEdit?.id) ?? null;

      if (!this.requestToEdit) {
        this.showRequestForm = false;
      }
    }

    if (this.requestForInspection) {
      this.requestForInspection =
        this.requests.find(item => item.id === this.requestForInspection?.id) ?? null;
    }
  }
}