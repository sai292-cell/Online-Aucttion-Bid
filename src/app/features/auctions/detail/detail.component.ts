import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuctionService } from '../../../core/services/auction.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { Auction, Bid } from '../../../core/models/auction.model';
import { CountdownTimerComponent } from '../../../shared/components/countdown-timer/countdown-timer.component';
import { BidFormComponent } from '../../../shared/components/bid-form/bid-form.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { AuctionCardComponent } from '../../../shared/components/auction-card/auction-card.component';
import { CurrencyINRPipe } from '../../../shared/pipes/currency-inr.pipe';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CountdownTimerComponent,
    BidFormComponent,
    StarRatingComponent,
    AuctionCardComponent,
    CurrencyINRPipe,
    TimeAgoPipe
  ],
  template: `
    @if (auction) {
      <div class="detail-page container">
        <!-- Breadcrumbs -->
        <nav class="detail-breadcrumbs text-xs text-muted">
          <a routerLink="/">Home</a> <i class="bi bi-chevron-right"></i>
          <a [routerLink]="['/auctions']" [queryParams]="{ cat: auction.category }">{{ auction.category }}</a>
          <i class="bi bi-chevron-right"></i>
          <span>Lot #{{ auction.id }}</span>
        </nav>

        <!-- Main Product Grid -->
        <div class="product-hero-grid">
          <!-- Left Column: Image Gallery -->
          <div class="gallery-column">
            <!-- Active Main Image with Zoom -->
            <div class="main-image-frame card" (mousemove)="onZoom($event)" (mouseleave)="resetZoom()">
              <img
                #mainImg
                [src]="selectedImage"
                [alt]="auction.title"
                class="active-img"
                [style.transformOrigin]="zoomOrigin"
                [class.zoomed]="isZoomed"
              />
              <div class="gallery-badges">
                <span class="badge condition-badge">{{ auction.condition }}</span>
                @if (auction.isSold) {
                  <span class="badge badge-sold">SOLD</span>
                } @else if (isEnded) {
                  <span class="badge badge-ended">ENDED</span>
                } @else if (svc.isUrgent(auction)) {
                  <span class="badge badge-urgent">URGENT</span>
                } @else {
                  <span class="badge badge-live">LIVE NOW</span>
                }
              </div>
              <div class="zoom-hint">
                <i class="bi bi-zoom-in"></i> Hover image to zoom
              </div>
            </div>

            <!-- Thumbnail Carousel / Row -->
            <div class="thumbnails-row">
              @for (img of auction.images; track $index) {
                <div
                  class="thumb-box card"
                  [class.active]="selectedImage === img"
                  (click)="selectedImage = img"
                >
                  <img [src]="img" [alt]="'Thumbnail ' + ($index + 1)" />
                </div>
              }
            </div>

            <!-- Trust Bar underneath photos -->
            <div class="buyer-guarantee-box card mt-4">
              <div class="flex items-center gap-3">
                <div class="shield-icon"><i class="bi bi-shield-check"></i></div>
                <div>
                  <h4 class="guarantee-title">BidBazaar Buyer Protection Guarantee</h4>
                  <p class="guarantee-desc">
                    Funds held in escrow until authenticated receipt. Verified provenance & 100% money-back condition match guarantee.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Lot Meta & Bid Form -->
          <div class="details-column">
            <!-- Title & Share/Watch bar -->
            <div class="flex justify-between items-start gap-4">
              <div>
                <span class="lot-category">{{ auction.category }} • {{ auction.location }}</span>
                <h1 class="lot-title">{{ auction.title }}</h1>
              </div>

              <div class="action-buttons flex items-center gap-2">
                <button
                  class="btn btn-secondary btn-sm icon-btn"
                  [class.active]="isWatchlisted"
                  (click)="svc.toggleWatchlist(auction.id)"
                  title="Toggle Watchlist"
                >
                  <i class="bi" [class.bi-heart-fill]="isWatchlisted" [class.bi-heart]="!isWatchlisted" [class.text-danger]="isWatchlisted"></i>
                </button>
                <button
                  class="btn btn-secondary btn-sm icon-btn"
                  (click)="copyShareLink()"
                  title="Share Lot"
                >
                  <i class="bi bi-share"></i>
                </button>
              </div>
            </div>

            <!-- Countdown Bar -->
            <div class="countdown-card flex items-center justify-between card mb-4">
              <div class="flex items-center gap-3">
                <i class="bi bi-stopwatch text-2xl text-primary"></i>
                <div>
                  <div class="text-xs text-muted font-bold text-uppercase">Bidding Ends In</div>
                  <div class="text-xs text-muted">Anti-sniping auto-extension active</div>
                </div>
              </div>
              <app-countdown-timer [endTime]="auction.endTime"></app-countdown-timer>
            </div>

            <!-- Bid Box / Form Component -->
            <app-bid-form [auction]="auction" (bidPlaced)="onBidPlaced($event)"></app-bid-form>

            <!-- Seller Card -->
            <div class="seller-card card mt-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="seller-avatar-placeholder">
                    <i class="bi bi-person-check-fill"></i>
                  </div>
                  <div>
                    <h4 class="seller-name">{{ auction.seller }}</h4>
                    <div class="seller-meta flex items-center gap-2">
                      <app-star-rating [currentRating]="auction.sellerRating || 4.9" [showValue]="true"></app-star-rating>
                      <span class="text-muted">• ({{ auction.sellerSales || 112 }} items sold)</span>
                    </div>
                  </div>
                </div>
                <span class="badge" style="background:#dcfce7; color:#15803d;">VERIFIED SELLER</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lot Details Tabs: Description, Bid History & Chart, Q&A, Seller Reviews -->
        <div class="lot-tabs-container mt-8">
          <div class="tabs-header flex gap-4">
            <button class="tab-btn" [class.active]="activeTab === 'desc'" (click)="activeTab = 'desc'">
              <i class="bi bi-card-text"></i> Description & Details
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'history'" (click)="activeTab = 'history'">
              <i class="bi bi-graph-up"></i> Bid History & Price Chart ({{ auction.bids.length }})
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'qa'" (click)="activeTab = 'qa'">
              <i class="bi bi-chat-dots"></i> Questions & Answers ({{ auction.questions?.length || 0 }})
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'reviews'" (click)="activeTab = 'reviews'">
              <i class="bi bi-star"></i> Seller Feedback ({{ sellerReviews.length }})
            </button>
          </div>

          <div class="tab-content card p-6 mt-3">
            <!-- TAB 1: Description -->
            @if (activeTab === 'desc') {
              <div class="description-view">
                <h3 class="tab-heading">Lot Overview</h3>
                <p class="lot-description-text">{{ auction.description }}</p>

                <h3 class="tab-heading mt-6">Specifications & Provenance</h3>
                <div class="specs-grid">
                  <div class="spec-row">
                    <span class="spec-label">Condition:</span>
                    <span class="spec-val">{{ auction.condition }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Location:</span>
                    <span class="spec-val">{{ auction.location }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Starting Price:</span>
                    <span class="spec-val">{{ auction.startPrice | currencyINR }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Minimum Bid Increment:</span>
                    <span class="spec-val">+{{ auction.bidIncrement | currencyINR }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Reserve Price:</span>
                    <span class="spec-val">{{ auction.reservePrice ? (auction.reservePrice | currencyINR) : 'No Reserve' }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">Instant Buy Now:</span>
                    <span class="spec-val">{{ auction.buyNowPrice ? (auction.buyNowPrice | currencyINR) : 'Not Available' }}</span>
                  </div>
                </div>
              </div>
            }

            <!-- TAB 2: Bid History & Price Chart -->
            @if (activeTab === 'history') {
              <div class="history-view">
                <div class="chart-section mb-6">
                  <h4 class="tab-heading">Price Over Time Progression</h4>
                  @if (auction.bids.length > 0) {
                    <!-- SVG Price Chart -->
                    <div class="chart-container">
                      <svg viewBox="0 0 600 180" class="price-svg">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.0"/>
                          </linearGradient>
                        </defs>
                        <!-- Grid lines -->
                        <line x1="40" y1="20" x2="580" y2="20" stroke="var(--border-subtle)" stroke-dasharray="3"/>
                        <line x1="40" y1="80" x2="580" y2="80" stroke="var(--border-subtle)" stroke-dasharray="3"/>
                        <line x1="40" y1="140" x2="580" y2="140" stroke="var(--border-subtle)" stroke-dasharray="3"/>

                        <!-- Area & Polyline -->
                        <polygon [attr.points]="chartAreaPoints" fill="url(#chartGrad)"/>
                        <polyline [attr.points]="chartPolylinePoints" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round"/>

                        <!-- Data Points -->
                        @for (pt of chartPoints; track $index) {
                          <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="5" fill="#4f46e5" stroke="#ffffff" stroke-width="2"/>
                        }
                      </svg>
                    </div>
                  } @else {
                    <div class="p-6 text-center text-muted">No bids recorded yet. Place the first bid!</div>
                  }
                </div>

                <!-- Bid Log Table -->
                <h4 class="tab-heading">Chronological Bid Activity Log</h4>
                <div class="table-responsive">
                  <table class="bid-table">
                    <thead>
                      <tr>
                        <th>Bidder</th>
                        <th>Amount</th>
                        <th>Time</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (bid of reversedBids; track bid.id) {
                        <tr [class.latest-bid-row]="$first">
                          <td>
                            <div class="flex items-center gap-2">
                              <i class="bi bi-person-circle text-muted"></i>
                              <strong>{{ bid.bidder }}</strong>
                              @if ($first) {
                                <span class="badge badge-live">LEADER</span>
                              }
                            </div>
                          </td>
                          <td class="font-bold text-primary">{{ bid.amount | currencyINR }}</td>
                          <td class="text-muted text-xs">{{ bid.time | timeAgo }}</td>
                          <td>
                            @if (bid.isAutoBid) {
                              <span class="badge" style="background:#e0e7ff; color:#3730a3;">Proxy / Auto</span>
                            } @else {
                              <span class="badge" style="background:var(--bg-subtle);">Direct Bid</span>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="4" class="text-center p-6 text-muted">No bids placed yet</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- TAB 3: Q&A Section -->
            @if (activeTab === 'qa') {
              <div class="qa-view">
                <h3 class="tab-heading">Questions & Answers</h3>
                <p class="text-sm text-secondary mb-4">Have questions regarding lot condition or shipping? Ask the seller directly.</p>

                <!-- Post Question Form -->
                <div class="ask-box mb-6">
                  <textarea
                    class="form-control mb-2"
                    rows="3"
                    placeholder="Ask the seller a question about this lot..."
                    [(ngModel)]="newQuestionText"
                  ></textarea>
                  <button class="btn btn-primary btn-sm" (click)="submitQuestion()" [disabled]="!newQuestionText.trim()">
                    <i class="bi bi-send"></i> Submit Question
                  </button>
                </div>

                <!-- Existing Questions List -->
                <div class="questions-list">
                  @for (q of auction.questions || []; track q.id) {
                    <div class="q-item card p-4 mb-3">
                      <div class="q-header flex justify-between items-center mb-1">
                        <strong class="text-sm"><i class="bi bi-question-circle text-primary"></i> {{ q.user }}</strong>
                        <span class="text-xs text-muted">{{ q.time | timeAgo }}</span>
                      </div>
                      <p class="q-body text-sm mb-3">{{ q.question }}</p>

                      @if (q.answer) {
                        <div class="answer-box">
                          <div class="flex items-center gap-2 mb-1">
                            <i class="bi bi-reply-fill text-success"></i>
                            <strong class="text-xs text-success">Seller Response ({{ auction.seller }}):</strong>
                          </div>
                          <p class="text-sm">{{ q.answer }}</p>
                        </div>
                      } @else {
                        <div class="text-xs text-muted italic">Awaiting seller reply...</div>
                      }
                    </div>
                  } @empty {
                    <div class="text-center p-6 text-muted">No questions yet. Be the first to ask!</div>
                  }
                </div>
              </div>
            }

            <!-- TAB 4: Seller Reviews -->
            @if (activeTab === 'reviews') {
              <div class="reviews-view">
                <h3 class="tab-heading">Seller Feedback for {{ auction.seller }}</h3>
                <div class="reviews-list mt-4">
                  @for (rev of sellerReviews; track rev.id) {
                    <div class="review-item card p-4 mb-3">
                      <div class="flex justify-between items-center mb-2">
                        <div class="flex items-center gap-2">
                          <strong>{{ rev.buyerName }}</strong>
                          <span class="text-xs text-muted">verified purchase</span>
                        </div>
                        <app-star-rating [currentRating]="rev.rating"></app-star-rating>
                      </div>
                      <p class="text-sm text-secondary">{{ rev.comment }}</p>
                      <div class="text-xs text-muted mt-2">Item: {{ rev.itemTitle }} • {{ rev.time | timeAgo }}</div>
                    </div>
                  } @empty {
                    <div class="text-center p-6 text-muted">No reviews for this seller yet.</div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Similar Items Carousel Section -->
        @if (similarItems.length > 0) {
          <section class="similar-section mt-12">
            <h2 class="section-title mb-4">Similar Lots in {{ auction.category }}</h2>
            <div class="grid grid-cols-4">
              @for (item of similarItems.slice(0, 4); track item.id) {
                <app-auction-card [auction]="item"></app-auction-card>
              }
            </div>
          </section>
        }
      </div>
    } @else {
      <!-- Not Found / Loading -->
      <div class="container text-center p-12">
        <h2>Auction lot not found</h2>
        <a routerLink="/auctions" class="btn btn-primary mt-4">Browse All Auctions</a>
      </div>
    }
  `,
  styles: [`
    .detail-page {
      padding-top: 24px;
      padding-bottom: 60px;
    }
    .detail-breadcrumbs {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .product-hero-grid {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 36px;
      align-items: flex-start;
    }
    .main-image-frame {
      position: relative;
      width: 100%;
      height: 440px;
      overflow: hidden;
      background: var(--bg-subtle);
      border-radius: var(--radius-lg);
      cursor: crosshair;
    }
    .active-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.15s ease;
    }
    .active-img.zoomed {
      transform: scale(1.75);
    }
    .gallery-badges {
      position: absolute;
      top: 14px;
      left: 14px;
      display: flex;
      gap: 8px;
      z-index: 2;
    }
    .zoom-hint {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.65);
      color: #fff;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      pointer-events: none;
    }
    .thumbnails-row {
      display: flex;
      gap: 12px;
      margin-top: 14px;
    }
    .thumb-box {
      width: 80px;
      height: 70px;
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      opacity: 0.65;
      transition: var(--transition);
    }
    .thumb-box:hover, .thumb-box.active {
      opacity: 1;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px var(--primary);
    }
    .thumb-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .buyer-guarantee-box {
      padding: 16px;
      background: var(--bg-subtle);
      border: 1px solid var(--border-subtle);
    }
    .shield-icon {
      font-size: 28px;
      color: var(--primary);
    }
    .guarantee-title {
      font-size: 13.5px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .guarantee-desc {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .lot-category {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--primary);
      letter-spacing: 0.5px;
    }
    .lot-title {
      font-size: 28px;
      font-weight: 800;
      line-height: 1.25;
      margin: 6px 0 16px;
    }
    .countdown-card {
      padding: 14px 18px;
      background: var(--bg-subtle);
      border: 1px solid var(--border-subtle);
    }
    .seller-card {
      padding: 16px;
    }
    .seller-avatar-placeholder {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .seller-name {
      font-size: 15px;
      font-weight: 700;
      margin: 0;
    }
    .tabs-header {
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 8px;
      overflow-x: auto;
    }
    .tab-btn {
      background: transparent;
      border: 0;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      padding: 8px 16px;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tab-btn.active {
      background: var(--primary-light);
      color: var(--primary);
      font-weight: 700;
    }
    .tab-heading {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .lot-description-text {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.7;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .spec-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 14px;
      background: var(--bg-subtle);
      border-radius: var(--radius-sm);
      font-size: 13px;
    }
    .spec-label {
      font-weight: 600;
      color: var(--text-secondary);
    }
    .spec-val {
      font-weight: 700;
      color: var(--text-primary);
    }
    .chart-container {
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      padding: 12px;
      border: 1px solid var(--border-subtle);
    }
    .price-svg {
      width: 100%;
      height: 180px;
    }
    .bid-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    .bid-table th, .bid-table td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }
    .bid-table th {
      font-size: 11.5px;
      text-transform: uppercase;
      color: var(--text-muted);
      font-weight: 700;
    }
    .latest-bid-row {
      background: rgba(79, 70, 229, 0.05);
    }
    .answer-box {
      background: var(--bg-subtle);
      border-left: 3px solid var(--success);
      padding: 10px 14px;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }
    @media (max-width: 900px) {
      .product-hero-grid {
        grid-template-columns: 1fr;
      }
      .specs-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DetailComponent implements OnInit {
  svc = inject(AuctionService);
  auth = inject(AuthService);
  orderSvc = inject(OrderService);
  private route = inject(ActivatedRoute);

  auction: Auction | null = null;
  selectedImage = '';
  activeTab: 'desc' | 'history' | 'qa' | 'reviews' = 'desc';
  newQuestionText = '';

  // Zoom feature state
  isZoomed = false;
  zoomOrigin = 'center center';

  get isEnded(): boolean {
    return this.auction ? this.svc.isAuctionEnded(this.auction) : true;
  }

  get isWatchlisted(): boolean {
    return this.auction ? this.svc.isWatchlisted(this.auction.id) : false;
  }

  get reversedBids(): Bid[] {
    if (!this.auction || !this.auction.bids) return [];
    return [...this.auction.bids].reverse();
  }

  get sellerReviews() {
    return this.auction ? this.orderSvc.getSellerReviews(this.auction.seller) : [];
  }

  get similarItems(): Auction[] {
    if (!this.auction) return [];
    return this.svc.activeAuctions().filter(a => a.id !== this.auction!.id && a.category === this.auction!.category);
  }

  // Price chart SVG coordinates
  get chartPoints(): { x: number; y: number; amount: number }[] {
    if (!this.auction || !this.auction.bids || this.auction.bids.length === 0) return [];
    const bids = this.auction.bids;
    const minP = this.auction.startPrice;
    const maxP = Math.max(...bids.map(b => b.amount)) * 1.05;
    const range = maxP - minP || 1;

    return bids.map((b, i) => {
      const x = 50 + (i / Math.max(1, bids.length - 1)) * 500;
      const normalizedY = (b.amount - minP) / range;
      const y = 150 - normalizedY * 110;
      return { x, y, amount: b.amount };
    });
  }

  get chartPolylinePoints(): string {
    return this.chartPoints.map(p => `${p.x},${p.y}`).join(' ');
  }

  get chartAreaPoints(): string {
    const pts = this.chartPoints;
    if (pts.length === 0) return '';
    return `${pts[0].x},160 ${this.chartPolylinePoints} ${pts[pts.length - 1].x},160`;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loadAuction(id);
    });
  }

  private loadAuction(id: number) {
    const found = this.svc.getAuctionById(id);
    if (found) {
      this.auction = found;
      this.selectedImage = found.images[0];
    }
  }

  onZoom(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    this.zoomOrigin = `${x}% ${y}%`;
    this.isZoomed = true;
  }

  resetZoom() {
    this.isZoomed = false;
  }

  onBidPlaced(amount: number) {
    if (this.auction) {
      this.loadAuction(this.auction.id);
    }
  }

  copyShareLink() {
    navigator.clipboard.writeText(window.location.href);
    this.svc.showToast('Lot link copied to clipboard! 📋', 'success');
  }

  submitQuestion() {
    if (!this.auction || !this.newQuestionText.trim()) return;
    this.svc.addQuestion(this.auction.id, this.newQuestionText.trim());
    this.newQuestionText = '';
    this.loadAuction(this.auction.id);
  }
}

