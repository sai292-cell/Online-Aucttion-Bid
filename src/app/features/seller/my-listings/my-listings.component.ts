import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuctionService } from '../../../core/services/auction.service';
import { AuthService } from '../../../core/services/auth.service';
import { Auction } from '../../../core/models/auction.model';
import { CountdownTimerComponent } from '../../../shared/components/countdown-timer/countdown-timer.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CurrencyINRPipe } from '../../../shared/pipes/currency-inr.pipe';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CountdownTimerComponent, ModalComponent, CurrencyINRPipe, TimeAgoPipe],
  template: `
    <div class="seller-listings-page container">
      <!-- Seller Hero & Stats Cards -->
      <div class="seller-header flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 class="page-title">Seller Hub &amp; Inventory</h1>
          <p class="text-sm text-secondary">Manage your auction lots, monitor bids and analyze sales performance</p>
        </div>
        <a routerLink="/seller/new" class="btn btn-primary">
          <i class="bi bi-plus-lg"></i> Consign New Lot
        </a>
      </div>

      <!-- Seller Metrics Cards -->
      <div class="seller-metrics-grid mb-8">
        <div class="metric-card card p-5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs text-muted text-uppercase font-bold">Total Sales Realized</span>
              <div class="metric-value text-primary mt-1">{{ totalSalesRevenue | currencyINR }}</div>
            </div>
            <div class="metric-icon"><i class="bi bi-cash-stack"></i></div>
          </div>
          <span class="text-xs text-success mt-2 block"><i class="bi bi-arrow-up-right"></i> Guaranteed Escrow Payouts</span>
        </div>

        <div class="metric-card card p-5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs text-muted text-uppercase font-bold">Active Live Lots</span>
              <div class="metric-value text-warning mt-1">{{ activeListings.length }}</div>
            </div>
            <div class="metric-icon"><i class="bi bi-broadcast"></i></div>
          </div>
          <span class="text-xs text-muted mt-2 block">Under real-time simulated bidding</span>
        </div>

        <div class="metric-card card p-5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs text-muted text-uppercase font-bold">Sold / Completed Lots</span>
              <div class="metric-value text-success mt-1">{{ soldListings.length }}</div>
            </div>
            <div class="metric-icon"><i class="bi bi-check-circle"></i></div>
          </div>
          <span class="text-xs text-muted mt-2 block">100% fulfillment rate</span>
        </div>

        <div class="metric-card card p-5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs text-muted text-uppercase font-bold">Bids Attracted</span>
              <div class="metric-value text-info mt-1">{{ totalBidsReceived }}</div>
            </div>
            <div class="metric-icon"><i class="bi bi-hammer"></i></div>
          </div>
          <span class="text-xs text-muted mt-2 block">Competitive auction interest</span>
        </div>
      </div>

      <!-- Status Tabs: Active, Ended, Sold -->
      <div class="listings-tabs flex gap-2 mb-6">
        <button
          class="dash-tab-btn"
          [class.active]="activeTab === 'active'"
          (click)="activeTab = 'active'"
        >
          <span class="live-dot"></span> Active Lots ({{ activeListings.length }})
        </button>
        <button
          class="dash-tab-btn"
          [class.active]="activeTab === 'sold'"
          (click)="activeTab = 'sold'"
        >
          <i class="bi bi-trophy"></i> Sold Lots ({{ soldListings.length }})
        </button>
        <button
          class="dash-tab-btn"
          [class.active]="activeTab === 'ended'"
          (click)="activeTab = 'ended'"
        >
          <i class="bi bi-clock-history"></i> Ended / Unsold ({{ endedListings.length }})
        </button>
      </div>

      <!-- Listings Table -->
      <div class="card overflow-hidden">
        <table class="listings-table">
          <thead>
            <tr>
              <th>Lot Details</th>
              <th>Category</th>
              <th>Starting Price</th>
              <th>Current Bid</th>
              <th>Bids</th>
              <th>Status / Remaining</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (item of currentList; track item.id) {
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <img [src]="item.images[0]" [alt]="item.title" class="lot-thumb" />
                    <div>
                      <h4 class="font-bold text-sm">
                        <a [routerLink]="['/auctions', item.id]">{{ item.title }}</a>
                      </h4>
                      <span class="text-xs text-muted">Lot #{{ item.id }} • {{ item.condition }}</span>
                    </div>
                  </div>
                </td>
                <td class="text-sm">{{ item.category }}</td>
                <td class="text-sm">{{ item.startPrice | currencyINR }}</td>
                <td class="font-bold text-primary">{{ svc.getCurrentPrice(item) | currencyINR }}</td>
                <td>
                  <span class="badge" style="background:var(--bg-subtle);">{{ item.bids.length }} bids</span>
                </td>
                <td>
                  @if (item.isSold) {
                    <span class="badge badge-sold">SOLD</span>
                  } @else if (svc.isAuctionEnded(item)) {
                    <span class="badge badge-ended">ENDED</span>
                  } @else {
                    <app-countdown-timer [endTime]="item.endTime" [compact]="true"></app-countdown-timer>
                  }
                </td>
                <td class="text-right">
                  <div class="flex justify-end gap-2">
                    <button class="btn btn-secondary btn-sm" (click)="openEditModal(item)">
                      <i class="bi bi-pencil"></i> Edit
                    </button>
                    <!-- Cancel only allowed if NO bids have been placed -->
                    <button
                      class="btn btn-danger btn-sm"
                      [disabled]="item.bids.length > 0"
                      [title]="item.bids.length > 0 ? 'Cannot delete listing with active bids' : 'Delete listing'"
                      (click)="confirmDelete(item)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="text-center p-8 text-muted">
                  No listings found in this tab.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Edit Listing Modal -->
      <app-modal [isOpen]="isEditModalOpen" title="Edit Listing Details" (close)="isEditModalOpen = false">
        <div body>
          @if (editingItem) {
            <div class="form-group">
              <label class="form-label">Lot Title</label>
              <input type="text" class="form-control" [(ngModel)]="editingItem.title" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea rows="4" class="form-control" [(ngModel)]="editingItem.description"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label">Buy Now Price (₹)</label>
                <input type="number" class="form-control" [(ngModel)]="editingItem.buyNowPrice" />
              </div>
              <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="form-control" [(ngModel)]="editingItem.location" />
              </div>
            </div>
          }
        </div>
        <div footer>
          <button class="btn btn-secondary" (click)="isEditModalOpen = false">Cancel</button>
          <button class="btn btn-primary" (click)="saveEditedItem()">Save Changes</button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .seller-listings-page {
      padding-top: 30px;
      padding-bottom: 60px;
    }
    .page-title {
      font-size: 28px;
      font-weight: 800;
    }
    .seller-metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .metric-value {
      font-size: 22px;
      font-weight: 800;
      font-family: var(--font-heading);
    }
    .metric-icon {
      font-size: 24px;
      color: var(--text-muted);
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
      border-color: var(--primary);
    }
    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      display: inline-block;
    }
    .listings-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    .listings-table th, .listings-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }
    .listings-table th {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      background: var(--bg-subtle);
    }
    .lot-thumb {
      width: 50px;
      height: 50px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    @media (max-width: 900px) {
      .seller-metrics-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class MyListingsComponent implements OnInit {
  svc = inject(AuctionService);
  auth = inject(AuthService);

  activeTab: 'active' | 'sold' | 'ended' = 'active';

  isEditModalOpen = false;
  editingItem: Auction | null = null;

  get currentSellerName(): string {
    return this.auth.currentUser()?.name || '';
  }

  get myAuctions(): Auction[] {
    const name = this.currentSellerName.toLowerCase();
    // Match either seller's name or if seller account
    return this.svc.auctions().filter(a =>
      a.seller.toLowerCase() === name ||
      (this.auth.isSeller() && a.seller.toLowerCase().includes('heritage')) ||
      (this.auth.isSeller() && a.seller.toLowerCase().includes('cybertech'))
    );
  }

  get activeListings(): Auction[] {
    const now = this.svc.currentTime();
    return this.myAuctions.filter(a => !a.isSold && a.endTime > now);
  }

  get soldListings(): Auction[] {
    return this.myAuctions.filter(a => !!a.isSold);
  }

  get endedListings(): Auction[] {
    const now = this.svc.currentTime();
    return this.myAuctions.filter(a => !a.isSold && a.endTime <= now);
  }

  get currentList(): Auction[] {
    switch (this.activeTab) {
      case 'active': return this.activeListings;
      case 'sold': return this.soldListings;
      case 'ended': return this.endedListings;
    }
  }

  get totalSalesRevenue(): number {
    return this.soldListings.reduce((sum, a) => sum + (a.soldAmount || this.svc.getCurrentPrice(a)), 0);
  }

  get totalBidsReceived(): number {
    return this.myAuctions.reduce((sum, a) => sum + (a.bids?.length || 0), 0);
  }

  ngOnInit() {}

  openEditModal(item: Auction) {
    this.editingItem = { ...item };
    this.isEditModalOpen = true;
  }

  saveEditedItem() {
    if (!this.editingItem) return;
    this.svc.updateAuction(this.editingItem);
    this.isEditModalOpen = false;
  }

  confirmDelete(item: Auction) {
    if (confirm(`Are you sure you want to cancel and remove listing '${item.title}'?`)) {
      this.svc.deleteAuction(item.id);
    }
  }
}

