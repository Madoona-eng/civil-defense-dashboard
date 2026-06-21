import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { ActivityTypeManagementComponent } from './Components/activity-type-management/activity-type-management.component';


const routes: Routes = [
  {
    path: '',
    component: ActivityTypeManagementComponent
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityTypeRouteModule { }
