import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AuctionService } from '../../../core/services/auction.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page container">
      <div class="auth-card card">
        <div class="auth-header text-center">
          <div class="logo-box">
            <i class="bi bi-hammer"></i>
          </div>
          <h1 class="auth-title">Create Free Account</h1>
          <p class="auth-subtitle">Get instant ₹50,000 demo wallet credits upon signing up!</p>
        </div>

        <form [formGroup]="regForm" (ngSubmit)="onSubmit()" class="auth-form mt-4">
          @if (errorMessage) {
            <div class="alert alert-danger mb-4">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>{{ errorMessage }}</span>
            </div>
          }

          <!-- Full Name -->
          <div class="form-group">
            <label class="form-label" for="name">Full Name</label>
            <input
              id="name"
              type="text"
              class="form-control"
              formControlName="name"
              placeholder="e.g. Sarthak Sharma"
              [class.is-invalid]="f['name'].touched && f['name'].errors"
            />
            @if (f['name'].touched && f['name'].errors) {
              <div class="invalid-feedback">Name is required (at least 3 characters).</div>
            }
          </div>

          <!-- Email -->
          <div class="form-group">
            <label class="form-label" for="regEmail">Email Address</label>
            <input
              id="regEmail"
              type="email"
              class="form-control"
              formControlName="email"
              placeholder="you@example.com"
              [class.is-invalid]="f['email'].touched && f['email'].errors"
            />
            @if (f['email'].touched && f['email'].errors) {
              <div class="invalid-feedback">Please enter a valid email format.</div>
            }
          </div>

          <!-- Role Selection Radio Pills -->
          <div class="form-group">
            <label class="form-label">Primary Account Role</label>
            <div class="role-selector-grid">
              <label class="role-pill" [class.selected]="f['role'].value === 'buyer'">
                <input type="radio" formControlName="role" value="buyer" />
                <div class="flex items-center gap-2">
                  <i class="bi bi-person-circle"></i>
                  <div>
                    <strong>Buyer</strong>
                    <div class="text-xs text-muted">Bid & win luxury lots</div>
                  </div>
                </div>
              </label>

              <label class="role-pill" [class.selected]="f['role'].value === 'seller'">
                <input type="radio" formControlName="role" value="seller" />
                <div class="flex items-center gap-2">
                  <i class="bi bi-shop"></i>
                  <div>
                    <strong>Seller</strong>
                    <div class="text-xs text-muted">List items & manage sales</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Password & Strength Bar -->
          <div class="form-group">
            <label class="form-label" for="regPassword">Password</label>
            <input
              id="regPassword"
              type="password"
              class="form-control"
              formControlName="password"
              placeholder="At least 6 characters"
              (input)="updatePasswordStrength()"
              [class.is-invalid]="f['password'].touched && f['password'].errors"
            />

            <!-- Strength Meter -->
            @if (f['password'].value) {
              <div class="strength-meter mt-2">
                <div class="strength-bar-track">
                  <div class="strength-bar" [style.width.%]="strengthPercent" [ngClass]="strengthColor"></div>
                </div>
                <div class="flex justify-between text-xs mt-1">
                  <span class="text-muted">Password Strength:</span>
                  <span class="font-bold" [ngClass]="strengthColor">{{ strengthLabel }}</span>
                </div>
              </div>
            }

            @if (f['password'].touched && f['password'].errors) {
              <div class="invalid-feedback">Password must be at least 6 characters.</div>
            }
          </div>

          <button type="submit" class="btn btn-primary auth-submit-btn" [disabled]="regForm.invalid || isSubmitting">
            @if (isSubmitting) {
              <span>Creating your account...</span>
            } @else {
              <span><i class="bi bi-check-circle-fill"></i> Complete Registration</span>
            }
          </button>
        </form>

        <div class="auth-footer text-center mt-6">
          <p class="text-sm text-secondary">
            Already have an account?
            <a routerLink="/auth/login" class="text-primary font-bold">Sign In here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .auth-card {
      width: 100%;
      max-width: 480px;
      padding: 36px 32px;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
    }
    .logo-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--primary);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }
    .auth-title {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .auth-subtitle {
      font-size: 13.5px;
      color: var(--text-secondary);
    }
    .role-selector-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .role-pill {
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: var(--transition);
      background: var(--bg-surface);
    }
    .role-pill input {
      display: none;
    }
    .role-pill.selected {
      border-color: var(--primary);
      background: var(--primary-light);
    }
    .strength-bar-track {
      height: 6px;
      background: var(--bg-subtle);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .strength-bar {
      height: 100%;
      transition: width 0.3s ease;
    }
    .strength-weak { background: #ef4444; color: #ef4444; }
    .strength-medium { background: #f59e0b; color: #f59e0b; }
    .strength-strong { background: #10b981; color: #10b981; }

    .auth-submit-btn {
      width: 100%;
      padding: 12px;
      font-size: 15px;
      margin-top: 14px;
    }
    .alert-danger {
      padding: 10px 14px;
      background: var(--danger-light);
      border: 1px solid var(--danger);
      border-radius: var(--radius-md);
      color: var(--danger-text);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private svc = inject(AuctionService);
  private router = inject(Router);

  regForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  strengthPercent = 0;
  strengthLabel = 'Weak';
  strengthColor = 'strength-weak';

  get f() { return this.regForm.controls; }

  ngOnInit() {
    this.regForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['buyer', Validators.required]
    });
  }

  updatePasswordStrength() {
    const pwd = this.regForm.value.password || '';
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 9) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pwd)) score += 25;

    this.strengthPercent = score;
    if (score < 50) {
      this.strengthLabel = 'Weak';
      this.strengthColor = 'strength-weak';
    } else if (score < 75) {
      this.strengthLabel = 'Moderate';
      this.strengthColor = 'strength-medium';
    } else {
      this.strengthLabel = 'Strong & Secure';
      this.strengthColor = 'strength-strong';
    }
  }

  onSubmit() {
    if (this.regForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const res = this.auth.register(this.regForm.value);
    this.isSubmitting = false;

    if (res.success) {
      this.svc.showToast(`Account created! Welcome to BidBazaar, ${this.regForm.value.name}! 🎁 ₹50,000 bonus credited!`, 'success');
      this.router.navigate(['/']);
    } else {
      this.errorMessage = res.message || 'Registration failed';
    }
  }
}

