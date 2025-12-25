import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './shared/layout/public-layout/public-layout.component';
import { AdminLayoutComponent } from './shared/layouts/admin-layout/admin-layout.component';
import { StaffLayoutComponent } from './shared/layouts/staff-layout/staff-layout.component';
import { ManagerLayoutComponent } from './shared/layouts/manager-layout/manager-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'room-types/:id',
        loadComponent: () => import('./pages/room-detail/room-detail.component').then(m => m.RoomDetailComponent)
      },
      {
        path: 'my-reservations',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/my-reservations/my-reservations.component').then(m => m.MyReservationsComponent)
      }
    ]
  },
  // Admin routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      }
    ]
  },
  // Staff routes
  {
    path: 'staff',
    component: StaffLayoutComponent,
    canActivate: [authGuard, roleGuard(['STAFF'])],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/staff/staff-dashboard.component').then(m => m.StaffDashboardComponent)
      }
    ]
  },
  // Manager routes
  {
    path: 'manager',
    component: ManagerLayoutComponent,
    canActivate: [authGuard, roleGuard(['MANAGER'])],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/manager/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      }
    ]
  },
  // Fallback route
  {
    path: '**',
    redirectTo: ''
  }
];

