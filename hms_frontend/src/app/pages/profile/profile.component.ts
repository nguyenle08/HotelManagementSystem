import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profileForm!: FormGroup;
  userId!: string;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();     
    this.loadProfile();  
  }

  initForm() {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],

      firstName: ['', Validators.required],
      lastName: ['', Validators.required],

      phone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]
      ],

      cccd: [''],
      address: ['']
    });
  }

  loadProfile() {
    this.loading = true;

    this.userService.getMyProfile().subscribe({
      next: (res: any) => {
        this.userId = res.userId;

        this.profileForm.patchValue({
          username: res.username,
          role: res.role,
          lastName: res.lastName ?? '',
          firstName: res.firstName ?? '',
          phone: res.phone ?? '',
          cccd: res.cccd ?? '',
          address: res.address ?? ''
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Không tải được hồ sơ cá nhân');
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    const payload = {
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value, 
      phone: this.profileForm.get('phone')?.value,
      cccd: this.profileForm.get('cccd')?.value,
      address: this.profileForm.get('address')?.value
    };

    this.loading = true;

    this.userService.updateProfile(this.userId, payload).subscribe({
      next: () => {
        alert('Cập nhật hồ sơ thành công');
        this.loading = false;
        this.loadProfile();
      },
      error: () => {
        this.loading = false;
        alert('Cập nhật thất bại');
      }
    });
  }
  goToMyReservations() {
    this.router.navigate(['/my-reservations']);
  }
}
