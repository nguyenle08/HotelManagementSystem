import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TokenService } from '../services/token.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const tokenService = inject(TokenService);
    const router = inject(Router);

    const userRole = tokenService.getUserRole();

    if (!userRole) {
      router.navigate(['/login']);
      return false;
    }

    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Redirect based on role
    switch (userRole) {
      case 'ADMIN':
        router.navigate(['/admin']);
        break;
      case 'STAFF':
        router.navigate(['/staff']);
        break;
      case 'MANAGER':
        router.navigate(['/manager']);
        break;
      default:
        router.navigate(['/']);
        break;
    }

    return false;
  };
};
