import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DistrictService } from '../../services/district.service';
import { District } from '../../models/district.model';

@Component({
  selector: 'app-district-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './district-management.component.html',
  styleUrls: ['./district-management.component.scss']
})
export class DistrictManagementComponent implements OnInit {
  districts: District[] = [];

  loading = false;
  saving = false;
  deleting = false;

  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  selectedDistrict: District | null = null;

  formModel = {
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
      next: (res: any) => {
        const data = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        this.districts = data.map((item: any) => this.mapDistrict(item));
        this.loading = false;
      },
      error: (err) => {
        console.error('LOAD DISTRICTS ERROR:', err);
        this.errorMessage = 'حدث خطأ أثناء تحميل المراكز';
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.selectedDistrict = null;
    this.showCreateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  openEditModal(item: District): void {
    this.selectedDistrict = item;

    this.formModel = {
      code: Number((item as any).code ?? 0),
      name: item.name
    };

    this.showEditModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedDistrict = null;
    this.resetForm();
  }

  openDeleteModal(item: District): void {
    this.selectedDistrict = item;
    this.showDeleteModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedDistrict = null;
  }

  createDistrict(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formModel.code || Number(this.formModel.code) <= 0) {
      this.errorMessage = 'من فضلك أدخلي كود المركز';
      return;
    }

    if (!this.formModel.name.trim()) {
      this.errorMessage = 'من فضلك أدخلي اسم المركز';
      return;
    }

    this.saving = true;

    const payload = {
      code: Number(this.formModel.code),
      name: this.formModel.name.trim()
    };

    this.districtService.create(payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess === false) {
          this.errorMessage = res?.message || 'حدث خطأ أثناء إضافة المركز';
        } else {
          this.successMessage = res?.message || 'تم إضافة المركز بنجاح';
          this.closeCreateModal();
          this.loadDistricts();
        }

        this.saving = false;
      },
      error: (err) => {
        console.error('CREATE DISTRICT ERROR:', err);
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          'حدث خطأ أثناء إضافة المركز';
        this.saving = false;
      }
    });
  }

  updateDistrict(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedDistrict) {
      this.errorMessage = 'لم يتم تحديد المركز المطلوب تعديله';
      return;
    }

    if (!this.formModel.code || Number(this.formModel.code) <= 0) {
      this.errorMessage = 'من فضلك أدخلي كود المركز';
      return;
    }

    if (!this.formModel.name.trim()) {
      this.errorMessage = 'من فضلك أدخلي اسم المركز';
      return;
    }

    this.saving = true;

    const payload = {
      code: Number(this.formModel.code),
      name: this.formModel.name.trim()
    };

    this.districtService.update(this.selectedDistrict.id, payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess === false) {
          this.errorMessage = res?.message || 'حدث خطأ أثناء تعديل المركز';
        } else {
          this.successMessage = res?.message || 'تم تعديل المركز بنجاح';
          this.closeEditModal();
          this.loadDistricts();
        }

        this.saving = false;
      },
      error: (err) => {
        console.error('UPDATE DISTRICT ERROR:', err);
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          'حدث خطأ أثناء تعديل المركز';
        this.saving = false;
      }
    });
  }

  confirmDeleteDistrict(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedDistrict) {
      this.errorMessage = 'لم يتم تحديد المركز المطلوب حذفه';
      return;
    }

    this.deleting = true;

    this.districtService.delete(this.selectedDistrict.id).subscribe({
      next: (res: any) => {
        if (res?.isSuccess === false) {
          this.errorMessage = res?.message || 'حدث خطأ أثناء حذف المركز';
        } else {
          this.successMessage = res?.message || 'تم حذف المركز بنجاح';
          this.closeDeleteModal();
          this.loadDistricts();
        }

        this.deleting = false;
      },
      error: (err) => {
        console.error('DELETE DISTRICT ERROR:', err);
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          'حدث خطأ أثناء حذف المركز';
        this.deleting = false;
      }
    });
  }

  resetForm(): void {
    this.formModel = {
      code: 0,
      name: ''
    };
  }

  goBack(): void {
    this.router.navigateByUrl('/civil-defense');
  }

  get filteredDistricts(): District[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.districts;
    }

    return this.districts.filter(item =>
      String((item as any).code ?? '').includes(term) ||
      item.name.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term)
    );
  }

  trackById(_: number, item: District): string {
    return item.id;
  }

  private mapDistrict(item: any): District {
    return {
      id: String(item?.id ?? item?.Id ?? ''),
      code: Number(item?.code ?? item?.Code ?? 0),
      name: String(item?.name ?? item?.Name ?? '')
    } as District;
  }
}