import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';

import {
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
  deleting = false;

  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  selectedEntity: RequestingEntity | null = null;

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
      next: (res: any) => {
        const data = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        this.entities = data.map((item: any) => this.mapEntity(item));
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

  openCreateModal(): void {
    this.resetForm();
    this.selectedEntity = null;
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  openEditModal(item: RequestingEntity): void {
    this.selectedEntity = item;

    this.formModel = {
      code: Number((item as any).code ?? 0),
      name: item.name || ''
    };

    this.showEditModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedEntity = null;
    this.resetForm();
  }

  openDeleteModal(item: RequestingEntity): void {
    this.selectedEntity = item;
    this.showDeleteModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedEntity = null;
  }

  createEntity(): void {
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

    this.saving = true;

    const payload: CreateRequestingEntityRequest = {
      code,
      name
    };

    this.requestingEntityService.create(payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess === false) {
          this.errorMessage =
            res?.message ||
            'لم يتم إنشاء الجهة. ربما يكون كود الجهة موجود بالفعل';
        } else {
          this.successMessage = res?.message || 'تم إنشاء الجهة الطالبة بنجاح';
          this.closeCreateModal();
          this.loadEntities();
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

  updateEntity(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedEntity) {
      this.errorMessage = 'لم يتم تحديد الجهة المطلوب تعديلها';
      return;
    }

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

    this.saving = true;

    const payload: UpdateRequestingEntityRequest = {
      code,
      name
    };

    this.requestingEntityService.update(this.selectedEntity.id, payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess === false) {
          this.errorMessage =
            res?.message ||
            'لم يتم تعديل الجهة. ربما يكون كود الجهة موجود بالفعل';
        } else {
          this.successMessage = res?.message || 'تم تعديل الجهة بنجاح';
          this.closeEditModal();
          this.loadEntities();
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

  confirmDeleteEntity(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedEntity) {
      this.errorMessage = 'لم يتم تحديد الجهة المطلوب حذفها';
      return;
    }

    this.deleting = true;

    this.requestingEntityService.delete(this.selectedEntity.id).subscribe({
      next: (res: any) => {
        if (res?.isSuccess === false) {
          this.errorMessage = res?.message || 'حدث خطأ أثناء حذف الجهة';
        } else {
          this.successMessage = res?.message || 'تم حذف الجهة بنجاح';
          this.closeDeleteModal();
          this.loadEntities();
        }

        this.deleting = false;
      },
      error: (err: any) => {
        console.error('RequestingEntity DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حذف الجهة';

        this.deleting = false;
      }
    });
  }

  resetForm(): void {
    this.formModel = {
      code: 0,
      name: ''
    };

    this.selectedEntity = null;
    this.saving = false;
  }

  get filteredEntities(): RequestingEntity[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.entities;
    }

    return this.entities.filter(item => {
      const id = String(item.id || '').toLowerCase();
      const code = String((item as any).code || '').toLowerCase();
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

  private mapEntity(item: any): RequestingEntity {
    return {
      id: String(item?.id ?? item?.Id ?? ''),
      code: Number(item?.code ?? item?.Code ?? 0),
      name: String(item?.name ?? item?.Name ?? '')
    } as RequestingEntity;
  }
}