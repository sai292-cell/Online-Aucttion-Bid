import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AuctionService } from '../../../core/services/auction.service';
import { User } from '../../../core/models/user.model';
import { Auction } from '../../../core/models/auction.model';
import { CurrencyINRPipe } from '../../../shared/pipes/currency-inr.pipe';
import { CountdownTimerComponent } from '../../../shared/components/countdown-timer/countdown-timer.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyINRPipe, CountdownTimerComponent],
  template: `
    <div class="admin-page container">
      <!-- Admin Top Banner -->
      <div class="admin-header flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <span class="badge" style="background:#fee2e2; color:#b91c1c;">MASTER ACCESS</span>
            <h1 class="page-title">Platform Administration Console</h1>
          </div>
          <p class="text-sm text-secondary">Global governance, user management, auction moderation and marketplace analytics</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" (click)="svc.resetDemoData()">
            <i class="bi bi-arrow-counterclockwise"></i> Reset DB Seeds
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="admin-stats-grid mb-8">
        <div class="card p-5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs text-muted text-uppercase font-bold">Registered Users</span>
              <div class="metric-val text-primary mt-1">{{ auth.users().length }}</div>
            </div>
            <i class="bi bi-people-fill metric-icon"></i>
          </div>
          <span class="text-xs text-muted mt-2 block">{{ blockedUsersCount }} suspended</span>
        </div>

        <div class="card p-5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs text-muted text-uppercase font-bold">Total Catalog Lots</span>
              <div class="metric-val text-info mt-1">{{ svc.auctions().length }}</div>
            </div>
            <i class="bi bi-box-seam-fill metric-icon"></i>
          </div>
          <span class="text-xs text-success mt-2 block">{{ svc.activeAuctions().length }} active live</span>
        </div>

        <div class="card p-5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs text-muted text-uppercase font-bold">Total Bids Processed</span>
              <div class="metric-val text-warning mt-1">{{ svc.totalBidsCount() }}</div>
            </div>
            <i class="bi bi-hammer metric-icon"></i>
          </div>
          <span class="text-xs text-muted mt-2 block">Real-time simulation active</span>
        </div>

        <div class="card p-5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs text-muted text-uppercase font-bold">Gross Lot Value</span>
              <div class="metric-val text-success mt-1">{{ svc.totalVolume() | currencyINR }}</div>
            </div>
            <i class="bi bi-cash-stack metric-icon"></i>
          </div>
          <span class="text-xs text-muted mt-2 block">Pan-India auction turnover</span>
        </div>
      </div>

      <!-- Category Distribution Bar Visualization -->
      <div class="card p-6 mb-8">
        <h3 class="section-title mb-3">Inventory Distribution By Category</h3>
        <div class="category-bars-grid">
          @for (cat of svc.categories(); track cat.id) {
            <div class="cat-bar-item">
              <div class="flex justify-between text-xs mb-1">
                <strong>{{ cat.name }}</strong>
                <span>{{ getCatCount(cat.name) }} lots</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" [style.width.%]="(getCatCount(cat.name) / svc.auctions().length) * 100"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Section Switcher: Users vs Auctions -->
      <div class="admin-tabs flex gap-2 mb-4">
        <button
          class="dash-tab-btn"
          [class.active]="adminTab === 'auctions'"
          (click)="adminTab = 'auctions'"
        >
          <i class="bi bi-box"></i> Manage Auctions ({{ svc.auctions().length }})
        </button>
        <button
          class="dash-tab-btn"
          [class.active]="adminTab === 'users'"
          (click)="adminTab = 'users'"
        >
          <i class="bi bi-people"></i> Manage Users &amp; Roles ({{ auth.users().length }})
        </button>
      </div>

      <!-- TAB 1: AUCTION MODERATION -->
      @if (adminTab === 'auctions') {
        <div class="card overflow-hidden">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Lot Title</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Current Price</th>
                <th>Bids</th>
                <th>Featured</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (a of svc.auctions(); track a.id) {
                <tr>
                  <td class="font-mono text-xs">#{{ a.id }}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <img [src]="a.images[0]" [alt]="a.title" class="admin-thumb" />
                      <div>
                        <strong>{{ a.title }}</strong>
                        <div class="text-xs text-muted">{{ a.condition }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-sm">{{ a.seller }}</td>
                  <td class="text-sm">{{ a.category }}</td>
                  <td class="font-bold text-primary">{{ svc.getCurrentPrice(a) | currencyINR }}</td>
                  <td>{{ a.bids.length }}</td>
                  <td>
                    <button
                      class="btn btn-sm"
                      [class.btn-accent]="a.featured"
                      [class.btn-secondary]="!a.featured"
                      (click)="toggleFeatured(a)"
                    >
                      <i class="bi" [class.bi-star-fill]="a.featured" [class.bi-star]="!a.featured"></i>
                      {{ a.featured ? 'Featured' : 'Regular' }}
                    </button>
                  </td>
                  <td class="text-right">
                    <button class="btn btn-danger btn-sm" (click)="deleteAuction(a)">
                      <i class="bi bi-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- TAB 2: USER MANAGEMENT -->
      @if (adminTab === 'users') {
        <div class="card overflow-hidden">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Email</th>
                <th>Role</th>
                <th>Wallet Balance</th>
                <th>Status</th>
                <th class="text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (u of auth.users(); track u.id) {
                <tr [class.blocked-row]="u.isBlocked">
                  <td>
                    <div class="flex items-center gap-2">
                      <img [src]="u.avatar" [alt]="u.name" class="admin-avatar" />
                      <div>
                        <strong>{{ u.name }}</strong>
                        <div class="text-xs text-muted">{{ u.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-sm font-mono">{{ u.email }}</td>
                  <td>
                    <span class="badge" [ngClass]="'role-' + u.role">{{ u.role | uppercase }}</span>
                  </td>
                  <td class="font-bold text-sm">{{ u.wallet | currencyINR }}</td>
                  <td>
                    @if (u.isBlocked) {
                      <span class="badge badge-urgent">BLOCKED</span>
                    } @else {
                      <span class="badge badge-live">ACTIVE</span>
                    }
                  </td>
                  <td class="text-right">
                    <button
                      class="btn btn-sm"
                      [class.btn-danger]="!u.isBlocked"
                      [class.btn-secondary]="u.isBlocked"
                      [disabled]="u.role === 'admin' && u.email.includes('superadmin')"
                      (click)="toggleBlock(u)"
                    >
                      <i class="bi" [class.bi-slash-circle]="!u.isBlocked" [class.bi-check-circle]="u.isBlocked"></i>
                      {{ u.isBlocked ? 'Unblock' : 'Suspend' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-page {
      padding-top: 30px;
      padding-bottom: 60px;
    }
    .page-title {
      font-size: 28px;
      font-weight: 800;
    }
    .admin-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .metric-val {
      font-size: 24px;
      font-weight: 800;
      font-family: var(--font-heading);
    }
    .metric-icon {
      font-size: 26px;
      color: var(--text-muted);
    }
    .category-bars-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .progress-track {
      height: 8px;
      background: var(--bg-subtle);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--primary);
      border-radius: var(--radius-full);
      transition: width 0.4s ease;
    }
    .admin-tabs {
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 6px;
    }
    .dash-tab-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-family: var(--font-body);
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-secondary);
      padding: 10px 18px;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dash-tab-btn.active {
      background: var(--primary);
      color: #fff;
    }
    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .admin-table th, .admin-table td {
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }
    .admin-table th {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      background: var(--bg-subtle);
    }
    .admin-thumb {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    .admin-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    .blocked-row {
      background: rgba(239, 68, 68, 0.05);
    }
    .role-admin { background: #fee2e2; color: #991b1b; }
    .role-seller { background: #fef3c7; color: #92400e; }
    .role-buyer { background: #e0f2fe; color: #075985; }
    @media (max-width: 900px) {
      .admin-stats-grid, .category-bars-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  auth = inject(AuthService);
  svc = inject(AuctionService);

  adminTab: 'auctions' | 'users' = 'auctions';

  get blockedUsersCount(): number {
    return this.auth.users().filter(u => u.isBlocked).length;
  }

  ngOnInit() {}

  getCatCount(catName: string): number {
    return this.svc.auctions().filter(a => a.category.toLowerCase() === catName.toLowerCase()).length;
  }

  toggleFeatured(a: Auction) {
    const updated = { ...a, featured: !a.featured };
    this.svc.updateAuction(updated);
  }

  deleteAuction(a: Auction) {
    if (confirm(`Admin action: Remove lot '${a.title}' from marketplace?`)) {
      this.svc.deleteAuction(a.id);
    }
  }

  toggleBlock(u: User) {
    this.auth.toggleUserBlock(u.id);
    this.svc.showToast(`User ${u.name} status updated`, 'info');
  }
}

