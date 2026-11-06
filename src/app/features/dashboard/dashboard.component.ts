import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AuctionService } from '../../core/services/auction.service';
import { NotificationService } from '../../core/services/notification.service';
import { WalletService } from '../../core/services/wallet.service';
import { Auction, Bid } from '../../core/models/auction.model';
import { AppNotification } from '../../core/models/notification.model';
import { AuctionCardComponent } from '../../shared/components/auction-card/auction-card.component';
import { CountdownTimerComponent } from '../../shared/components/countdown-timer/countdown-timer.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CurrencyINRPipe } from '../../shared/pipes/currency-inr.pipe';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    AuctionCardComponent,
    CountdownTimerComponent,
    ModalComponent,
    CurrencyINRPipe,
    TimeAgoPipe
  ],
  template: `
    <div class="dashboard-page container">
      <!-- User Profile Header -->
      <div class="dashboard-hero card flex justify-between items-center flex-wrap gap-4 mb-6">
        <div class="flex items-center gap-4">
          <img
            [src]="auth.currentUser()?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'"
            [alt]="auth.currentUser()?.name"
            class="user-avatar-lg"
          />
          <div>
            <div class="flex items-center gap-2">
              <h1 class="user-name">{{ auth.currentUser()?.name }}</h1>
              <span class="badge user-role-pill">{{ auth.currentUser()?.role | uppercase }}</span>
            </div>
            <p class="text-xs text-muted">{{ auth.currentUser()?.email }} • Member since {{ auth.currentUser()?.joined || '2024' }}</p>
          </div>
        </div>

        <div class="wallet-stat-card flex items-center gap-3">
          <div class="wallet-icon-box"><i class="bi bi-wallet2"></i></div>
          <div>
            <div class="text-xs text-muted text-uppercase font-bold">Wallet Balance</div>
            <div class="wallet-balance-val">{{ auth.currentUser()?.wallet | currencyINR }}</div>
          </div>
          <button class="btn btn-primary btn-sm ml-2" (click)="isWalletModalOpen = true">
            <i class="bi bi-plus-lg"></i> Add Money
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="dashboard-tabs flex gap-2 mb-6">
        <button
          class="dash-tab-btn"
          [class.active]="currentTab === 'bids'"
          (click)="currentTab = 'bids'"
        >
          <i class="bi bi-hammer"></i> My Bids ({{ userParticipatedAuctions.length }})
        </button>

        <button
          class="dash-tab-btn"
          [class.active]="currentTab === 'watchlist'"
          (click)="currentTab = 'watchlist'"
        >
          <i class="bi bi-heart-fill text-danger"></i> Watchlist ({{ watchlistedAuctions.length }})
        </button>

        <button
          class="dash-tab-btn"
          [class.active]="currentTab === 'wallet'"
          (click)="currentTab = 'wallet'"
        >
          <i class="bi bi-wallet2"></i> Wallet &amp; Ledger
        </button>

        <button
          class="dash-tab-btn"
          [class.active]="currentTab === 'notifications'"
          (click)="currentTab = 'notifications'"
        >
          <i class="bi bi-bell-fill"></i> Notifications
          @if (notifSvc.unreadCount() > 0) {
            <span class="tab-badge">{{ notifSvc.unreadCount() }}</span>
          }
        </button>
      </div>

      <!-- TAB 1: MY BIDS -->
      @if (currentTab === 'bids') {
        <div class="bids-tab-content">
          <!-- Sub-tabs: Winning, Outbid, Won, Lost -->
          <div class="sub-tabs flex gap-2 mb-4">
            <button
              class="sub-tab-pill"
              [class.active]="bidsSubTab === 'winning'"
              (click)="bidsSubTab = 'winning'"
            >
              Winning ({{ winningAuctions.length }})
            </button>
            <button
              class="sub-tab-pill"
              [class.active]="bidsSubTab === 'outbid'"
              (click)="bidsSubTab = 'outbid'"
            >
              Outbid ({{ outbidAuctions.length }})
            </button>
            <button
              class="sub-tab-pill"
              [class.active]="bidsSubTab === 'won'"
              (click)="bidsSubTab = 'won'"
            >
              🏆 Won &amp; Purchases ({{ wonAuctions.length }})
            </button>
            <button
              class="sub-tab-pill"
              [class.active]="bidsSubTab === 'lost'"
              (click)="bidsSubTab = 'lost'"
            >
              Lost ({{ lostAuctions.length }})
            </button>
          </div>

          <!-- Bids View Grid -->
          @if (currentBidsList.length > 0) {
            <div class="grid grid-cols-3">
              @for (item of currentBidsList; track item.id) {
                <div class="auction-status-card card">
                  <app-auction-card [auction]="item"></app-auction-card>
                  <!-- Extra status pill underneath -->
                  <div class="card-status-footer p-3 bg-subtle flex justify-between items-center">
                    @if (bidsSubTab === 'winning') {
                      <span class="badge badge-live">👑 You are currently in the lead</span>
                    } @else if (bidsSubTab === 'outbid') {
                      <span class="badge badge-urgent">⚠️ Outbid by competitor</span>
                      <a [routerLink]="['/auctions', item.id]" class="btn btn-primary btn-sm">Counter-bid</a>
                    } @else if (bidsSubTab === 'won') {
                      <span class="badge" style="background:#dcfce7; color:#15803d;">🏆 Winner</span>
                      <a [routerLink]="['/checkout', item.id]" class="btn btn-accent btn-sm">Pay &amp; Checkout</a>
                    } @else {
                      <span class="badge badge-ended">Auction Concluded</span>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-tab card p-8 text-center">
              <i class="bi bi-inbox text-4xl text-muted mb-2"></i>
              <h3>No auctions in this tab</h3>
              <p class="text-sm text-secondary mb-4">Start bidding on active lots to track your live status here.</p>
              <a routerLink="/auctions" class="btn btn-primary btn-sm">Explore Live Auctions</a>
            </div>
          }
        </div>
      }

      <!-- TAB 2: WATCHLIST -->
      @if (currentTab === 'watchlist') {
        <div class="watchlist-tab-content">
          @if (watchlistedAuctions.length > 0) {
            <div class="grid grid-cols-4">
              @for (item of watchlistedAuctions; track item.id) {
                <app-auction-card [auction]="item"></app-auction-card>
              }
            </div>
          } @else {
            <div class="empty-tab card p-8 text-center">
              <i class="bi bi-heart text-4xl text-muted mb-2"></i>
              <h3>Your Watchlist is Empty</h3>
              <p class="text-sm text-secondary mb-4">Click the heart icon on any auction card to save lots you're tracking.</p>
              <a routerLink="/auctions" class="btn btn-primary btn-sm">Discover Rare Lots</a>
            </div>
          }
        </div>
      }

      <!-- TAB 3: WALLET & TRANSACTION LEDGER -->
      @if (currentTab === 'wallet') {
        <div class="wallet-tab-content">
          <div class="wallet-summary-grid mb-6">
            <div class="card p-6 flex justify-between items-center">
              <div>
                <span class="text-xs text-muted text-uppercase font-bold">Total Available Balance</span>
                <div class="text-3xl font-bold text-primary mt-1">{{ auth.currentUser()?.wallet | currencyINR }}</div>
                <div class="text-xs text-muted mt-1">Ready for real-time bids and instant buyouts</div>
              </div>
              <button class="btn btn-primary" (click)="isWalletModalOpen = true">
                <i class="bi bi-credit-card-2-front"></i> Top Up Balance
              </button>
            </div>
          </div>

          <h3 class="section-title mb-3">Transaction History Ledger</h3>
          <div class="card overflow-hidden">
            <table class="table-full">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date &amp; Time</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                </tr>
              </thead>
              <tbody>
                @for (tx of walletSvc.transactions(); track tx.id) {
                  <tr>
                    <td class="font-mono text-xs">{{ tx.id }}</td>
                    <td>
                      <span class="badge" [class.badge-live]="tx.type === 'CREDIT'" [class.badge-urgent]="tx.type === 'DEBIT'">
                        {{ tx.type }}
                      </span>
                    </td>
                    <td class="text-sm">{{ tx.description }}</td>
                    <td class="text-xs text-muted">{{ tx.timestamp | date:'medium' }}</td>
                    <td class="font-bold" [class.text-success]="tx.type === 'CREDIT'" [class.text-danger]="tx.type === 'DEBIT'">
                      {{ tx.type === 'CREDIT' ? '+' : '-' }}{{ tx.amount | currencyINR }}
                    </td>
                    <td class="font-bold text-sm">{{ tx.balanceAfter | currencyINR }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center p-6 text-muted">No transactions recorded yet</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 4: NOTIFICATIONS -->
      @if (currentTab === 'notifications') {
        <div class="notifications-tab-content card p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="section-title">All Notifications</h3>
            @if (notifSvc.unreadCount() > 0) {
              <button class="btn btn-secondary btn-sm" (click)="notifSvc.markAllAsRead()">
                <i class="bi bi-check2-all"></i> Mark All as Read
              </button>
            }
          </div>

          <div class="notif-full-list">
            @for (n of notifSvc.notifications(); track n.id) {
              <div class="notif-row p-4 card mb-3 flex items-start justify-between gap-4" [class.unread]="!n.read">
                <div class="flex items-start gap-3">
                  <div class="notif-badge-icon" [ngClass]="'icon-' + n.type">
                    <i class="bi" [class.bi-exclamation-triangle-fill]="n.type === 'outbid'"
                       [class.bi-hourglass-split]="n.type === 'ending'"
                       [class.bi-trophy-fill]="n.type === 'won'"
                       [class.bi-wallet2]="n.type === 'wallet'"
                       [class.bi-info-circle-fill]="n.type === 'system'"></i>
                  </div>
                  <div>
                    <h4 class="notif-h font-bold text-sm">{{ n.title }}</h4>
                    <p class="notif-m text-sm text-secondary mt-1">{{ n.message }}</p>
                    <span class="text-xs text-muted mt-2 block">{{ n.time | timeAgo }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  @if (n.auctionId) {
                    <a [routerLink]="['/auctions', n.auctionId]" class="btn btn-secondary btn-sm">
                      View Lot <i class="bi bi-arrow-right"></i>
                    </a>
                  }
                  <button class="btn btn-ghost btn-sm" (click)="notifSvc.remove(n.id)" title="Dismiss">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center text-muted">
                <i class="bi bi-bell-slash text-4xl mb-2"></i>
                <p>You have no notifications at this time.</p>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Reusable Top-up Modal -->
    <app-modal [isOpen]="isWalletModalOpen" title="Top Up BidBazaar Wallet" (close)="isWalletModalOpen = false">
      <div body>
        <p class="text-muted text-sm mb-4">
          Add instant simulated test funds to your browser wallet balance.
        </p>
        <div class="current-bal mb-3">
          <span>Current Balance: </span>
          <strong>{{ auth.currentUser()?.wallet | currencyINR }}</strong>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-4">
          <button type="button" class="btn btn-secondary" (click)="topUpAmount = 25000">+₹25,000</button>
          <button type="button" class="btn btn-secondary" (click)="topUpAmount = 50000">+₹50,000</button>
          <button type="button" class="btn btn-secondary" (click)="topUpAmount = 100000">+₹1,00,000</button>
          <button type="button" class="btn btn-secondary" (click)="topUpAmount = 250000">+₹2,50,000</button>
        </div>

        <div class="form-group">
          <label class="form-label">Top Up Amount (₹):</label>
          <input type="number" class="form-control" [(ngModel)]="topUpAmount" />
        </div>
      </div>
      <div footer>
        <button class="btn btn-secondary" (click)="isWalletModalOpen = false">Cancel</button>
        <button class="btn btn-primary" (click)="confirmWalletTopUp()">Add ₹{{ topUpAmount.toLocaleString('en-IN') }}</button>
      </div>
    </app-modal>
  `,
  styles: [`
    .dashboard-page {
      padding-top: 30px;
      padding-bottom: 60px;
    }
    .dashboard-hero {
      padding: 24px 28px;
    }
    .user-avatar-lg {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--primary-border);
    }
    .user-name {
      font-size: 24px;
      font-weight: 800;
    }
    .user-role-pill {
      font-size: 11px;
      padding: 2px 10px;
      background: var(--primary-light);
      color: var(--primary);
    }
    .wallet-stat-card {
      background: var(--bg-subtle);
      border: 1px solid var(--border-subtle);
      padding: 14px 20px;
      border-radius: var(--radius-md);
    }
    .wallet-icon-box {
      font-size: 26px;
      color: var(--primary);
    }
    .wallet-balance-val {
      font-size: 22px;
      font-weight: 800;
      font-family: var(--font-heading);
      color: var(--text-primary);
    }
    .dashboard-tabs {
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 8px;
      overflow-x: auto;
    }
    .dash-tab-btn {
      background: transparent;
      border: 0;
      font-family: var(--font-body);
      font-size: 14px;
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
    .tab-badge {
      background: var(--danger);
      color: #fff;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: var(--radius-full);
    }
    .sub-tabs {
      overflow-x: auto;
    }
    .sub-tab-pill {
      background: var(--bg-subtle);
      border: 1px solid var(--border-subtle);
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
    }
    .sub-tab-pill.active {
      background: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary-border);
    }
    .table-full {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    .table-full th, .table-full td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }
    .table-full th {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--bg-subtle);
      text-transform: uppercase;
    }
    .notif-row.unread {
      background: rgba(79, 70, 229, 0.04);
      border-left: 4px solid var(--primary);
    }
    .notif-badge-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .icon-outbid { background: var(--danger-light); color: var(--danger); }
    .icon-ending { background: var(--warning-light); color: var(--warning); }
    .icon-won { background: var(--success-light); color: var(--success); }
    .icon-wallet { background: var(--info-light); color: var(--info); }
    .icon-system { background: var(--bg-hover); color: var(--text-secondary); }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  svc = inject(AuctionService);
  notifSvc = inject(NotificationService);
  walletSvc = inject(WalletService);
  private route = inject(ActivatedRoute);

  currentTab: 'bids' | 'watchlist' | 'wallet' | 'notifications' = 'bids';
  bidsSubTab: 'winning' | 'outbid' | 'won' | 'lost' = 'winning';

  isWalletModalOpen = false;
  topUpAmount = 50000;

  get currentUser(): string {
    return this.auth.currentUser()?.name || '';
  }

  // User participated auctions
  get userParticipatedAuctions(): Auction[] {
    const user = this.currentUser;
    return this.svc.auctions().filter(a => a.bids?.some(b => b.bidder === user));
  }

  // Winning: active auction and user is highest bidder
  get winningAuctions(): Auction[] {
    const user = this.currentUser;
    return this.svc.activeAuctions().filter(a => this.svc.getHighestBidder(a) === user);
  }

  // Outbid: active auction where user placed a bid, but is not currently highest bidder
  get outbidAuctions(): Auction[] {
    const user = this.currentUser;
    return this.svc.activeAuctions().filter(a => {
      const isLeader = this.svc.getHighestBidder(a) === user;
      const hasBid = a.bids?.some(b => b.bidder === user);
      return hasBid && !isLeader;
    });
  }

  // Won: auction ended/sold and highest bidder or soldTo was user
  get wonAuctions(): Auction[] {
    const user = this.currentUser;
    return this.svc.endedAuctions().filter(a => a.soldTo === user || this.svc.getHighestBidder(a) === user);
  }

  // Lost: ended auction where user bid, but didn't win
  get lostAuctions(): Auction[] {
    const user = this.currentUser;
    return this.svc.endedAuctions().filter(a => {
      const hasBid = a.bids?.some(b => b.bidder === user);
      const isWinner = a.soldTo === user || this.svc.getHighestBidder(a) === user;
      return hasBid && !isWinner;
    });
  }

  get currentBidsList(): Auction[] {
    switch (this.bidsSubTab) {
      case 'winning': return this.winningAuctions;
      case 'outbid': return this.outbidAuctions;
      case 'won': return this.wonAuctions;
      case 'lost': return this.lostAuctions;
    }
  }

  get watchlistedAuctions(): Auction[] {
    const ids = this.svc.watchlist();
    return this.svc.auctions().filter(a => ids.includes(a.id));
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.currentTab = params['tab'];
      }
    });
  }

  confirmWalletTopUp() {
    if (this.topUpAmount <= 0) return;
    this.walletSvc.addFunds(this.topUpAmount);
    this.svc.showToast(`₹${this.topUpAmount.toLocaleString('en-IN')} added to your wallet!`, 'success');
    this.isWalletModalOpen = false;
  }
}

