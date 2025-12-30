import { Component, OnInit, signal, computed, effect, HostListener, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../core/services/token.service';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isAuthenticated = computed(() => this.authService.currentUser() !== null);
  username = computed(() => this.authService.currentUser()?.fullname || this.authService.currentUser()?.username || '');
  userRole = computed(() => this.authService.currentUser()?.role || '');
  showUserDropdown = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showUserDropdown = false;
    }
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  goToDashboard() {
    const role = this.userRole();
    switch(role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'STAFF':
        this.router.navigate(['/staff/dashboard']);
        break;
      case 'MANAGER':
        this.router.navigate(['/manager/dashboard']);
        break;
      default:
        this.router.navigate(['/my-reservations']);
    }
    this.showUserDropdown = false;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.showUserDropdown = false;
  }

  logout(): void {
    this.authService.logout();
    this.showUserDropdown = false;
  }
}
