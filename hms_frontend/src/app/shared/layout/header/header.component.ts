import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../core/services/token.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isAuthenticated = signal(false);
  username = signal('');

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated.set(this.tokenService.isAuthenticated());
    const user = this.tokenService.getUser();
    if (user) {
      this.username.set(user.username);
    }
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.isAuthenticated.set(false);
    this.username.set('');
    this.router.navigate(['/login']);
  }
}
