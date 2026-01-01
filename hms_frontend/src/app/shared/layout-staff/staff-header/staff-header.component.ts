import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  HostListener,
  ElementRef,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-staff-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './staff-header.component.html',
  styleUrl: './staff-header.component.css',
})
export class StaffHeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: any = null;
  showUserDropdown = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUser = {
        username: user.username,
        fullName: user.fullname || user.username,
        role: user.role,
      };
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showUserDropdown = false;
    }
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  goToDashboard() {
    this.router.navigate(['/staff/dashboard']);
  }

  goToHome() {
    this.router.navigate(['/']);
    this.showUserDropdown = false;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.showUserDropdown = false;
  }

  logout() {
    this.authService.logout();
  }
}
