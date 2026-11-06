import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AuctionService } from '../../../core/services/auction.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page container">
      <div class="auth-card card">
        <div class="auth-header text-center">
          <div class="logo-box">
            <i class="bi bi-hammer"></i>
          </div>
          <h1 class="auth-title">Welcome to BidBazaar</h1>
          <p class="auth-subtitle">Sign in to participate in real-time auctions</p>
        </div>

        <!-- Demo Credentials Quick Fill Pills -->
        <div class="demo-credentials-box">
          <div class="demo-title flex items-center justify-between">
            <span><i class="bi bi-key-fill text-warning"></i> Demo Accounts (1-Click Fill):</span>
          </div>
          <div class="demo-buttons-grid">
            <button type="button" class="demo-btn buyer" (click)="fillDemo('buyer')">
              <strong>Buyer</strong>
              <small>buyer&#64;bidbazaar.com</small>
            </button>
            <button type="button" class="demo-btn seller" (click)="fillDemo('seller')">
              <strong>Seller</strong>
              <small>seller&#64;bidbazaar.com</small>
            </button>
            <button type="button" class="demo-btn admin" (click)="fillDemo('admin')">
              <strong>Admin</strong>
              <small>admin&#64;bidbazaar.com</small>
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form mt-4">
          @if (errorMessage) {
            <div class="alert alert-danger mb-4">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>{{ errorMessage }}</span>
            </div>
          }

          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <div class="input-icon-wrap">
              <i class="bi bi-envelope icon-left"></i>
              <input
                id="email"
                type="email"
                class="form-control with-icon"
                formControlName="email"
                placeholder="name@example.com"
                [class.is-invalid]="f['email'].touched && f['email'].errors"
              />
            </div>
            @if (f['email'].touched && f['email'].errors) {
              <div class="invalid-feedback">
                <i class="bi bi-x-circle"></i> Please enter a valid email address.
              </div>
            }
          </div>

          <div class="form-group">
            <div class="flex justify-between items-center mb-1">
              <label class="form-label" for="password">Password</label>
              <span class="text-xs text-muted">Default: Password&#64;123</span>
            </div>
            <div class="input-icon-wrap">
              <i class="bi bi-lock icon-left"></i>
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                class="form-control with-icon with-eye"
                formControlName="password"
                placeholder="••••••••"
                [class.is-invalid]="f['password'].touched && f['password'].errors"
              />
              <button type="button" class="eye-btn" (click)="showPassword = !showPassword">
                <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
              </button>
            </div>
            @if (f['password'].touched && f['password'].errors) {
              <div class="invalid-feedback">
                <i class="bi bi-x-circle"></i> Password is required (minimum 6 characters).
              </div>
            }
          </div>

          <button type="submit" class="btn btn-primary auth-submit-btn" [disabled]="loginForm.invalid || isSubmitting">
            @if (isSubmitting) {
              <span>Signing in...</span>
            } @else {
              <span><i class="bi bi-box-arrow-in-right"></i> Sign In to Account</span>
            }
          </button>
        </form>

        <div class="auth-footer text-center mt-6">
          <p class="text-sm text-secondary">
            Don't have an account?
            <a routerLink="/auth/register" class="text-primary font-bold">Register free with ₹50,000 bonus</a>
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
      max-width: 440px;
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
    .demo-credentials-box {
      background: var(--bg-subtle);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 12px;
      margin-top: 20px;
    }
    .demo-title {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    .demo-buttons-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }
    .demo-btn {
      padding: 6px 4px;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      cursor: pointer;
      text-align: center;
      transition: var(--transition);
      display: flex;
      flex-direction: column;
    }
    .demo-btn:hover {
      transform: translateY(-2px);
      border-color: var(--primary);
    }
    .demo-btn strong {
      font-size: 12px;
    }
    .demo-btn small {
      font-size: 9px;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .demo-btn.buyer strong { color: #0284c7; }
    .demo-btn.seller strong { color: #d97706; }
    .demo-btn.admin strong { color: #dc2626; }

    .input-icon-wrap {
      position: relative;
    }
    .icon-left {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    .with-icon {
      padding-left: 36px;
    }
    .with-eye {
      padding-right: 36px;
    }
    .eye-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: 0;
      color: var(--text-muted);
      cursor: pointer;
    }
    .auth-submit-btn {
      width: 100%;
      padding: 12px;
      font-size: 15px;
      margin-top: 8px;
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
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private svc = inject(AuctionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  showPassword = false;
  isSubmitting = false;
  errorMessage = '';
  returnUrl = '/';

  get f() { return this.loginForm.controls; }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  fillDemo(type: 'buyer' | 'seller' | 'admin') {
    const creds = {
      buyer: { email: 'buyer@bidbazaar.com', password: 'Password@123' },
      seller: { email: 'seller@bidbazaar.com', password: 'Password@123' },
      admin: { email: 'admin@bidbazaar.com', password: 'Password@123' }
    };
    this.loginForm.patchValue(creds[type]);
    this.errorMessage = '';
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    const res = this.auth.login(email, password);
    this.isSubmitting = false;

    if (res.success) {
      this.svc.showToast(`Welcome back, ${this.auth.currentUser()?.name}!`, 'success');
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.errorMessage = res.message || 'Login failed';
    }
  }
}

