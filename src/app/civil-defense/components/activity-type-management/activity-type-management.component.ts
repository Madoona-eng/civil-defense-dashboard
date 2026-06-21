import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';

import {
  ActivityType,
  ApiResponse,
  CreateActivityTypeRequest,
  UpdateActivityTypeRequest
} from '../../models/activity-type.model';

import { ActivityTypeService } from '../../services/activity-type.service';

@Component({
  selector: 'app-civil-defense-activity-type-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardSidebarComponent
  ],
  templateUrl: './activity-type-management.component.html',
  styleUrls: ['./activity-type-management.component.scss']
})
export class ActivityTypeManagementComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();

  activityTypes: ActivityType[] = [];

  loading = false;
  saving = false;
  deletingId: string | null = null;
  loadingDetailsId: string | null = null;

  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  selectedActivityTypeId: string | null = null;
  isEditMode = false;

  formModel: CreateActivityTypeRequest = {
    code: 0,
    name: ''
  };

  constructor(
    private readonly activityTypeService: ActivityTypeService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadActivityTypes();
  }

  loadActivityTypes(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.activityTypeService.getAll().subscribe({
      next: (res: ApiResponse<ActivityType[]>) => {
        if (res?.isSuccess) {
          this.activityTypes = res.data || [];
        } else {
          this.errorMessage = res?.message || 'حدث خطأ أثناء تحميل أنواع النشاط';
        }

        this.loading = false;
      },
      error: (err: any) => {
        console.error('ActivityType GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل أنواع النشاط';

        this.loading = false;
      }
    });
  }

  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const code = Number(this.formModel.code);
    const name = this.formModel.name.trim();

    if (!Number.isFinite(code) || code <= 0) {
      this.errorMessage = 'من فضلك أدخلي رقم كود صحيح';
      return;
    }

    if (!name) {
      this.errorMessage = 'من فضلك أدخلي اسم نوع النشاط';
      return;
    }

    if (this.isEditMode && this.selectedActivityTypeId) {
      this.updateActivityType(this.selectedActivityTypeId, { code, name });
      return;
    }

    this.createActivityType({ code, name });
  }

  createActivityType(payload: CreateActivityTypeRequest): void {
    this.saving = true;

    this.activityTypeService.create(payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم إنشاء نوع النشاط بنجاح';
          this.resetForm();
          this.loadActivityTypes();
          this.changed.emit();
        } else {
          this.errorMessage =
            res?.message ||
            'لم يتم إنشاء نوع النشاط. ربما يكون الكود موجود بالفعل';
        }

        this.saving = false;
      },
      error: (err: any) => {
        console.error('ActivityType POST error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'لم يتم إنشاء نوع النشاط. ربما يكون الكود موجود بالفعل';

        this.saving = false;
      }
    });
  }

  editActivityType(item: ActivityType): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.selectedActivityTypeId = item.id;
    this.loadingDetailsId = item.id;

    this.activityTypeService.getById(item.id).subscribe({
      next: (res: ApiResponse<ActivityType>) => {
        if (res?.isSuccess && res.data) {
          this.isEditMode = true;
          this.selectedActivityTypeId = res.data.id;

          this.formModel = {
            code: Number(res.data.code || 0),
            name: res.data.name || ''
          };
        } else {
          this.errorMessage = res?.message || 'تعذر تحميل بيانات نوع النشاط';
        }

        this.loadingDetailsId = null;
      },
      error: (err: any) => {
        console.error('ActivityType GET BY ID error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'تعذر تحميل بيانات نوع النشاط';

        this.loadingDetailsId = null;
      }
    });
  }

  updateActivityType(id: string, payload: UpdateActivityTypeRequest): void {
    this.saving = true;

    this.activityTypeService.update(id, payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم تعديل نوع النشاط بنجاح';
          this.resetForm();
          this.loadActivityTypes();
          this.changed.emit();
        } else {
          this.errorMessage =
            res?.message ||
            'لم يتم تعديل نوع النشاط. ربما يكون الكود موجود بالفعل';
        }

        this.saving = false;
      },
      error: (err: any) => {
        console.error('ActivityType PUT error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'لم يتم تعديل نوع النشاط. ربما يكون الكود موجود بالفعل';

        this.saving = false;
      }
    });
  }

  deleteActivityType(item: ActivityType): void {
    const confirmed = confirm(`هل تريدين حذف نوع النشاط "${item.name}"؟`);
    if (!confirmed) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.deletingId = item.id;

    this.activityTypeService.delete(item.id).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم حذف نوع النشاط بنجاح';

          if (this.selectedActivityTypeId === item.id) {
            this.resetForm();
          }

          this.loadActivityTypes();
          this.changed.emit();
        } else {
          this.errorMessage = res?.message || 'حدث خطأ أثناء حذف نوع النشاط';
        }

        this.deletingId = null;
      },
      error: (err: any) => {
        console.error('ActivityType DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حذف نوع النشاط';

        this.deletingId = null;
      }
    });
  }

  resetForm(): void {
    this.formModel = {
      code: 0,
      name: ''
    };

    this.selectedActivityTypeId = null;
    this.isEditMode = false;
    this.saving = false;
    this.loadingDetailsId = null;
  }

  get filteredActivityTypes(): ActivityType[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.activityTypes;
    }

    return this.activityTypes.filter(item => {
      const id = String(item.id || '').toLowerCase();
      const code = String(item.code || '').toLowerCase();
      const name = String(item.name || '').toLowerCase();

      return id.includes(term) || code.includes(term) || name.includes(term);
    });
  }

  trackById(_: number, item: ActivityType): string {
    return item.id;
  }

  getUserName(): string {
    return localStorage.getItem('userName') || 'Admin';
  }

  getUserRole(): string {
    return localStorage.getItem('userRole') || 'مدير النظام';
  }

  goToDashboard(): void {
    this.router.navigateByUrl('/civil-defense');
  }

  openCreateRequest(): void {
    this.router.navigateByUrl('/civil-defense');
  }

  selectStatus(_: string): void {
    this.router.navigateByUrl('/civil-defense');
  }

  openInspectionQueue(): void {
    this.router.navigateByUrl('/civil-defense');
  }

  openFinalApprovals(): void {
    this.router.navigateByUrl('/civil-defense');
  }

  openArchive(): void {
    this.router.navigateByUrl('/civil-defense');
  }

  openActivityTypesManager(): void {
    this.router.navigateByUrl('/civil-defense/activity-types');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }
}