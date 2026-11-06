import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AuctionService } from '../../../core/services/auction.service';
import { NotificationService } from '../../../core/services/notification.service';
import { WalletService } from '../../../core/services/wallet.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CurrencyINRPipe } from '../../pipes/currency-inr.pipe';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    CurrencyINRPipe,
    TimeAgoPipe,
    ModalComponent
  ],
  template: `
    <header class="navbar-root">
      <!-- Top announcement bar -->
      <div class="top-bar">
        <div class="container flex justify-between items-center text-xs">
          <div class="flex items-center gap-3">
            <span class="badge badge-live">LIVE SIMULATION</span>
            <span>Real-time bot bidding active • Instant bids update every 3-6s</span>
          </div>
          <div class="flex items-center gap-4">
            <a routerLink="/how-it-works" class="hover-underline">How it works</a>
            <a routerLink="/about" class="hover-underline">About</a>
            <a routerLink="/faq" class="hover-underline">FAQ</a>
            <button class="reset-btn" (click)="svc.resetDemoData()" title="Reset all demo data">
              <i class="bi bi-arrow-counterclockwise"></i> Reset Demo Data
            </button>
          </div>
        </div>
      </div>

      <!-- Main Navbar -->
      <nav class="main-nav">
        <div class="container flex items-center justify-between gap-4">
          <!-- Logo -->
          <a routerLink="/" class="logo-brand flex items-center gap-2">
            <div class="logo-icon-box">
              <i class="bi bi-hammer"></i>
            </div>
            <div class="brand-text">
              <span class="brand-title">Bid<span class="brand-highlight">Bazaar</span></span>
              <span class="brand-tagline">Real-Time Auctions</span>
            </div>
          </a>

          <!-- Search Bar -->
          <div class="nav-search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              class="nav-search-input"
              placeholder="Search watches, cars, art, tech & collectibles..."
              [(ngModel)]="searchKeyword"
              (keyup.enter)="onSearch()"
            />
            @if (searchKeyword) {
              <button class="clear-search-btn" (click)="searchKeyword = ''; onSearch()">
                <i class="bi bi-x-circle-fill"></i>
              </button>
            }
          </div>

          <!-- Desktop Actions -->
          <div class="nav-actions flex items-center gap-3">
            <!-- Explore / Browse Link -->
            <a routerLink="/auctions" routerLinkActive="active" class="nav-link">
              <i class="bi bi-grid-3x3-gap"></i> Browse
            </a>

            <!-- Sell CTA Button -->
            <a routerLink="/seller/new" class="btn btn-secondary btn-sm sell-btn">
              <i class="bi bi-plus-circle"></i> Sell Item
            </a>

            <!-- Theme Toggle -->
            <button
              class="icon-btn theme-toggle"
              (click)="themeSvc.toggleTheme()"
              [title]="'Switch to ' + (themeSvc.theme() === 'light' ? 'Dark' : 'Light') + ' Mode'"
            >
              @if (themeSvc.theme() === 'dark') {
                <i class="bi bi-sun-fill text-warning"></i>
              } @else {
                <i class="bi bi-moon-stars-fill"></i>
              }
            </button>

            <!-- Notifications Dropdown -->
            <div class="dropdown-wrapper">
              <button class="icon-btn notif-btn" (click)="toggleNotifDropdown()">
                <i class="bi bi-bell-fill"></i>
                @if (notifSvc.unreadCount() > 0) {
                  <span class="notif-badge">{{ notifSvc.unreadCount() }}</span>
                }
              </button>

              @if (showNotifDropdown) {
                <div class="dropdown-panel notif-dropdown">
                  <div class="dropdown-header flex justify-between items-center">
                    <span class="dropdown-title">Notifications ({{ notifSvc.notifications().length }})</span>
                    @if (notifSvc.unreadCount() > 0) {
                      <button class="text-btn" (click)="notifSvc.markAllAsRead()">Mark all read</button>
                    }
                  </div>
                  <div class="notif-list">
                    @for (n of notifSvc.notifications().slice(0, 5); track n.id) {
                      <div class="notif-item" [class.unread]="!n.read" (click)="notifSvc.markAsRead(n.id)">
                        <div class="notif-item-icon" [ngClass]="'icon-' + n.type">
                          <i class="bi" [class.bi-exclamation-triangle-fill]="n.type === 'outbid'"
                             [class.bi-clock-fill]="n.type === 'ending'"
                             [class.bi-trophy-fill]="n.type === 'won'"
                             [class.bi-wallet2]="n.type === 'wallet'"
                             [class.bi-info-circle-fill]="n.type === 'system'"></i>
                        </div>
                        <div class="notif-item-content">
                          <div class="notif-item-title">{{ n.title }}</div>
                          <div class="notif-item-msg">{{ n.message }}</div>
                          <div class="notif-item-time">{{ n.time | timeAgo }}</div>
                        </div>
                      </div>
                    } @empty {
                      <div class="empty-notifs">No notifications right now</div>
                    }
                  </div>
                  <div class="dropdown-footer">
                    <a routerLink="/dashboard" (click)="showNotifDropdown = false" class="view-all-link">
                      Go to Dashboard & Notifications →
                    </a>
                  </div>
                </div>
              }
            </div>

            <!-- Wallet Pill -->
            @if (auth.isAuthenticated()) {
              <div class="wallet-pill" (click)="openWalletModal()">
                <i class="bi bi-wallet2"></i>
                <span class="wallet-amount">{{ auth.currentUser()?.wallet | currencyINR }}</span>
                <button class="wallet-add-btn" title="Add funds">+</button>
              </div>
            }

            <!-- User Menu -->
            @if (auth.isAuthenticated()) {
              <div class="dropdown-wrapper">
                <button class="user-avatar-btn flex items-center gap-2" (click)="toggleUserDropdown()">
                  <img
                    [src]="auth.currentUser()?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'"
                    [alt]="auth.currentUser()?.name"
                    class="avatar-img"
                  />
                  <span class="user-name-text">{{ auth.currentUser()?.name?.split(' ')?.at(0) }}</span>
                  <i class="bi bi-chevron-down text-xs"></i>
                </button>

                @if (showUserDropdown) {
                  <div class="dropdown-panel user-dropdown">
                    <div class="user-info-box">
                      <div class="font-bold">{{ auth.currentUser()?.name }}</div>
                      <div class="text-xs text-muted">{{ auth.currentUser()?.email }}</div>
                      <span class="badge user-role-badge mt-1" [ngClass]="'role-' + auth.currentUser()?.role">
                        {{ auth.currentUser()?.role | uppercase }}
                      </span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a routerLink="/dashboard" (click)="showUserDropdown = false" class="dropdown-item">
                      <i class="bi bi-speedometer2"></i> Buyer Dashboard
                    </a>
                    <a routerLink="/checkout/orders" (click)="showUserDropdown = false" class="dropdown-item">
                      <i class="bi bi-box-seam"></i> My Orders & Receipts
                    </a>
                    <a routerLink="/seller/listings" (click)="showUserDropdown = false" class="dropdown-item">
                      <i class="bi bi-shop"></i> Seller Listings
                    </a>
                    @if (auth.isAdmin()) {
                      <a routerLink="/admin" (click)="showUserDropdown = false" class="dropdown-item admin-link">
                        <i class="bi bi-shield-lock-fill"></i> Admin Console
                      </a>
                    }
                    <div class="dropdown-divider"></div>
                    <button (click)="logout()" class="dropdown-item text-danger">
                      <i class="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                  </div>
                }
              </div>
            } @else {
              <!-- Login / Register buttons -->
              <div class="flex items-center gap-2">
                <a routerLink="/auth/login" class="btn btn-ghost btn-sm">Log In</a>
                <a routerLink="/auth/register" class="btn btn-primary btn-sm">Register</a>
              </div>
            }

            <!-- Mobile Hamburger Button -->
            <button class="icon-btn mobile-menu-btn" (click)="mobileMenuOpen = !mobileMenuOpen">
              <i class="bi" [class.bi-list]="!mobileMenuOpen" [class.bi-x-lg]="mobileMenuOpen"></i>
            </button>
          </div>
        </div>

        <!-- Mobile Drawer Menu -->
        @if (mobileMenuOpen) {
          <div class="mobile-drawer">
            <div class="mobile-search">
              <input
                type="text"
                class="form-control"
                placeholder="Search auctions..."
                [(ngModel)]="searchKeyword"
                (keyup.enter)="onSearch(); mobileMenuOpen = false"
              />
            </div>
            <div class="mobile-nav-links">
              <a routerLink="/" (click)="mobileMenuOpen = false">Home</a>
              <a routerLink="/auctions" (click)="mobileMenuOpen = false">Browse Auctions</a>
              <a routerLink="/seller/new" (click)="mobileMenuOpen = false">Sell an Item</a>
              <a routerLink="/how-it-works" (click)="mobileMenuOpen = false">How It Works</a>
              @if (auth.isAuthenticated()) {
                <a routerLink="/dashboard" (click)="mobileMenuOpen = false">My Bids & Watchlist</a>
                <a routerLink="/checkout/orders" (click)="mobileMenuOpen = false">My Orders</a>
                <a routerLink="/seller/listings" (click)="mobileMenuOpen = false">Seller Dashboard</a>
                @if (auth.isAdmin()) {
                  <a routerLink="/admin" (click)="mobileMenuOpen = false">Admin Panel</a>
                }
                <button class="btn btn-danger btn-sm" (click)="logout(); mobileMenuOpen = false" style="margin-top: 10px;">
                  Sign Out
                </button>
              } @else {
                <div class="flex gap-2" style="margin-top: 10px;">
                  <a routerLink="/auth/login" (click)="mobileMenuOpen = false" class="btn btn-secondary flex-1">Log In</a>
                  <a routerLink="/auth/register" (click)="mobileMenuOpen = false" class="btn btn-primary flex-1">Register</a>
                </div>
              }
            </div>
          </div>
        }
      </nav>
    </header>

    <!-- Top-up Wallet Modal -->
    <app-modal [isOpen]="isWalletModalOpen" title="Add Funds to BidBazaar Wallet" (close)="isWalletModalOpen = false">
      <div body class="wallet-modal-body">
        <p class="text-muted text-sm" style="margin-bottom: 16px;">
          Instantly simulate adding funds using mock UPI or card payment. Funds are stored locally in your browser!
        </p>
        <div class="current-bal-banner">
          <span>Current Wallet:</span>
          <strong>{{ auth.currentUser()?.wallet | currencyINR }}</strong>
        </div>

        <div class="quick-topup-grid">
          <button type="button" class="btn btn-secondary" (click)="topUpAmount = 10000">+₹10,000</button>
          <button type="button" class="btn btn-secondary" (click)="topUpAmount = 25000">+₹25,000</button>
          <button type="button" class="btn btn-secondary" (click)="topUpAmount = 50000">+₹50,000</button>
          <button type="button" class="btn btn-secondary" (click)="topUpAmount = 100000">+₹1,00,000</button>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">Or Custom Amount (₹):</label>
          <input type="number" class="form-control" [(ngModel)]="topUpAmount" placeholder="Enter amount" />
        </div>

        <div class="form-group">
          <label class="form-label">Payment Method (Mock):</label>
          <select class="form-control" [(ngModel)]="topUpMethod">
            <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
            <option value="Debit Card">Debit / Credit Card</option>
            <option value="Net Banking">Net Banking</option>
          </select>
        </div>
      </div>
      <div footer>
        <button class="btn btn-secondary" (click)="isWalletModalOpen = false">Cancel</button>
        <button class="btn btn-primary" (click)="confirmTopUp()">
          <i class="bi bi-check2-circle"></i> Add Funds Now
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .navbar-root {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--bg-surface);
      box-shadow: var(--shadow-sm);
    }
    .top-bar {
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-subtle);
      padding: 6px 0;
      font-size: 11.5px;
      color: var(--text-secondary);
    }
    .hover-underline:hover {
      text-decoration: underline;
    }
    .reset-btn {
      background: transparent;
      border: 0;
      color: var(--primary);
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .reset-btn:hover {
      text-decoration: underline;
    }
    .main-nav {
      padding: 12px 0;
      border-bottom: 1px solid var(--border-subtle);
      position: relative;
    }
    .logo-brand {
      cursor: pointer;
    }
    .logo-icon-box {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
    }
    .brand-title {
      font-family: var(--font-heading);
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--text-primary);
      line-height: 1;
      display: block;
    }
    .brand-highlight {
      color: var(--primary);
    }
    .brand-tagline {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--text-muted);
    }
    .nav-search-wrapper {
      position: relative;
      flex: 1;
      max-width: 480px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 14px;
    }
    .nav-search-input {
      width: 100%;
      padding: 9px 36px 9px 38px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-strong);
      background: var(--bg-subtle);
      color: var(--text-primary);
      font-size: 13.5px;
      outline: none;
      transition: var(--transition);
    }
    .nav-search-input:focus {
      background: var(--bg-surface);
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }
    .clear-search-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: 0;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
    }
    .nav-link {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: var(--radius-md);
    }
    .nav-link:hover, .nav-link.active {
      color: var(--primary);
      background: var(--primary-light);
    }
    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: var(--transition);
    }
    .icon-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .notif-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--danger);
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wallet-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 12px;
      background: var(--primary-light);
      border: 1px solid var(--primary-border);
      border-radius: var(--radius-full);
      font-size: 13px;
      font-weight: 700;
      color: var(--primary);
      cursor: pointer;
      transition: var(--transition);
    }
    .wallet-pill:hover {
      transform: scale(1.02);
      box-shadow: var(--shadow-sm);
    }
    .wallet-add-btn {
      background: var(--primary);
      color: #fff;
      border: 0;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer;
    }
    .dropdown-wrapper {
      position: relative;
    }
    .user-avatar-btn {
      background: transparent;
      border: 0;
      cursor: pointer;
      padding: 2px;
      border-radius: var(--radius-full);
    }
    .avatar-img {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--border-strong);
    }
    .user-name-text {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .dropdown-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      min-width: 260px;
      z-index: 1050;
      overflow: hidden;
      animation: slideDown 0.2s ease-out;
    }
    .notif-dropdown {
      width: 340px;
    }
    .dropdown-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-subtle);
    }
    .dropdown-title {
      font-size: 13px;
      font-weight: 700;
    }
    .text-btn {
      background: transparent;
      border: 0;
      color: var(--primary);
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
    }
    .notif-list {
      max-height: 320px;
      overflow-y: auto;
    }
    .notif-item {
      padding: 12px 16px;
      display: flex;
      gap: 12px;
      border-bottom: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: var(--transition);
    }
    .notif-item:hover {
      background: var(--bg-subtle);
    }
    .notif-item.unread {
      background: rgba(79, 70, 229, 0.05);
    }
    .notif-item-icon {
      font-size: 16px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-outbid { background: var(--danger-light); color: var(--danger); }
    .icon-ending { background: var(--warning-light); color: var(--warning); }
    .icon-won { background: var(--success-light); color: var(--success); }
    .icon-wallet { background: var(--info-light); color: var(--info); }
    .icon-system { background: var(--bg-hover); color: var(--text-secondary); }
    .notif-item-title {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .notif-item-msg {
      font-size: 11.5px;
      color: var(--text-secondary);
      line-height: 1.35;
      margin: 2px 0 4px;
    }
    .notif-item-time {
      font-size: 10px;
      color: var(--text-muted);
    }
    .empty-notifs {
      padding: 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 13px;
    }
    .dropdown-footer {
      padding: 10px 16px;
      background: var(--bg-subtle);
      text-align: center;
      border-top: 1px solid var(--border-subtle);
    }
    .view-all-link {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary);
    }
    .user-info-box {
      padding: 14px 16px;
    }
    .user-role-badge {
      font-size: 10px;
      padding: 2px 8px;
    }
    .role-admin { background: #fee2e2; color: #991b1b; }
    .role-seller { background: #fef3c7; color: #92400e; }
    .role-buyer { background: #e0f2fe; color: #075985; }
    .dropdown-divider {
      height: 1px;
      background: var(--border-subtle);
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 16px;
      font-size: 13px;
      color: var(--text-secondary);
      background: transparent;
      border: 0;
      cursor: pointer;
      text-align: left;
      transition: var(--transition);
    }
    .dropdown-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .admin-link {
      color: #b91c1c;
      font-weight: 600;
    }
    .mobile-menu-btn {
      display: none;
    }
    .mobile-drawer {
      display: none;
      padding: 16px 20px;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);
    }
    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .mobile-nav-links a {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .current-bal-banner {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: var(--primary-light);
      border-radius: var(--radius-md);
      font-size: 14px;
      margin-bottom: 16px;
    }
    .quick-topup-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 900px) {
      .nav-search-wrapper { display: none; }
      .mobile-menu-btn { display: flex; }
      .mobile-drawer { display: block; }
      .nav-link, .sell-btn, .wallet-pill, .user-name-text { display: none; }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  svc = inject(AuctionService);
  notifSvc = inject(NotificationService);
  walletSvc = inject(WalletService);
  themeSvc = inject(ThemeService);
  private router = inject(Router);

  searchKeyword = '';
  showNotifDropdown = false;
  showUserDropdown = false;
  mobileMenuOpen = false;

  // Wallet modal state
  isWalletModalOpen = false;
  topUpAmount: number = 25000;
  topUpMethod: string = 'UPI';

  toggleNotifDropdown() {
    this.showNotifDropdown = !this.showNotifDropdown;
    if (this.showNotifDropdown) this.showUserDropdown = false;
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) this.showNotifDropdown = false;
  }

  onSearch() {
    const q = this.searchKeyword.trim();
    this.svc.searchQuery.set(q);
    this.router.navigate(['/auctions'], { queryParams: { q: q || null } });
  }

  openWalletModal() {
    this.isWalletModalOpen = true;
  }

  confirmTopUp() {
    if (this.topUpAmount <= 0) return;
    this.walletSvc.addFunds(this.topUpAmount, this.topUpMethod);
    this.svc.showToast(`₹${this.topUpAmount.toLocaleString('en-IN')} added to your wallet!`, 'success');
    this.isWalletModalOpen = false;
  }

  logout() {
    this.showUserDropdown = false;
    this.auth.logout();
    this.svc.showToast('You have been logged out.', 'info');
  }
}
