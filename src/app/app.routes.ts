import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/components/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'civil-defense',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./civil-defense/components/civil-defense-page/civil-defense-page.component')
        .then(m => m.CivilDefensePageComponent)
  },
  {
    path: 'civil-defense/requesting-entities',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./civil-defense/components/requesting-entity-management/requesting-entity-management.component')
        .then(m => m.RequestingEntityPageComponent)
  },
  {
    path: 'civil-defense/activity-types',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./ActivityType/activity-type.module')
        .then(m => m.ActivityTypeModule)
  },
  {
    path: 'civil-defense/districts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./civil-defense/components/district-management/district-management.component')
        .then(m => m.DistrictManagementComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];