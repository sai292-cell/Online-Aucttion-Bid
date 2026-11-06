import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuctionService } from '../../../core/services/auction.service';
import { Auction } from '../../../core/models/auction.model';
import { AuctionCardComponent } from '../../../shared/components/auction-card/auction-card.component';
import { CountdownTimerComponent } from '../../../shared/components/countdown-timer/countdown-timer.component';
import { CurrencyINRPipe } from '../../../shared/pipes/currency-inr.pipe';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    AuctionCardComponent,
    CountdownTimerComponent,
    CurrencyINRPipe,
    SkeletonComponent
  ],
  template: `
    <div class="browse-page container">
      <!-- Page Header & Breadcrumbs -->
      <div class="browse-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <div class="breadcrumbs text-xs text-muted mb-1">
            <a routerLink="/">Home</a> <i class="bi bi-chevron-right"></i> <span>Browse Auctions</span>
          </div>
          <h1 class="page-title">
            {{ selectedCategory === 'all' ? 'All Live Auctions' : selectedCategory }}
            <span class="count-badge">({{ filteredAuctions.length }} results)</span>
          </h1>
        </div>

        <!-- Controls: View mode and Sort -->
        <div class="controls-bar flex items-center gap-3">
          <!-- Sort Dropdown -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted font-bold">Sort:</span>
            <select class="form-control sort-select" [(ngModel)]="sortBy" (change)="applyFilters()">
              <option value="endingSoon">Ending Soonest</option>
              <option value="newlyListed">Newly Listed</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="mostBids">Most Bids</option>
            </select>
          </div>

          <!-- View Toggle -->
          <div class="view-toggle-group">
            <button
              class="view-btn"
              [class.active]="viewMode === 'grid'"
              (click)="viewMode = 'grid'"
              title="Grid View"
            >
              <i class="bi bi-grid-fill"></i>
            </button>
            <button
              class="view-btn"
              [class.active]="viewMode === 'list'"
              (click)="viewMode = 'list'"
              title="List View"
            >
              <i class="bi bi-view-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Layout: Sidebar Filters + Main Listings -->
      <div class="browse-layout">
        <!-- Sidebar Filter Column -->
        <aside class="filters-sidebar card">
          <div class="sidebar-header flex justify-between items-center">
            <span class="font-bold flex items-center gap-2">
              <i class="bi bi-sliders"></i> Filter Lots
            </span>
            <button class="reset-link" (click)="resetFilters()">Clear All</button>
          </div>

          <!-- Search filter -->
          <div class="filter-group">
            <label class="filter-label">Search Keyword</label>
            <div class="filter-input-wrap">
              <input
                type="text"
                class="form-control filter-input"
                placeholder="Search lots..."
                [(ngModel)]="searchKeyword"
                (input)="applyFilters()"
              />
              @if (searchKeyword) {
                <button class="clear-btn" (click)="searchKeyword = ''; applyFilters()"><i class="bi bi-x"></i></button>
              }
            </div>
          </div>

          <!-- Category filter -->
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <select class="form-control" [(ngModel)]="selectedCategory" (change)="applyFilters()">
              <option value="all">All Categories</option>
              @for (cat of svc.categories(); track cat.id) {
                <option [value]="cat.name">{{ cat.name }}</option>
              }
            </select>
          </div>

          <!-- Price Slider -->
          <div class="filter-group">
            <div class="flex justify-between items-center mb-1">
              <label class="filter-label">Max Price Limit</label>
              <span class="price-val">{{ maxPrice | currencyINR }}</span>
            </div>
            <input
              type="range"
              class="price-slider"
              min="10000"
              max="2000000"
              step="10000"
              [(ngModel)]="maxPrice"
              (input)="applyFilters()"
            />
            <div class="flex justify-between text-xs text-muted mt-1">
              <span>₹10K</span>
              <span>₹20L+</span>
            </div>
          </div>

          <!-- Condition Filters -->
          <div class="filter-group">
            <label class="filter-label">Item Condition</label>
            <div class="checkbox-list">
              @for (cond of conditionsList; track cond) {
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [checked]="selectedConditions.includes(cond)"
                    (change)="toggleCondition(cond)"
                  />
                  <span>{{ cond }}</span>
                </label>
              }
            </div>
          </div>

          <!-- Quick Toggles -->
          <div class="filter-group">
            <label class="filter-label">Quick Filters</label>
            <label class="toggle-checkbox">
              <input type="checkbox" [(ngModel)]="onlyEndingWithinHour" (change)="applyFilters()" />
              <span>Ending within 1 hour</span>
            </label>
            <label class="toggle-checkbox">
              <input type="checkbox" [(ngModel)]="onlyNoBids" (change)="applyFilters()" />
              <span>Has no bids yet (Bargain)</span>
            </label>
            <label class="toggle-checkbox">
              <input type="checkbox" [(ngModel)]="onlyBuyNow" (change)="applyFilters()" />
              <span>Buy Now Available</span>
            </label>
          </div>
        </aside>

        <!-- Main Auction Content Area -->
        <main class="listings-content">
          <!-- Active filter pills -->
          @if (hasActiveFilters) {
            <div class="active-pills flex items-center gap-2 flex-wrap mb-4">
              <span class="text-xs text-muted font-bold">Active Filters:</span>
              @if (selectedCategory !== 'all') {
                <span class="filter-pill">
                  Category: {{ selectedCategory }}
                  <i class="bi bi-x" (click)="selectedCategory = 'all'; applyFilters()"></i>
                </span>
              }
              @if (searchKeyword) {
                <span class="filter-pill">
                  "{{ searchKeyword }}"
                  <i class="bi bi-x" (click)="searchKeyword = ''; applyFilters()"></i>
                </span>
              }
              @if (maxPrice < 2000000) {
                <span class="filter-pill">
                  Max: {{ maxPrice | currencyINR }}
                  <i class="bi bi-x" (click)="maxPrice = 2000000; applyFilters()"></i>
                </span>
              }
              @if (onlyEndingWithinHour) {
                <span class="filter-pill">
                  &lt;1 Hour
                  <i class="bi bi-x" (click)="onlyEndingWithinHour = false; applyFilters()"></i>
                </span>
              }
            </div>
          }

          <!-- Grid or List Display -->
          @if (paginatedAuctions.length > 0) {
            @if (viewMode === 'grid') {
              <div class="grid grid-cols-3">
                @for (auction of paginatedAuctions; track auction.id) {
                  <app-auction-card [auction]="auction"></app-auction-card>
                }
              </div>
            } @else {
              <!-- List View -->
              <div class="auction-list-view flex flex-col gap-3">
                @for (auction of paginatedAuctions; track auction.id) {
                  <div class="list-item-card card flex items-center">
                    <img [src]="auction.images[0]" [alt]="auction.title" class="list-thumb" />
                    <div class="list-body flex-1">
                      <div class="flex justify-between items-center">
                        <span class="badge badge-subtle">{{ auction.category }} • {{ auction.condition }}</span>
                        <app-countdown-timer [endTime]="auction.endTime" [compact]="true"></app-countdown-timer>
                      </div>
                      <h3 class="list-title">
                        <a [routerLink]="['/auctions', auction.id]">{{ auction.title }}</a>
                      </h3>
                      <p class="list-desc">{{ auction.description }}</p>
                      <div class="flex justify-between items-center mt-3">
                        <div class="flex items-center gap-4">
                          <div>
                            <span class="text-xs text-muted">Current Bid:</span>
                            <div class="list-price">{{ svc.getCurrentPrice(auction) | currencyINR }}</div>
                          </div>
                          <div class="bids-tag">
                            <i class="bi bi-hammer"></i> {{ auction.bids.length }} bids
                          </div>
                        </div>
                        <a [routerLink]="['/auctions', auction.id]" class="btn btn-primary btn-sm">
                          Bid Now <i class="bi bi-arrow-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Pagination Bar -->
            <div class="pagination-bar flex justify-between items-center">
              <span class="pagination-info text-xs text-muted">
                Showing {{ (currentPage - 1) * pageSize + 1 }} to
                {{ getMinNumber(currentPage * pageSize, filteredAuctions.length) }}
                of {{ filteredAuctions.length }} auctions
              </span>

              <div class="pagination-nav flex items-center gap-1">
                <button
                  class="btn btn-secondary btn-sm"
                  [disabled]="currentPage === 1"
                  (click)="goToPage(currentPage - 1)"
                >
                  <i class="bi bi-chevron-left"></i> Prev
                </button>

                @for (p of totalPagesArray; track p) {
                  <button
                    class="page-num-btn"
                    [class.active]="currentPage === p"
                    (click)="goToPage(p)"
                  >
                    {{ p }}
                  </button>
                }

                <button
                  class="btn btn-secondary btn-sm"
                  [disabled]="currentPage === totalPages"
                  (click)="goToPage(currentPage + 1)"
                >
                  Next <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          } @else {
            <!-- Empty State -->
            <div class="empty-state card">
              <div class="empty-icon"><i class="bi bi-search"></i></div>
              <h3>No Matching Auctions Found</h3>
              <p>We couldn't find any auctions matching your current filter criteria.</p>
              <button class="btn btn-primary" (click)="resetFilters()">
                <i class="bi bi-arrow-counterclockwise"></i> Reset All Filters
              </button>
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .browse-page {
      padding-top: 30px;
    }
    .browse-header {
      margin-bottom: 24px;
    }
    .page-title {
      font-size: 28px;
      font-weight: 800;
    }
    .count-badge {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-muted);
    }
    .sort-select {
      width: 170px;
      padding: 6px 10px;
      font-size: 13px;
    }
    .view-toggle-group {
      display: flex;
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      padding: 2px;
      border: 1px solid var(--border-subtle);
    }
    .view-btn {
      background: transparent;
      border: 0;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      color: var(--text-muted);
      font-size: 14px;
    }
    .view-btn.active {
      background: var(--bg-surface);
      color: var(--primary);
      box-shadow: var(--shadow-sm);
    }
    .browse-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 28px;
      align-items: flex-start;
    }
    .filters-sidebar {
      padding: 20px;
      position: sticky;
      top: 90px;
    }
    .sidebar-header {
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 18px;
    }
    .reset-link {
      background: transparent;
      border: 0;
      color: var(--primary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .reset-link:hover { text-decoration: underline; }
    .filter-group {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px dashed var(--border-subtle);
    }
    .filter-group:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .filter-label {
      display: block;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .filter-input-wrap {
      position: relative;
    }
    .clear-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: 0;
      cursor: pointer;
    }
    .price-slider {
      width: 100%;
      accent-color: var(--primary);
      cursor: pointer;
    }
    .price-val {
      font-size: 13px;
      font-weight: 700;
      color: var(--primary);
    }
    .checkbox-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .checkbox-label, .toggle-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      cursor: pointer;
    }
    .active-pills {
      background: var(--bg-subtle);
      padding: 8px 12px;
      border-radius: var(--radius-md);
    }
    .filter-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      padding: 3px 8px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .filter-pill i {
      cursor: pointer;
      font-weight: 800;
    }
    .list-item-card {
      padding: 16px;
      gap: 20px;
    }
    .list-thumb {
      width: 180px;
      height: 140px;
      object-fit: cover;
      border-radius: var(--radius-md);
    }
    .list-title {
      font-size: 17px;
      font-weight: 700;
      margin: 6px 0;
    }
    .list-title a:hover {
      color: var(--primary);
    }
    .list-desc {
      font-size: 13px;
      color: var(--text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }
    .list-price {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-primary);
      font-family: var(--font-heading);
    }
    .bids-tag {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
    }
    .pagination-bar {
      margin-top: 32px;
      padding: 18px 0;
      border-top: 1px solid var(--border-subtle);
    }
    .page-num-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
    }
    .page-num-btn.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }
    .empty-icon {
      font-size: 48px;
      color: var(--text-muted);
      margin-bottom: 14px;
    }
    .empty-state h3 {
      font-size: 20px;
      margin-bottom: 8px;
    }
    .empty-state p {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }
    @media (max-width: 900px) {
      .browse-layout {
        grid-template-columns: 1fr;
      }
      .filters-sidebar {
        position: static;
      }
      .list-item-card {
        flex-direction: column;
      }
      .list-thumb {
        width: 100%;
        height: 180px;
      }
    }
  `]
})
export class BrowseComponent implements OnInit {
  svc = inject(AuctionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Filter States
  searchKeyword = '';
  selectedCategory = 'all';
  maxPrice = 2000000;
  selectedConditions: string[] = [];
  onlyEndingWithinHour = false;
  onlyNoBids = false;
  onlyBuyNow = false;

  sortBy = 'endingSoon';
  viewMode: 'grid' | 'list' = 'grid';

  // Pagination
  currentPage = 1;
  pageSize = 9;

  conditionsList = ['Brand New', 'Like New', 'Refurbished', 'Vintage', 'Good'];
  filteredAuctions: Auction[] = [];

  get hasActiveFilters(): boolean {
    return (
      this.selectedCategory !== 'all' ||
      !!this.searchKeyword ||
      this.maxPrice < 2000000 ||
      this.selectedConditions.length > 0 ||
      this.onlyEndingWithinHour ||
      this.onlyNoBids ||
      this.onlyBuyNow
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAuctions.length / this.pageSize) || 1;
  }

  get totalPagesArray(): number[] {
    const arr: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      arr.push(i);
    }
    return arr;
  }

