import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';

import {
  ActivityType,
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
  deleting = false;

  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  selectedActivityType: ActivityType | null = null;

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
      next: (res: any) => {
        const data = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        this.activityTypes = data.map((item: any) => this.mapActivityType(item));
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

  openCreateModal(): void {
    this.resetForm();
    this.selectedActivityType = null;
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  openEditModal(item: ActivityType): void {
    this.selectedActivityType = item;

    this.formModel = {
      code: Number(item.code || 0),
      name: item.name || ''
    };

    this.showEditModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedActivityType = null;
    this.resetForm();
  }

  openDeleteModal(item: ActivityType): void {
    this.selectedActivityType = item;
    this.showDeleteModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedActivityType = null;
  }

  createActivityType(): void {
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

    this.saving = true;

    const payload: CreateActivityTypeRequest = {
      code,
      name
    };

    this.activityTypeService.create(payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess === false) {
          this.errorMessage =
            res?.message ||
            'لم يتم إنشاء نوع النشاط. ربما يكون الكود موجود بالفعل';
        } else {
          this.successMessage = res?.message || 'تم إنشاء نوع النشاط بنجاح';
          this.closeCreateModal();
          this.loadActivityTypes();
          this.changed.emit();
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

  updateActivityType(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedActivityType) {
      this.errorMessage = 'لم يتم تحديد نوع النشاط المطلوب تعديله';
      return;
    }

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

    this.saving = true;

    const payload: UpdateActivityTypeRequest = {
      code,
      name
    };

    this.activityTypeService.update(this.selectedActivityType.id, payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess === false) {
          this.errorMessage =
            res?.message ||
            'لم يتم تعديل نوع النشاط. ربما يكون الكود موجود بالفعل';
        } else {
          this.successMessage = res?.message || 'تم تعديل نوع النشاط بنجاح';
          this.closeEditModal();
          this.loadActivityTypes();
          this.changed.emit();
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

  confirmDeleteActivityType(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedActivityType) {
      this.errorMessage = 'لم يتم تحديد نوع النشاط المطلوب حذفه';
      return;
    }

    this.deleting = true;

    this.activityTypeService.delete(this.selectedActivityType.id).subscribe({
      next: (res: any) => {
        if (res?.isSuccess === false) {
          this.errorMessage = res?.message || 'حدث خطأ أثناء حذف نوع النشاط';
        } else {
          this.successMessage = res?.message || 'تم حذف نوع النشاط بنجاح';
          this.closeDeleteModal();
          this.loadActivityTypes();
          this.changed.emit();
        }

        this.deleting = false;
      },
      error: (err: any) => {
        console.error('ActivityType DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حذف نوع النشاط';

        this.deleting = false;
      }
    });
  }

  resetForm(): void {
    this.formModel = {
      code: 0,
      name: ''
    };

    this.selectedActivityType = null;
    this.saving = false;
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

  openDistrictManager(): void {
    this.router.navigateByUrl('/civil-defense/districts');
  }

  openRequestingEntitiesManager(): void {
    this.router.navigateByUrl('/civil-defense/requesting-entities');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }

  private mapActivityType(item: any): ActivityType {
    return {
      id: String(item?.id ?? item?.Id ?? ''),
      code: Number(item?.code ?? item?.Code ?? 0),
      name: String(item?.name ?? item?.Name ?? '')
    };
  }
}