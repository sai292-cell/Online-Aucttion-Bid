import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuctionService } from '../../core/services/auction.service';
import { AuctionCardComponent } from '../../shared/components/auction-card/auction-card.component';
import { CountdownTimerComponent } from '../../shared/components/countdown-timer/countdown-timer.component';
import { CurrencyINRPipe } from '../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    AuctionCardComponent,
    CountdownTimerComponent,
    CurrencyINRPipe
  ],
  template: `
    <div class="home-page">
      <!-- Hero Banner -->
      <section class="hero-section">
        <div class="container hero-container">
          <div class="hero-content">
            <div class="hero-badge">
              <span class="live-dot"></span>
              <span>Next-Gen Online Auction Platform</span>
            </div>
            <h1 class="hero-title">
              Discover, Bid & Win <br/>
              <span class="gradient-text">Exceptional Treasures.</span>
            </h1>
            <p class="hero-subtitle">
              Live simulated bidding platform for luxury watches, rare art, high-end electronics, vintage automobiles and museum collectibles. Featuring automated proxy bidding and anti-sniping protection.
            </p>

            <!-- Search Bar in Hero -->
            <div class="hero-search-box">
              <div class="hero-input-group">
                <i class="bi bi-search hero-search-icon"></i>
                <input
                  type="text"
                  placeholder="What are you bidding on today? (e.g. Rolex, Leica, Jordan...)"
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="onSearch()"
                />
                <button class="btn btn-primary hero-btn" (click)="onSearch()">
                  <span>Search Lots</span>
                  <i class="bi bi-arrow-right"></i>
                </button>
              </div>
              <div class="trending-tags flex items-center gap-2">
                <span class="tags-label">Trending:</span>
                <button class="tag-pill" (click)="searchTag('Rolex')">Rolex</button>
                <button class="tag-pill" (click)="searchTag('Cricket Bat')">2011 WC Bat</button>
                <button class="tag-pill" (click)="searchTag('MacBook')">MacBook M3</button>
                <button class="tag-pill" (click)="searchTag('Gibson')">Gibson 1959</button>
              </div>
            </div>

            <!-- Live Metrics Stats Row -->
            <div class="stats-row">
              <div class="stat-card">
                <div class="stat-number">{{ svc.activeAuctions().length }}</div>
                <div class="stat-label">Active Auctions</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ svc.totalBidsCount() }}+</div>
                <div class="stat-label">Total Bids Placed</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ svc.uniqueBiddersCount() }}</div>
                <div class="stat-label">Simulated Bidders</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ svc.totalVolume() | currencyINR }}</div>
                <div class="stat-label">Total Lot Volume</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Ending Soon Carousel Banner -->
      @if (svc.endingSoonAuctions().length > 0) {
        <section class="section container">
          <div class="section-header flex justify-between items-center">
            <div>
              <div class="flex items-center gap-2">
                <span class="badge badge-urgent">CLOSING SOON</span>
                <h2 class="section-title">Final Minutes: Last Chance to Bid</h2>
              </div>
              <p class="section-subtitle">Real-time anti-sniping enabled. Bids placed in final 60 seconds extend timer by 2 minutes!</p>
            </div>
            <a routerLink="/auctions" class="view-all-btn">
              View All Live Lots ({{ svc.activeAuctions().length }}) <i class="bi bi-chevron-right"></i>
            </a>
          </div>

          <div class="ending-soon-grid">
            @for (auction of svc.endingSoonAuctions().slice(0, 4); track auction.id) {
              <div class="urgent-lot-card card flex">
                <img [src]="auction.images[0]" [alt]="auction.title" class="urgent-thumb" />
                <div class="urgent-info flex-1">
                  <div class="flex justify-between items-center">
                    <span class="urgent-cat">{{ auction.category }}</span>
                    <app-countdown-timer [endTime]="auction.endTime" [compact]="true"></app-countdown-timer>
                  </div>
                  <h4 class="urgent-title">
                    <a [routerLink]="['/auctions', auction.id]">{{ auction.title }}</a>
                  </h4>
                  <div class="flex justify-between items-end mt-auto">
                    <div>
                      <div class="text-xs text-muted">Current Bid</div>
                      <div class="urgent-price">{{ svc.getCurrentPrice(auction) | currencyINR }}</div>
                    </div>
                    <a [routerLink]="['/auctions', auction.id]" class="btn btn-primary btn-sm">
                      <i class="bi bi-hammer"></i> Bid
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Explore Categories Grid -->
      <section class="section container">
        <div class="section-header">
          <h2 class="section-title">Browse By Premier Category</h2>
          <p class="section-subtitle">Curated collections inspected by certified specialists</p>
        </div>

        <div class="categories-grid">
          @for (cat of svc.categories(); track cat.id) {
            <div class="category-tile card" (click)="goToCategory(cat.name)">
              <div class="cat-icon-circle">
                <i class="bi" [ngClass]="cat.icon"></i>
              </div>
              <h3 class="cat-name">{{ cat.name }}</h3>
              <p class="cat-desc">{{ cat.description }}</p>
              <div class="cat-count">
                {{ getCategoryCount(cat.name) }} active auctions
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Featured Auctions Section -->
      <section class="section container">
        <div class="section-header flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge" style="background:#e0e7ff; color:#3730a3;">FEATURED LOTS</span>
              <h2 class="section-title">Curated High-Value Highlights</h2>
            </div>
            <p class="section-subtitle">Authenticated collector items attracting active bidding right now</p>
          </div>
          <a routerLink="/auctions" class="view-all-btn">
            View All Auctions <i class="bi bi-chevron-right"></i>
          </a>
        </div>

        <div class="grid grid-cols-4">
          @for (auction of svc.featuredAuctions().slice(0, 8); track auction.id) {
            <app-auction-card [auction]="auction"></app-auction-card>
          }
        </div>
      </section>

      <!-- "Hot Right Now" (Most Bids) -->
      <section class="section container">
        <div class="section-header flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge" style="background:#fee2e2; color:#b91c1c;">🔥 HOT RIGHT NOW</span>
              <h2 class="section-title">Most Popular Bidding Wars</h2>
            </div>
            <p class="section-subtitle">Highest bid count activity in the marketplace</p>
          </div>
          <a routerLink="/auctions" class="view-all-btn">
            See All Lots <i class="bi bi-chevron-right"></i>
          </a>
        </div>

        <div class="grid grid-cols-4">
          @for (auction of svc.hotAuctions().slice(0, 4); track auction.id) {
            <app-auction-card [auction]="auction"></app-auction-card>
          }
        </div>
      </section>

      <!-- Trust & Features Banner -->
      <section class="trust-section">
        <div class="container">
          <div class="trust-grid">
            <div class="trust-item">
              <div class="trust-icon"><i class="bi bi-cpu-fill"></i></div>
              <h4 class="trust-title">Simulated Real-Time Bids</h4>
              <p class="trust-desc">Dynamic RxJS interval simulation where 8 bot bidders place smart competitive bids every few seconds.</p>
            </div>
            <div class="trust-item">
              <div class="trust-icon"><i class="bi bi-stopwatch-fill"></i></div>
              <h4 class="trust-title">Anti-Sniping Engine</h4>
              <p class="trust-desc">Fair play guarantee: Any bid submitted within the last 60 seconds automatically extends the auction clock by 2 minutes.</p>
            </div>
            <div class="trust-item">
              <div class="trust-icon"><i class="bi bi-robot"></i></div>
              <h4 class="trust-title">Proxy / Auto-Bidding</h4>
              <p class="trust-desc">Set your personal maximum ceiling and let BidBazaar automatically outbid competitors incrementally.</p>
            </div>
            <div class="trust-item">
              <div class="trust-icon"><i class="bi bi-shield-check"></i></div>
              <h4 class="trust-title">End-to-End Checkout</h4>
              <p class="trust-desc">Instant winning invoice generation, mock wallet / UPI payment, and delivery status tracking timeline.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero-section {
      position: relative;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%);
      padding: 60px 0 50px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .hero-container {
      max-width: 900px;
      text-align: center;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      font-size: 12px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 20px;
      box-shadow: var(--shadow-sm);
    }
    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      display: inline-block;
      animation: pulse-dot 1.5s infinite;
    }
    .hero-title {
      font-size: 46px;
      font-weight: 800;
      line-height: 1.18;
      letter-spacing: -1px;
      margin-bottom: 18px;
    }
    .gradient-text {
      background: linear-gradient(135deg, #4f46e5 0%, #d97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 16px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 32px;
      max-width: 760px;
      margin-left: auto;
      margin-right: auto;
    }
    .hero-search-box {
      max-width: 680px;
      margin: 0 auto 40px;
    }
    .hero-input-group {
      position: relative;
      display: flex;
      background: var(--bg-surface);
      border: 2px solid var(--primary-border);
      border-radius: var(--radius-full);
      padding: 6px 8px 6px 20px;
      box-shadow: var(--shadow-lg);
      transition: var(--transition);
    }
    .hero-input-group:focus-within {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2);
    }
    .hero-search-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 18px;
    }
    .hero-input-group input {
      flex: 1;
      border: 0;
      outline: none;
      background: transparent;
      padding-left: 28px;
      font-size: 15px;
      color: var(--text-primary);
    }
    .hero-btn {
      border-radius: var(--radius-full);
      padding: 10px 22px;
      font-weight: 700;
    }
    .trending-tags {
      margin-top: 14px;
      justify-content: center;
      font-size: 12.5px;
    }
    .tags-label {
      color: var(--text-muted);
      font-weight: 600;
    }
    .tag-pill {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      padding: 3px 12px;
      font-size: 12px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition);
    }
    .tag-pill:hover {
      border-color: var(--primary);
      color: var(--primary);
      background: var(--primary-light);
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid var(--border-subtle);
    }
    .stat-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px 12px;
      box-shadow: var(--shadow-sm);
    }
    .stat-number {
      font-size: 22px;
      font-weight: 800;
      font-family: var(--font-heading);
      color: var(--primary);
    }
    .stat-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-top: 4px;
    }
    .section {
      margin-top: 54px;
    }
    .section-header {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 24px;
      font-weight: 800;
      margin-top: 4px;
    }
    .section-subtitle {
      font-size: 13.5px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    .view-all-btn {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--primary);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .view-all-btn:hover {
      text-decoration: underline;
    }
    .ending-soon-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
    }
    .urgent-lot-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      padding: 12px;
      gap: 16px;
      align-items: center;
    }
    .urgent-thumb {
      width: 130px;
      height: 110px;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }
    .urgent-cat {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--primary);
    }
    .urgent-title {
      font-size: 14.5px;
      font-weight: 600;
      margin: 6px 0 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .urgent-price {
      font-size: 17px;
      font-weight: 800;
      color: var(--text-primary);
      font-family: var(--font-heading);
    }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .category-tile {
      padding: 22px 18px;
      text-align: center;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .category-tile:hover {
      transform: translateY(-4px);
      border-color: var(--primary);
      box-shadow: var(--shadow-lg);
    }
    .cat-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 12px;
      transition: var(--transition);
    }
    .category-tile:hover .cat-icon-circle {
      background: var(--primary);
      color: #fff;
    }
    .cat-name {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .cat-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: 12px;
      min-height: 34px;
    }
    .cat-count {
      font-size: 11.5px;
      font-weight: 700;
      color: var(--primary);
      background: var(--bg-subtle);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      margin-top: auto;
    }
    .trust-section {
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);
      border-bottom: 1px solid var(--border-subtle);
      padding: 50px 0;
      margin-top: 70px;
    }
    .trust-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    .trust-item {
      text-align: center;
      padding: 10px;
    }
    .trust-icon {
      font-size: 32px;
      color: var(--primary);
      margin-bottom: 14px;
    }
    .trust-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .trust-desc {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    @media (max-width: 900px) {
      .hero-title { font-size: 32px; }
      .stats-row, .categories-grid, .trust-grid, .ending-soon-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
  svc = inject(AuctionService);
  private router = inject(Router);

  searchQuery = '';

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/auctions'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/auctions']);
    }
  }

  searchTag(tag: string) {
    this.router.navigate(['/auctions'], { queryParams: { q: tag } });
  }

  goToCategory(categoryName: string) {
    this.router.navigate(['/auctions'], { queryParams: { cat: categoryName } });
  }

  getCategoryCount(categoryName: string): number {
    return this.svc.activeAuctions().filter(a => a.category.toLowerCase() === categoryName.toLowerCase()).length;
  }
}

