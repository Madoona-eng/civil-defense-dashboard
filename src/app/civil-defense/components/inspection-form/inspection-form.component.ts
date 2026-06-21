import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CivilDefenseInspection,
  CivilDefenseRequest,
  EMPTY_INSPECTION,
  INSPECTION_RESULT_LABELS,
  InspectionResult
} from '../../models/civil-defense-request.model';

@Component({
  selector: 'app-civil-defense-inspection-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inspection-form.component.html',
  styleUrls: ['./inspection-form.component.scss']
})
export class InspectionFormComponent implements OnChanges {
  @Input() request: CivilDefenseRequest | null = null;

  @Output() saved = new EventEmitter<{ requestId: string; inspection: CivilDefenseInspection }>();
  @Output() closed = new EventEmitter<void>();

  readonly resultOptions: InspectionResult[] = ['', 'COMPLIANT', 'NEEDS_COMPLETION', 'REJECTED'];
  readonly resultLabels = INSPECTION_RESULT_LABELS;

  readonly form = this.fb.nonNullable.group({
    scheduledDate: [''],
    inspectionDate: [''],
    inspectorName: ['', Validators.required],
    hasFireExtinguishers: [false],
    hasEmergencyExits: [false],
    hasFireAlarm: [false],
    hasFireNetwork: [false],
    hasVentilation: [false],
    notes: [''],
    recommendations: [''],
    requiredActions: [''],
    nextInspectionDate: [''],
    reportFile: [''],
    result: ['' as InspectionResult]
  });

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['request']) {
      this.fillForm();
    }
  }

  save(): void {
    if (!this.request) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const inspection: CivilDefenseInspection = {
      scheduledDate: value.scheduledDate,
      inspectionDate: value.inspectionDate,
      inspectorName: value.inspectorName.trim(),
      hasFireExtinguishers: value.hasFireExtinguishers,
      hasEmergencyExits: value.hasEmergencyExits,
      hasFireAlarm: value.hasFireAlarm,
      hasFireNetwork: value.hasFireNetwork,
      hasVentilation: value.hasVentilation,
      notes: value.notes.trim(),
      recommendations: value.recommendations.trim(),
      requiredActions: value.requiredActions.trim(),
      nextInspectionDate: value.nextInspectionDate,
      reportFile: value.reportFile,
      result: value.result
    };

    this.saved.emit({ requestId: this.request.id, inspection });
  }

  close(): void {
    this.closed.emit();
  }

  onReportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.form.controls.reportFile.setValue(file.name);
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return Boolean(control?.invalid && control.touched);
  }

  private fillForm(): void {
    const inspection = this.request?.inspection ?? EMPTY_INSPECTION;

    this.form.reset({
      scheduledDate: inspection.scheduledDate ?? '',
      inspectionDate: inspection.inspectionDate ?? '',
      inspectorName: inspection.inspectorName ?? '',
      hasFireExtinguishers: inspection.hasFireExtinguishers,
      hasEmergencyExits: inspection.hasEmergencyExits,
      hasFireAlarm: inspection.hasFireAlarm,
      hasFireNetwork: inspection.hasFireNetwork,
      hasVentilation: inspection.hasVentilation,
      notes: inspection.notes ?? '',
      recommendations: inspection.recommendations ?? '',
      requiredActions: inspection.requiredActions ?? '',
      nextInspectionDate: inspection.nextInspectionDate ?? '',
      reportFile: inspection.reportFile ?? '',
      result: inspection.result
    });
  }
}
