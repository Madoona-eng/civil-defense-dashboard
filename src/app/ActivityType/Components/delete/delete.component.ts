import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivityType } from '../../Models/activity-type.model';

@Component({
  selector: 'app-delete',

  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {


 @Input() item: ActivityType | null = null;
  @Input() deleting = false;

  @Output() confirmed = new EventEmitter<ActivityType>();
  @Output() cancelled = new EventEmitter<void>();

  confirmDelete(): void {
    if (!this.item || this.deleting) return;
    this.confirmed.emit(this.item);
  }

  close(): void {
    if (this.deleting) return;
    this.cancelled.emit();
  }

}
