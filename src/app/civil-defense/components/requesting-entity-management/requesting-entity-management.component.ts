import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';

import {
  ApiResponse,
  CreateRequestingEntityRequest,
  RequestingEntity,
  UpdateRequestingEntityRequest
} from '../../models/requesting-entity.model';

import { RequestingEntityService } from '../../services/requesting-entity.service';

@Component({
  selector: 'app-requesting-entity-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardSidebarComponent
  ],
  templateUrl: './requesting-entity-management.component.html',
  styleUrls: ['./requesting-entity-management.component.scss']
})
export class RequestingEntityPageComponent implements OnInit {
  entities: RequestingEntity[] = [];

  loading = false;
  saving = false;
  deletingId: string | null = null;
  loadingDetailsId: string | null = null;

  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  selectedEntityId: string | null = null;
  isEditMode = false;

  formModel: CreateRequestingEntityRequest = {
    code: 0,
    name: ''
  };

  constructor(
    private readonly requestingEntityService: RequestingEntityService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.requestingEntityService.getAll().subscribe({
      next: (res: ApiResponse<RequestingEntity[]>) => {
        if (res?.isSuccess) {
          this.entities = res.data || [];
        } else {
          this.errorMessage = res?.message || 'حدث خطأ أثناء تحميل الجهات الطالبة';
        }

        this.loading = false;
      },
      error: (err: any) => {
        console.error('RequestingEntity GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل الجهات الطالبة';

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
      this.errorMessage = 'من فضلك أدخلي اسم الجهة';
      return;
    }

    if (this.isEditMode && this.selectedEntityId) {
      this.updateEntity(this.selectedEntityId, { code, name });
      return;
    }

    this.createEntity({ code, name });
  }

  createEntity(payload: CreateRequestingEntityRequest): void {
    this.saving = true;

    this.requestingEntityService.create(payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم إنشاء الجهة الطالبة بنجاح';
          this.resetForm();
          this.loadEntities();
        } else {
          this.errorMessage =
            res?.message ||
            'لم يتم إنشاء الجهة. ربما يكون كود الجهة موجود بالفعل';
        }

        this.saving = false;
      },
      error: (err: any) => {
        console.error('RequestingEntity POST error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'لم يتم إنشاء الجهة. ربما يكون كود الجهة موجود بالفعل';

        this.saving = false;
      }
    });
  }

  editEntity(item: RequestingEntity): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.selectedEntityId = item.id;
    this.loadingDetailsId = item.id;

    this.requestingEntityService.getById(item.id).subscribe({
      next: (res: ApiResponse<RequestingEntity>) => {
        if (res?.isSuccess && res.data) {
          this.isEditMode = true;
          this.selectedEntityId = res.data.id;

          this.formModel = {
            code: Number(res.data.code || 0),
            name: res.data.name || ''
          };
        } else {
          this.errorMessage = res?.message || 'تعذر تحميل بيانات الجهة';
        }

        this.loadingDetailsId = null;
      },
      error: (err: any) => {
        console.error('RequestingEntity GET BY ID error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'تعذر تحميل بيانات الجهة';

        this.loadingDetailsId = null;
      }
    });
  }

  updateEntity(id: string, payload: UpdateRequestingEntityRequest): void {
    this.saving = true;

    this.requestingEntityService.update(id, payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم تعديل الجهة بنجاح';
          this.resetForm();
          this.loadEntities();
        } else {
          this.errorMessage =
            res?.message ||
            'لم يتم تعديل الجهة. ربما يكون كود الجهة موجود بالفعل';
        }

        this.saving = false;
      },
      error: (err: any) => {
        console.error('RequestingEntity PUT error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'لم يتم تعديل الجهة. ربما يكون كود الجهة موجود بالفعل';

        this.saving = false;
      }
    });
  }

  deleteEntity(item: RequestingEntity): void {
    const confirmed = confirm(`هل تريدين حذف الجهة "${item.name}"؟`);
    if (!confirmed) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.deletingId = item.id;

    this.requestingEntityService.delete(item.id).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم حذف الجهة بنجاح';

          if (this.selectedEntityId === item.id) {
            this.resetForm();
          }

          this.loadEntities();
        } else {
          this.errorMessage = res?.message || 'حدث خطأ أثناء حذف الجهة';
        }

        this.deletingId = null;
      },
      error: (err: any) => {
        console.error('RequestingEntity DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حذف الجهة';

        this.deletingId = null;
      }
    });
  }

  resetForm(): void {
    this.formModel = {
      code: 0,
      name: ''
    };

    this.selectedEntityId = null;
    this.isEditMode = false;
    this.saving = false;
    this.loadingDetailsId = null;
  }

  get filteredEntities(): RequestingEntity[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.entities;
    }

    return this.entities.filter(item => {
      const id = String(item.id || '').toLowerCase();
      const code = String(item.code || '').toLowerCase();
      const name = String(item.name || '').toLowerCase();

      return id.includes(term) || code.includes(term) || name.includes(term);
    });
  }

  trackById(_: number, item: RequestingEntity): string {
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