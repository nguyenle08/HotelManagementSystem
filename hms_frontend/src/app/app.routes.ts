import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './shared/layout/public-layout/public-layout.component';
import { AdminLayoutComponent } from './shared/layout-admin/admin-layout/admin-layout.component';
import { StaffLayoutComponent } from './shared/layout-staff/staff-layout/staff-layout.component';
import { ManagerLayoutComponent } from './shared/layout-manager/manager-layout/manager-layout.component';
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
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'room-types/:id',
        loadComponent: () =>
          import('./pages/room-detail/room-detail.component').then(
            (m) => m.RoomDetailComponent
          ),
      },
      {
        path: 'my-reservations',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/my-reservations/my-reservations.component').then(
            (m) => m.MyReservationsComponent
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'reservation-detail/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './pages/reservation-detail/reservation-detail.component'
          ).then((m) => m.ReservationDetailComponent),
      },
    ],
  },
  // Admin routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    // canActivate: [authGuard, roleGuard(['ADMIN'])], // Tạm comment để test
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
    ],
  },
  // Staff routes
  {
    path: 'staff',
    component: StaffLayoutComponent,
    // canActivate: [authGuard, roleGuard(['STAFF'])],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './pages/staff/staff-dashboard/staff-dashboard.component'
          ).then((m) => m.StaffDashboardComponent),
      },
      {
        path: 'status',
        loadComponent: () =>
          import(
            './pages/staff/staff-status-reservation/staff-status-reservation.component'
          ).then((m) => m.StaffStatusReservationComponent),
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import(
            './pages/staff/staff-reservation-list/staff-reservation-list.component'
          ).then((m) => m.StaffReservationListComponent),
      },
      {
        path: 'checkin',
        loadComponent: () =>
          import('./pages/staff/staff-checkin/staff-checkin.component').then(
            (m) => m.StaffCheckinComponent
          ),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./pages/staff/staff-checkout/staff-checkout.component').then(
            (m) => m.StaffCheckoutComponent
          ),
      },
    ],
  },
  // Manager routes
  {
    path: 'manager',
    component: ManagerLayoutComponent,
    // canActivate: [authGuard, roleGuard(['MANAGER'])],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/manager/manager-dashboard/manager-dashboard.component').then(
            (m) => m.ManagerDashboardComponent
          ),
      },
      {
        path: 'room-types',
        loadComponent: () =>
          import('./pages/manager/manager-room-type/manager-room-type.component').then(
            (m) => m.ManagerRoomTypeComponent
          ),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./pages/manager/manager-room/manager-room.component').then(
            (m) => m.ManagerRoomComponent
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/manager/manager-report/manager-report.component').then(
            (m) => m.ManagerReportComponent
          ),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./pages/manager/employee-management/employee-management.component')
            .then((m) => m.EmployeeManagementComponent),
      }
    ],
  },
  // Fallback route
  {
    path: '**',
    redirectTo: '',
  },
];
