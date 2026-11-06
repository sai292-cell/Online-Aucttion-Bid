import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-page container text-center py-16">
      <div class="error-code">404</div>
      <div class="gavel-icon mb-4"><i class="bi bi-hammer"></i></div>
      <h1 class="font-bold text-3xl mb-2">Lot Or Page Not Found</h1>
      <p class="text-secondary max-w-md mx-auto mb-6">
        The auction lot or page you are looking for has been archived, moved, or does not exist.
      </p>
      <div class="flex justify-center gap-3">
        <a routerLink="/" class="btn btn-primary">
          <i class="bi bi-house-door-fill"></i> Return Home
        </a>
        <a routerLink="/auctions" class="btn btn-secondary">
          <i class="bi bi-search"></i> Browse All Lots
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      padding: 80px 20px;
    }
    .error-code {
      font-size: 80px;
      font-weight: 900;
      font-family: var(--font-heading);
      color: var(--primary);
      line-height: 1;
      opacity: 0.3;
    }
    .gavel-icon {
      font-size: 48px;
      color: var(--text-primary);
      margin-top: -20px;
    }
  `]
})
export class NotFoundComponent {}

