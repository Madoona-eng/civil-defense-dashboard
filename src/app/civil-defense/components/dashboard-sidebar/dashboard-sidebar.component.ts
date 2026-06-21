import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

type SidebarAction =
  | 'create'
  | 'all'
  | 'new'
  | 'inspection'
  | 'approvals'
  | 'archive';

interface SidebarItem {
  label: string;
  icon: string;
  action: SidebarAction;
  status?: string;
}

@Component({
  selector: 'app-civil-defense-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent {
  @Input() selectedStatus: string = 'ALL';

  @Input() userName: string = '';
  @Input() userRole: string = '';

  @Input() totalRequests = 0;
  @Input() newRequests = 0;
  @Input() inspectionRequests = 0;
  @Input() finalApprovalRequests = 0;

  @Output() statusSelected = new EventEmitter<string>();
  @Output() createRequest = new EventEmitter<void>();
  @Output() openInspection = new EventEmitter<void>();
  @Output() openApprovals = new EventEmitter<void>();
  @Output() openArchive = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();
  @Output() manageDistricts = new EventEmitter<void>();

  constructor(private readonly router: Router) {}

  mainItems: SidebarItem[] = [
    {
      label: 'إضافة طلب جديد',
      icon: '➕',
      action: 'create'
    },
    {
      label: 'كل الطلبات',
      icon: '📋',
      action: 'all',
      status: 'ALL'
    },
    {
      label: 'طلبات جديدة',
      icon: '🆕',
      action: 'new',
      status: 'NEW'
    },
    {
      label: 'إجراء المعاينة',
      icon: '🔍',
      action: 'inspection',
      status: 'INSPECTION_SCHEDULED'
    },
    {
      label: 'الموافقات النهائية',
      icon: '✅',
      action: 'approvals',
      status: 'COMPLIANT'
    },
    {
      label: 'الأرشيف',
      icon: '🗂️',
      action: 'archive',
      status: 'ARCHIVED'
    }
  ];

  onItemClick(item: SidebarItem): void {
    if (item.action === 'create') {
      this.createRequest.emit();
      return;
    }

    if (item.action === 'inspection') {
      this.openInspection.emit();
      return;
    }

    if (item.action === 'approvals') {
      this.openApprovals.emit();
      return;
    }

    if (item.action === 'archive') {
      this.openArchive.emit();
      return;
    }

    if (item.status) {
      this.statusSelected.emit(item.status);
    }
  }

  isActive(item: SidebarItem): boolean {
    return !!item.status && this.selectedStatus === item.status;
  }

  openActivityTypes(): void {
    this.router.navigateByUrl('/civil-defense/activity-types');
  }

  goToRequestingEntities(): void {
    this.router.navigateByUrl('/civil-defense/requesting-entities');
  }

  onLogout(): void {
    this.logoutRequested.emit();
  }
goToDistricts(): void {
  this.router.navigateByUrl('/civil-defense/districts');
}
  trackByLabel(_: number, item: SidebarItem): string {
    return item.label;
  }
}