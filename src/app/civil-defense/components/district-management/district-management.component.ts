import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';

import {
  ApiResponse,
  CreateDistrictRequest,
  District,
  UpdateDistrictRequest
} from '../../models/district.model';

import { DistrictService } from '../../services/district.service';

@Component({
  selector: 'app-district-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardSidebarComponent
  ],
  templateUrl: './district-management.component.html',
  styleUrls: ['./district-management.component.scss']
})
export class DistrictManagementComponent implements OnInit {
  districts: District[] = [];

  loading = false;
  saving = false;
  deletingId: string | null = null;
  loadingDetailsId: string | null = null;

  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  selectedDistrictId: string | null = null;
  isEditMode = false;

  formModel: CreateDistrictRequest = {
    code: 0,
    name: ''
  };

  constructor(
    private readonly districtService: DistrictService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadDistricts();
  }

  loadDistricts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.districtService.getAll().subscribe({
      next: (res: ApiResponse<District[]>) => {
        if (res?.isSuccess) {
          this.districts = res.data || [];
        } else {
          this.errorMessage = res?.message || 'حدث خطأ أثناء تحميل المراكز';
        }

        this.loading = false;
      },
      error: (err: any) => {
        console.error('District GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل المراكز';

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
      this.errorMessage = 'من فضلك أدخلي اسم المركز';
      return;
    }

    if (this.isEditMode && this.selectedDistrictId) {
      this.updateDistrict(this.selectedDistrictId, { code, name });
      return;
    }

    this.createDistrict({ code, name });
  }

  createDistrict(payload: CreateDistrictRequest): void {
    this.saving = true;

    this.districtService.create(payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم إنشاء المركز بنجاح';
          this.resetForm();
          this.loadDistricts();
        } else {
          this.errorMessage =
            res?.message ||
            'لم يتم إنشاء المركز. ربما يكون الكود موجود بالفعل';
        }

        this.saving = false;
      },
      error: (err: any) => {
        console.error('District POST error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'لم يتم إنشاء المركز. ربما يكون الكود موجود بالفعل';

        this.saving = false;
      }
    });
  }

  editDistrict(item: District): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.selectedDistrictId = item.id;
    this.loadingDetailsId = item.id;

    this.districtService.getById(item.id).subscribe({
      next: (res: ApiResponse<District>) => {
        if (res?.isSuccess && res.data) {
          this.isEditMode = true;
          this.selectedDistrictId = res.data.id;

          this.formModel = {
            code: Number(res.data.code || 0),
            name: res.data.name || ''
          };
        } else {
          this.errorMessage = res?.message || 'تعذر تحميل بيانات المركز';
        }

        this.loadingDetailsId = null;
      },
      error: (err: any) => {
        console.error('District GET BY ID error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'تعذر تحميل بيانات المركز';

        this.loadingDetailsId = null;
      }
    });
  }

  updateDistrict(id: string, payload: UpdateDistrictRequest): void {
    this.saving = true;

    this.districtService.update(id, payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم تعديل المركز بنجاح';
          this.resetForm();
          this.loadDistricts();
        } else {
          this.errorMessage =
            res?.message ||
            'لم يتم تعديل المركز. ربما يكون الكود موجود بالفعل';
        }

        this.saving = false;
      },
      error: (err: any) => {
        console.error('District PUT error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'لم يتم تعديل المركز. ربما يكون الكود موجود بالفعل';

        this.saving = false;
      }
    });
  }

  deleteDistrict(item: District): void {
    const confirmed = confirm(`هل تريدين حذف المركز "${item.name}"؟`);
    if (!confirmed) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.deletingId = item.id;

    this.districtService.delete(item.id).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم حذف المركز بنجاح';

          if (this.selectedDistrictId === item.id) {
            this.resetForm();
          }

          this.loadDistricts();
        } else {
          this.errorMessage = res?.message || 'حدث خطأ أثناء حذف المركز';
        }

        this.deletingId = null;
      },
      error: (err: any) => {
        console.error('District DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حذف المركز';

        this.deletingId = null;
      }
    });
  }

  resetForm(): void {
    this.formModel = {
      code: 0,
      name: ''
    };

    this.selectedDistrictId = null;
    this.isEditMode = false;
    this.saving = false;
    this.loadingDetailsId = null;
  }

  get filteredDistricts(): District[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.districts;
    }

    return this.districts.filter(item => {
      const id = String(item.id || '').toLowerCase();
      const code = String(item.code || '').toLowerCase();
      const name = String(item.name || '').toLowerCase();

      return id.includes(term) || code.includes(term) || name.includes(term);
    });
  }

  trackById(_: number, item: District): string {
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

  goToRequestingEntities(): void {
    this.router.navigateByUrl('/civil-defense/requesting-entities');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }
}