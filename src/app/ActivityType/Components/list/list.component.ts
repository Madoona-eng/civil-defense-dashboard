import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivityType, ApiResponse, CreateActivityTypeRequest, UpdateActivityTypeRequest } from '../../Models/activity-type.model';
import { ActivityTypeService } from '../../Services/activity-type.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',

  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Output() editRequested = new EventEmitter<string>();
  @Output() changed = new EventEmitter<void>();

  activityTypes: ActivityType[] = [];

  loading = false;
  deletingId: string | null = null;

  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  isDeleteModalOpen = false;
  selectedDeleteItem: ActivityType | null = null;

  constructor(private readonly activityTypeService: ActivityTypeService) {}

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

  editActivityType(item: ActivityType): void {
    this.editRequested.emit(item.id);
  }

  openDeleteModal(item: ActivityType): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedDeleteItem = item;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    if (this.deletingId) return;

    this.selectedDeleteItem = null;
    this.isDeleteModalOpen = false;
  }

  confirmDeleteActivityType(item: ActivityType): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.deletingId = item.id;

    this.activityTypeService.delete(item.id).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم حذف نوع النشاط بنجاح';
          this.closeDeleteAfterSuccess();
          this.loadActivityTypes();
          this.changed.emit();
        } else {
          this.errorMessage = res?.message || 'حدث خطأ أثناء حذف نوع النشاط';
          this.deletingId = null;
        }
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

  private closeDeleteAfterSuccess(): void {
    this.deletingId = null;
    this.selectedDeleteItem = null;
    this.isDeleteModalOpen = false;
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
}