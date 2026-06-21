import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ActivityTypeService } from '../../services/activity-type.service';
import { ActivityType } from '../../models/activity-type.model';

import { DistrictService } from '../../services/district.service';
import { District } from '../../models/district.model';

import { RequestingEntityService } from '../../services/requesting-entity.service';
import { RequestingEntity } from '../../models/requesting-entity.model';

import { LicensingProcessService } from '../../services/licensing-process.service';

@Component({
  selector: 'app-civil-defense-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent implements OnInit, OnChanges {
  @Input() requestToEdit: any | null = null;

  // خليتها any[] عشان لو الصفحة الأب لسه باعتة string[] مايحصلش error
  @Input() activityTypes: any[] = [];

  @Input() hazardLevels: any[] = [];

  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  activityTypesLoading = false;
  activityTypesError = '';

  districts: District[] = [];
  districtsLoading = false;
  districtsError = '';

  requestingEntities: RequestingEntity[] = [];
  requestingEntitiesLoading = false;
  requestingEntitiesError = '';

  saving = false;
  successMessage = '';
  errorMessage = '';
  submitted = false;

  selectedFiles: Record<string, File[]> = {};

  applicantRoles: string[] = [
    'Owner',
    'Tenant',
    'Agent',
    'Manager',
    'LegalRepresentative'
  ];

  defaultHazardLevels: string[] = [
    'منخفضة',
    'متوسطة',
    'مرتفعة'
  ];

  formModel: any = {
    governorateCode: 28,
    transactionCode: '',

    requestDate: '',
    incomingDate: '',

    requestingEntityId: '',
    requestingEntity: '',

    districtId: '',
    center: '',

    activityTypeId: '',
    activityCode: null,
    activityType: '',

    licenseNumber: '',

    applicantName: '',
    applicantRole: 'Owner',
    nationalId: '',
    responsibleManager: '',
    mobile: '',
    applicantAddress: '',

    facilityName: '',
    facilityAddress: '',
    area: null,
    floorsCount: null,
    workNature: '',
    hazardLevel: '',

    requestLetterFile: '',
    nationalIdFile: '',
    ownershipContractFile: '',
    engineeringDrawingFile: '',
    siteSketchFile: '',
    commercialRegisterFile: '',
    taxCardFile: '',
    photosFile: '',
    otherFile: '',

    notes: ''
  };

  constructor(
    private readonly activityTypeService: ActivityTypeService,
    private readonly districtService: DistrictService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly licensingProcessService: LicensingProcessService
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();

    if (!this.activityTypes || this.activityTypes.length === 0) {
      this.loadActivityTypes();
    }

    this.loadDistricts();
    this.loadRequestingEntities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['requestToEdit'] && this.requestToEdit) {
      this.patchFormForEdit(this.requestToEdit);
    }
  }

  loadActivityTypes(): void {
    this.activityTypesLoading = true;
    this.activityTypesError = '';

    this.activityTypeService.getAll().subscribe({
      next: (res) => {
        console.log('ACTIVITY TYPES FROM BACKEND:', res);

        this.activityTypes = Array.isArray(res) ? res : [];
        this.activityTypesLoading = false;
      },
      error: (err) => {
        console.error('ACTIVITY TYPES ERROR:', err);

        this.activityTypesError = 'حدث خطأ أثناء تحميل أنواع النشاط';
        this.activityTypesLoading = false;
      }
    });
  }

  loadDistricts(): void {
    this.districtsLoading = true;
    this.districtsError = '';

    this.districtService.getAll().subscribe({
      next: (res) => {
        console.log('DISTRICTS FROM BACKEND:', res);

        this.districts = Array.isArray(res) ? res : [];
        this.districtsLoading = false;
      },
      error: (err) => {
        console.error('DISTRICTS ERROR:', err);

        this.districtsError = 'حدث خطأ أثناء تحميل المراكز';
        this.districtsLoading = false;
      }
    });
  }

  loadRequestingEntities(): void {
    this.requestingEntitiesLoading = true;
    this.requestingEntitiesError = '';

    this.requestingEntityService.getAll().subscribe({
      next: (res) => {
        console.log('REQUESTING ENTITIES FROM BACKEND:', res);

        this.requestingEntities = Array.isArray(res) ? res : [];
        this.requestingEntitiesLoading = false;
      },
      error: (err) => {
        console.error('REQUESTING ENTITIES ERROR:', err);

        this.requestingEntitiesError = 'حدث خطأ أثناء تحميل جهات الطلب';
        this.requestingEntitiesLoading = false;
      }
    });
  }

  onActivityTypeChange(): void {
    const selected = this.activeActivityTypes.find(
      item => String(item.id) === String(this.formModel.activityTypeId)
    );

    this.formModel.activityType = selected?.name || '';
    this.formModel.activityCode = selected?.code ?? null;
  }

  onDistrictChange(): void {
    const selected = this.activeDistricts.find(
      item => String(item.id) === String(this.formModel.districtId)
    );

    this.formModel.center = selected?.name || '';
  }

  onRequestingEntityChange(): void {
    const selected = this.activeRequestingEntities.find(
      item => String(item.id) === String(this.formModel.requestingEntityId)
    );

    this.formModel.requestingEntity = selected?.name || '';
  }

  onFileSelected(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    this.selectedFiles[fieldName] = files;
    this.formModel[fieldName] = files.map(file => file.name).join(', ');
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formModel.requestDate) {
      this.errorMessage = 'تاريخ الطلب مطلوب';
      return;
    }

    if (!this.formModel.requestingEntityId) {
      this.errorMessage = 'جهة الطلب مطلوبة';
      return;
    }

    if (!this.formModel.facilityName?.trim()) {
      this.errorMessage = 'اسم المنشأة مطلوب';
      return;
    }

    if (!this.formModel.facilityAddress?.trim()) {
      this.errorMessage = 'عنوان المنشأة مطلوب';
      return;
    }

    if (!this.formModel.districtId) {
      this.errorMessage = 'المركز مطلوب';
      return;
    }

    if (!this.formModel.activityTypeId) {
      this.errorMessage = 'نوع النشاط مطلوب';
      return;
    }

    if (!this.formModel.applicantName?.trim()) {
      this.errorMessage = 'اسم صاحب الطلب مطلوب';
      return;
    }

    this.saving = true;

    const payload = {
      submissionDate: this.formModel.requestDate,
      requestingEntityId: this.formModel.requestingEntityId,
      establishmentName: this.formModel.facilityName,
      establishmentAddress: this.formModel.facilityAddress,
      districtId: this.formModel.districtId,
      activityTypeId: this.formModel.activityTypeId,
      applicantName: this.formModel.applicantName,
      applicantRole: this.formModel.applicantRole || 'Owner',
      nationalId: this.formModel.nationalId || '',
      responsibleManager: this.formModel.responsibleManager || '',
      phone: this.formModel.mobile || '',

      entityLetters: this.getFilesByFields(['requestLetterFile']),

      proofDocuments: this.getFilesByFields([
        'nationalIdFile',
        'ownershipContractFile',
        'commercialRegisterFile',
        'taxCardFile'
      ]),

      engineeringReports: this.getFilesByFields([
        'engineeringDrawingFile',
        'siteSketchFile'
      ]),

      otherAttachments: this.getFilesByFields([
        'photosFile',
        'otherFile'
      ])
    };

    console.log('CREATE LICENSING PROCESS PAYLOAD:', payload);

    this.licensingProcessService.create(payload).subscribe({
      next: (res) => {
        console.log('CREATE LICENSING PROCESS RESPONSE:', res);

        if (res?.isSuccess) {
          this.successMessage = res.message || 'تم حفظ الطلب بنجاح';

          const localPayload = {
            ...this.formModel,
            id: this.requestToEdit?.id ?? undefined,
            activityCode: String(this.formModel.activityCode ?? ''),
            activityType: this.formModel.activityType,
            center: this.formModel.center,
            districtId: this.formModel.districtId,
            requestingEntity: this.formModel.requestingEntity,
            requestingEntityId: this.formModel.requestingEntityId,
            area: Number(this.formModel.area || 0),
            floorsCount: Number(this.formModel.floorsCount || 0)
          };

          this.saved.emit(localPayload);
        } else {
          this.errorMessage = res?.message || 'حدث خطأ أثناء حفظ الطلب';
        }

        this.saving = false;
      },
      error: (err) => {
        console.error('CREATE LICENSING PROCESS ERROR:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          'حدث خطأ أثناء حفظ الطلب';

        this.saving = false;
      }
    });
  }

  cancelEdit(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  resetForm(): void {
    this.requestToEdit = null;
    this.selectedFiles = {};
    this.submitted = false;

    this.formModel = {
      governorateCode: 28,
      transactionCode: '',

      requestDate: this.getTodayDate(),
      incomingDate: this.getTodayDate(),

      requestingEntityId: '',
      requestingEntity: '',

      districtId: '',
      center: '',

      activityTypeId: '',
      activityCode: null,
      activityType: '',

      licenseNumber: '',

      applicantName: '',
      applicantRole: 'Owner',
      nationalId: '',
      responsibleManager: '',
      mobile: '',
      applicantAddress: '',

      facilityName: '',
      facilityAddress: '',
      area: null,
      floorsCount: null,
      workNature: '',
      hazardLevel: '',

      requestLetterFile: '',
      nationalIdFile: '',
      ownershipContractFile: '',
      engineeringDrawingFile: '',
      siteSketchFile: '',
      commercialRegisterFile: '',
      taxCardFile: '',
      photosFile: '',
      otherFile: '',

      notes: ''
    };

    this.errorMessage = '';
    this.successMessage = '';
  }

  isInvalid(fieldName: string): boolean {
    if (!this.submitted) {
      return false;
    }

    const value = this.formModel[fieldName];
    return value === null || value === undefined || value === '';
  }

  get activeActivityTypes(): ActivityType[] {
    if (!Array.isArray(this.activityTypes)) {
      return [];
    }

    return this.activityTypes
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        id: String(item.id ?? item.Id ?? ''),
        code: Number(item.code ?? item.Code ?? 0),
        name: String(item.name ?? item.Name ?? '')
      }))
      .filter(item => !!item.id);
  }

  get activeDistricts(): District[] {
    if (!Array.isArray(this.districts)) {
      return [];
    }

    return this.districts
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        id: String((item as any).id ?? (item as any).Id ?? ''),
        name: String((item as any).name ?? (item as any).Name ?? '')
      }))
      .filter(item => !!item.id);
  }

  get activeRequestingEntities(): RequestingEntity[] {
    if (!Array.isArray(this.requestingEntities)) {
      return [];
    }

    return this.requestingEntities
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        id: String((item as any).id ?? (item as any).Id ?? ''),
        name: String((item as any).name ?? (item as any).Name ?? '')
      }))
      .filter(item => !!item.id);
  }

  get activeHazardLevels(): any[] {
    return this.hazardLevels && this.hazardLevels.length > 0
      ? this.hazardLevels
      : this.defaultHazardLevels;
  }

  trackByActivityTypeId(_: number, item: ActivityType): string {
    return String(item.id);
  }

  trackByDistrictId(_: number, item: District): string {
    return String(item.id);
  }

  trackByRequestingEntityId(_: number, item: RequestingEntity): string {
    return String(item.id);
  }

  private getFilesByFields(fields: string[]): File[] {
    return fields.flatMap(field => this.selectedFiles[field] || []);
  }

  private patchFormForEdit(item: any): void {
    this.formModel = {
      ...this.formModel,
      ...item
    };
  }

  private setDefaultDates(): void {
    const today = this.getTodayDate();

    if (!this.formModel.requestDate) {
      this.formModel.requestDate = today;
    }

    if (!this.formModel.incomingDate) {
      this.formModel.incomingDate = today;
    }
  }

  private getTodayDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}