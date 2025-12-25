import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = signal('');
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const values = this.registerForm.value;
    
    if (values.password !== values.confirmPassword) {
      this.errorMessage.set('Mật khẩu xác nhận không khớp');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const registerData = {
      username: values.username,
      email: values.email,
      phone: values.phone,
      password: values.password,
      fullname: `${values.firstname} ${values.lastname}`
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage.set(response.message);
        }
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Đăng ký thất bại');
        this.loading.set(false);
      }
    });
  }
}
