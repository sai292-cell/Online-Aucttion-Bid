import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auction } from '../../../core/models/auction.model';
import { AuctionService } from '../../../core/services/auction.service';
import { CurrencyINRPipe } from '../../pipes/currency-inr.pipe';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';

@Component({
  selector: 'app-auction-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyINRPipe, CountdownTimerComponent],
  template: `
    <div class="auction-card card" [class.is-ended]="isEnded" [class.is-sold]="auction.isSold">
      <!-- Media Header -->
      <div class="card-media">
        <img
          [src]="auction.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'"
          [alt]="auction.title"
          loading="lazy"
        />

        <!-- Overlay Badges -->
        <div class="media-badges-top">
          <span class="badge condition-badge">{{ auction.condition }}</span>
          @if (auction.isSold) {
            <span class="badge badge-sold">SOLD</span>
          } @else if (isEnded) {
            <span class="badge badge-ended">ENDED</span>
          } @else if (svc.isUrgent(auction)) {
            <span class="badge badge-urgent">URGENT</span>
          } @else {
            <span class="badge badge-live">LIVE</span>
          }
        </div>

        <!-- Watchlist Button -->
        <button
          type="button"
          class="watchlist-btn"
          [class.active]="isWatchlisted"
          (click)="onToggleWatch($event)"
          title="Add to Watchlist"
          aria-label="Add to Watchlist"
        >
          <i class="bi" [class.bi-heart-fill]="isWatchlisted" [class.bi-heart]="!isWatchlisted"></i>
        </button>

        <!-- Timer Pill -->
        <div class="media-timer">
          <app-countdown-timer [endTime]="auction.endTime" [compact]="true"></app-countdown-timer>
        </div>
      </div>

      <!-- Content Body -->
      <div class="card-body">
        <div class="category-meta">
          <span class="category-name">{{ auction.category }}</span>
          <span class="location"><i class="bi bi-geo-alt"></i> {{ auction.location.split(',')[0] }}</span>
        </div>

        <h4 class="card-title" [title]="auction.title">
          <a [routerLink]="['/auctions', auction.id]">{{ auction.title }}</a>
        </h4>

        <!-- Price & Bids Row -->
        <div class="pricing-row">
          <div>
            <div class="price-label">{{ isEnded ? 'Final Bid' : 'Current Bid' }}</div>
            <div class="current-price">{{ currentPrice | currencyINR }}</div>
          </div>
          <div class="bids-count">
            <i class="bi bi-hammer"></i>
            <span>{{ auction.bids.length }} bids</span>
          </div>
        </div>

        <!-- Leader / Status Row -->
        <div class="card-footer-meta">
          @if (leader) {
            <div class="leader-info">
              <span class="leader-label">Leader:</span>
              <span class="leader-name">{{ leader }}</span>
            </div>
          } @else {
            <span class="no-bids-yet">No bids yet • Start bid</span>
          }
          
          <a [routerLink]="['/auctions', auction.id]" class="view-link">
            <span>{{ isEnded ? 'View Result' : 'Place Bid' }}</span>
            <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auction-card {
      position: relative;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .auction-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
      border-color: var(--primary-border);
    }

    .card-media {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: var(--bg-subtle);
    }

    .card-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
    }

    .auction-card:hover .card-media img {
      transform: scale(1.05);
    }

    .media-badges-top {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 6px;
      z-index: 2;
    }

    .condition-badge {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      color: #fff;
    }

    .watchlist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-muted);
      transition: var(--transition);
      z-index: 3;
    }

    .watchlist-btn:hover {
      transform: scale(1.1);
      color: #ef4444;
    }

    .watchlist-btn.active {
      color: #ef4444;
      background: #fee2e2;
      border-color: #fca5a5;
    }

    .media-timer {
      position: absolute;
      bottom: 10px;
      left: 10px;
      z-index: 2;
    }

    .card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .category-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11.5px;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .category-name {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--primary);
    }

    .location {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .card-title {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.35;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 40px;
    }

    .card-title a:hover {
      color: var(--primary);
    }

    .pricing-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding-top: 10px;
      border-top: 1px dashed var(--border-subtle);
      margin-top: auto;
    }

    .price-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .current-price {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-primary);
      font-family: var(--font-heading);
    }

    .bids-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-subtle);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
    }

    .card-footer-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--border-subtle);
      font-size: 12px;
    }

    .leader-info {
      display: flex;
      align-items: center;
      gap: 4px;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .leader-label {
      color: var(--text-muted);
    }

    .leader-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .no-bids-yet {
      color: var(--text-muted);
      font-style: italic;
    }

    .view-link {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      color: var(--primary);
      font-size: 12.5px;
    }

    .view-link:hover {
      text-decoration: underline;
    }

    .is-ended {
      opacity: 0.85;
    }
  `]
})
export class AuctionCardComponent {
  svc = inject(AuctionService);

  @Input({ required: true }) auction!: Auction;

  get currentPrice(): number {
    return this.svc.getCurrentPrice(this.auction);
  }

  get leader(): string | null {
    return this.svc.getHighestBidder(this.auction);
  }

  get isEnded(): boolean {
    return this.svc.isAuctionEnded(this.auction);
  }

  get isWatchlisted(): boolean {
    return this.svc.isWatchlisted(this.auction.id);
  }

  onToggleWatch(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.svc.toggleWatchlist(this.auction.id);
  }
}
