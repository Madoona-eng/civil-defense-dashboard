import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivityTypeRouteModule } from './activity-type-route.module';
import { DashboardSidebarComponent } from '../civil-defense/components/dashboard-sidebar/dashboard-sidebar.component';
import { ListComponent } from './Components/list/list.component';
import { AddComponent } from './Components/add/add.component';
import { ActivityTypeManagementComponent } from './Components/activity-type-management/activity-type-management.component';
import { DeleteComponent } from './Components/delete/delete.component';


@NgModule({
  declarations: [ListComponent,AddComponent,ActivityTypeManagementComponent,DeleteComponent],
  imports: [
    CommonModule , HttpClientModule,ActivityTypeRouteModule,CommonModule,
        FormsModule,
        DashboardSidebarComponent
     
  ],  
  exports : [ListComponent],
  
})
export class ActivityTypeModule { }
