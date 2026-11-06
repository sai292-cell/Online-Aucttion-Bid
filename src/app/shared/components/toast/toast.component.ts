import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionService } from '../../../core/services/auction.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (svc.toast(); as t) {
      <div class="toast-container">
        <div class="toast-box" [ngClass]="'toast-' + t.type">
          <div class="toast-icon">
            @switch (t.type) {
              @case ('success') { <i class="bi bi-check-circle-fill"></i> }
              @case ('danger') { <i class="bi bi-exclamation-octagon-fill"></i> }
              @case ('warning') { <i class="bi bi-exclamation-triangle-fill"></i> }
              @default { <i class="bi bi-info-circle-fill"></i> }
            }
          </div>
          <div class="toast-text">{{ t.message }}</div>
          <button class="toast-close" (click)="svc.toast.set(null)" aria-label="Close notification">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      pointer-events: none;
    }
    .toast-box {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-xl);
      max-width: 420px;
      animation: slideInRight 0.25s ease-out;
    }
    .toast-icon {
      font-size: 18px;
      display: flex;
    }
    .toast-success .toast-icon { color: var(--success); }
    .toast-danger .toast-icon { color: var(--danger); }
    .toast-warning .toast-icon { color: var(--warning); }
    .toast-info .toast-icon { color: var(--info); }

    .toast-text {
      font-size: 13.5px;
      font-weight: 500;
      line-height: 1.4;
      flex: 1;
    }
    .toast-close {
      background: transparent;
      border: 0;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      font-size: 12px;
      display: flex;
    }
    .toast-close:hover {
      color: var(--text-primary);
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  svc = inject(AuctionService);
}
