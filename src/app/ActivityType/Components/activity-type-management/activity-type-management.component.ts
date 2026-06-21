import { Component, ViewChild } from '@angular/core';
import { ListComponent } from '../list/list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-type-management',

  templateUrl: './activity-type-management.component.html',
  styleUrl: './activity-type-management.component.scss'
})
export class ActivityTypeManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  selectedActivityTypeId: string | null = null;
  isAddModalOpen = false;

  constructor(private readonly router: Router) {}

  openAddModal(): void {
    this.selectedActivityTypeId = null;
    this.isAddModalOpen = true;
  }

  onEditActivityType(id: string): void {
    this.selectedActivityTypeId = id;
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.selectedActivityTypeId = null;
  }

  onFormSaved(): void {
    this.closeAddModal();
    this.listComponent?.loadActivityTypes();
  }

  onListChanged(): void {
    this.selectedActivityTypeId = null;
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

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }}