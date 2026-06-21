import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-civil-defense-dashboard-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent {
  @Input() title = 'لوحة تحكم الحماية المدنية';
  @Input() subtitle = 'متابعة الطلبات والمعاينات والموافقات النهائية';
  @Input() searchTerm = '';
  @Input() selectedStatusLabel = 'كل الطلبات';
  @Input() resultCount = 0;
  @Input() userName = '';
  @Input() userRole = '';

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() createRequest = new EventEmitter<void>();
  @Output() refreshRequested = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
  }
}