import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivityType, ApiResponse, CreateActivityTypeRequest, UpdateActivityTypeRequest } from '../../Models/activity-type.model';
import { ActivityTypeService } from '../../Services/activity-type.service';

@Component({
  selector: 'app-add',

  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent implements OnChanges {
  @Input() selectedActivityTypeId: string | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  saving = false;
  loadingDetails = false;

  errorMessage = '';
  successMessage = '';

  isEditMode = false;

  formModel: CreateActivityTypeRequest = {
    code: 0,
    name: ''
  };

  constructor(private readonly activityTypeService: ActivityTypeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedActivityTypeId']) {
      if (this.selectedActivityTypeId) {
        this.loadActivityTypeDetails(this.selectedActivityTypeId);
      } else {
        this.resetForm();
      }
    }
  }

  loadActivityTypeDetails(id: string): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loadingDetails = true;

    this.activityTypeService.getById(id).subscribe({
      next: (res: ApiResponse<ActivityType>) => {
        if (res?.isSuccess && res.data) {
          this.isEditMode = true;

          this.formModel = {
            code: Number(res.data.code || 0),
            name: res.data.name || ''
          };
        } else {
          this.errorMessage = res?.message || 'تعذر تحميل بيانات نوع النشاط';
        }

        this.loadingDetails = false;
      },
      error: (err: any) => {
        console.error('ActivityType GET BY ID error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'تعذر تحميل بيانات نوع النشاط';

        this.loadingDetails = false;
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
          this.saved.emit();
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

  updateActivityType(id: string, payload: UpdateActivityTypeRequest): void {
    this.saving = true;

    this.activityTypeService.update(id, payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم تعديل نوع النشاط بنجاح';
          this.resetForm();
          this.saved.emit();
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

  resetForm(): void {
    this.formModel = {
      code: 0,
      name: ''
    };

    this.isEditMode = false;
    this.saving = false;
    this.loadingDetails = false;
  }

  cancelEdit(): void {
    this.resetForm();
    this.cancelled.emit();
  }
}