  get paginatedAuctions(): Auction[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAuctions.slice(start, start + this.pageSize);
  }

  getMinNumber(a: number, b: number): number {
    return Math.min(a, b);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['cat']) {
        this.selectedCategory = params['cat'];
      }
      if (params['q']) {
        this.searchKeyword = params['q'];
      }
      this.applyFilters();
    });
  }

  toggleCondition(cond: string) {
    if (this.selectedConditions.includes(cond)) {
      this.selectedConditions = this.selectedConditions.filter(c => c !== cond);
    } else {
      this.selectedConditions.push(cond);
    }
    this.applyFilters();
  }

  applyFilters() {
    this.currentPage = 1;
    let list = [...this.svc.auctions()];
    const now = this.svc.currentTime();

    // Exclude sold or expired if not explicitly showing all
    list = list.filter(a => !a.isSold && a.endTime > now);

    // Category
    if (this.selectedCategory !== 'all') {
      list = list.filter(a => a.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }

    // Keyword
    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase().trim();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.seller.toLowerCase().includes(q)
      );
    }

    // Max Price
    list = list.filter(a => this.svc.getCurrentPrice(a) <= this.maxPrice);

    // Condition
    if (this.selectedConditions.length > 0) {
      list = list.filter(a => this.selectedConditions.includes(a.condition));
    }

    // Ending within 1 hour
    if (this.onlyEndingWithinHour) {
      list = list.filter(a => (a.endTime - now) <= 60 * 60 * 1000);
    }

    // Has no bids
    if (this.onlyNoBids) {
      list = list.filter(a => !a.bids || a.bids.length === 0);
    }

    // Buy Now
    if (this.onlyBuyNow) {
      list = list.filter(a => !!a.buyNowPrice);
    }

    // Sorting
    switch (this.sortBy) {
      case 'endingSoon':
        list.sort((a, b) => a.endTime - b.endTime);
        break;
      case 'newlyListed':
        list.sort((a, b) => b.id - a.id);
        break;
      case 'priceLow':
        list.sort((a, b) => this.svc.getCurrentPrice(a) - this.svc.getCurrentPrice(b));
        break;
      case 'priceHigh':
        list.sort((a, b) => this.svc.getCurrentPrice(b) - this.svc.getCurrentPrice(a));
        break;
      case 'mostBids':
        list.sort((a, b) => (b.bids?.length || 0) - (a.bids?.length || 0));
        break;
    }

    this.filteredAuctions = list;
  }

  resetFilters() {
    this.searchKeyword = '';
    this.selectedCategory = 'all';
    this.maxPrice = 2000000;
    this.selectedConditions = [];
    this.onlyEndingWithinHour = false;
    this.onlyNoBids = false;
    this.onlyBuyNow = false;
    this.sortBy = 'endingSoon';
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

