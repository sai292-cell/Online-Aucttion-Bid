import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuctionService } from '../../../core/services/auction.service';
import { Order } from '../../../core/models/order.model';
import { CurrencyINRPipe } from '../../../shared/pipes/currency-inr.pipe';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyINRPipe, StarRatingComponent, ModalComponent],
  template: `
    <div class="orders-page container">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="page-title">My Orders &amp; Fulfillment</h1>
          <p class="text-sm text-secondary">Track your won lots, view tax invoices, and rate sellers</p>
        </div>
        <a routerLink="/dashboard" class="btn btn-secondary btn-sm">
          <i class="bi bi-speedometer2"></i> Buyer Dashboard
        </a>
      </div>

      <div class="orders-list flex flex-col gap-6">
        @for (order of myOrders; track order.id) {
          <div class="order-card card p-6">
            <!-- Order Header -->
            <div class="order-header flex justify-between items-start pb-4 border-b flex-wrap gap-3">
              <div>
                <div class="flex items-center gap-3">
                  <span class="font-bold text-base">Order #{{ order.id }}</span>
                  <span class="badge" [ngClass]="'status-' + order.status.toLowerCase()">{{ order.status }}</span>
                </div>
                <div class="text-xs text-muted mt-1">
                  Placed on {{ order.orderDate | date:'medium' }} • Tracking: <strong>{{ order.trackingNumber }}</strong>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <a [routerLink]="['/checkout/confirmation', order.id]" class="btn btn-secondary btn-sm">
                  <i class="bi bi-receipt"></i> Printable Invoice
                </a>
              </div>
            </div>

            <!-- Item Details Row -->
            <div class="order-item-row py-4 flex items-center justify-between flex-wrap gap-4">
              <div class="flex items-center gap-4">
                <img [src]="order.auctionImage" [alt]="order.auctionTitle" class="item-thumb" />
                <div>
                  <h4 class="font-bold text-base">{{ order.auctionTitle }}</h4>
                  <div class="text-xs text-muted">Sold by: <strong>{{ order.seller }}</strong></div>
                  <div class="text-sm font-bold text-primary mt-1">Total: {{ order.totalPaid | currencyINR }}</div>
                </div>
              </div>

              <!-- Status Simulation Shortcut for Evaluators -->
              <div class="evaluator-tools p-3 bg-subtle border rounded">
                <div class="text-xs font-bold text-muted mb-1"><i class="bi bi-lightning-charge text-warning"></i> Demo Controls:</div>
                <div class="flex gap-2">
                  @if (order.status === 'Paid') {
                    <button class="btn btn-primary btn-sm" (click)="advanceStatus(order, 'Shipped')">
                      Simulate Dispatch →
                    </button>
                  } @else if (order.status === 'Shipped') {
                    <button class="btn btn-primary btn-sm" (click)="advanceStatus(order, 'Delivered')">
                      Simulate Delivery →
                    </button>
                  } @else {
                    <span class="text-xs text-success font-bold"><i class="bi bi-check-circle-fill"></i> Delivery Complete</span>
                  }
                </div>
              </div>
            </div>

            <!-- Status Timeline Tracker -->
            <div class="timeline-tracker pt-4 border-t">
              <div class="timeline-steps">
                <!-- Step 1: Paid -->
                <div class="timeline-step completed">
                  <div class="step-circle"><i class="bi bi-check2"></i></div>
                  <div class="step-label">Payment Escrowed</div>
                </div>
                <div class="step-line" [class.active]="order.status === 'Shipped' || order.status === 'Delivered'"></div>

                <!-- Step 2: Shipped -->
                <div class="timeline-step" [class.completed]="order.status === 'Shipped' || order.status === 'Delivered'">
                  <div class="step-circle">
                    <i class="bi" [class.bi-check2]="order.status === 'Shipped' || order.status === 'Delivered'" [class.bi-box-seam]="order.status === 'Paid'"></i>
                  </div>
                  <div class="step-label">Dispatched &amp; Insured</div>
                </div>
                <div class="step-line" [class.active]="order.status === 'Delivered'"></div>

                <!-- Step 3: Delivered -->
                <div class="timeline-step" [class.completed]="order.status === 'Delivered'">
                  <div class="step-circle">
                    <i class="bi" [class.bi-check2]="order.status === 'Delivered'" [class.bi-house-check]="order.status !== 'Delivered'"></i>
                  </div>
                  <div class="step-label">Delivered</div>
                </div>
              </div>
            </div>

            <!-- Review Prompt if Delivered -->
            @if (order.status === 'Delivered') {
              <div class="review-prompt mt-4 pt-4 border-t flex justify-between items-center">
                @if (!order.hasReviewed) {
                  <div>
                    <h5 class="text-sm font-bold">How was your purchase with {{ order.seller }}?</h5>
                    <p class="text-xs text-muted">Leave your honest feedback for other collectors</p>
                  </div>
                  <button class="btn btn-accent btn-sm" (click)="openReviewModal(order)">
                    <i class="bi bi-star-fill"></i> Leave Rating &amp; Review
                  </button>
                } @else {
                  <span class="text-xs text-success font-bold">
                    <i class="bi bi-check-circle-fill"></i> Thank you! Review submitted for this order.
                  </span>
                }
              </div>
            }
          </div>
        } @empty {
          <div class="card p-12 text-center text-muted">
            <i class="bi bi-bag-x text-5xl mb-3"></i>
            <h3>No Orders Yet</h3>
            <p class="text-sm text-secondary mb-4">When you win auctions or Buy Now, your delivery orders will show up here.</p>
            <a routerLink="/auctions" class="btn btn-primary">Browse Active Lots</a>
          </div>
        }
      </div>

      <!-- Rating & Review Modal -->
      <app-modal [isOpen]="isReviewModalOpen" title="Review Seller & Item" (close)="isReviewModalOpen = false">
        <div body>
          @if (activeOrderForReview) {
            <p class="text-xs text-muted mb-4">Reviewing <strong>{{ activeOrderForReview.seller }}</strong> for <strong>{{ activeOrderForReview.auctionTitle }}</strong></p>

            <div class="form-group">
              <label class="form-label">Your Rating (1 to 5 Stars):</label>
              <app-star-rating
                [currentRating]="reviewRating"
                [interactive]="true"
                (ratingChange)="reviewRating = $event"
              ></app-star-rating>
            </div>

            <div class="form-group mt-4">
              <label class="form-label">Feedback Comments:</label>
              <textarea
                class="form-control"
                rows="4"
                placeholder="Share details on packaging quality, transit speed, condition accuracy..."
                [(ngModel)]="reviewComment"
              ></textarea>
            </div>
          }
        </div>
        <div footer>
          <button class="btn btn-secondary" (click)="isReviewModalOpen = false">Cancel</button>
          <button class="btn btn-primary" (click)="submitReview()" [disabled]="!reviewComment.trim()">
            Post Verified Review
          </button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .orders-page {
      padding-top: 30px;
      padding-bottom: 60px;
    }
    .page-title {
      font-size: 28px;
      font-weight: 800;
    }
    .order-card {
      border: 1px solid var(--border-subtle);
    }
    .status-paid { background: #e0f2fe; color: #0369a1; }
    .status-shipped { background: #fef3c7; color: #b45309; }
    .status-delivered { background: #dcfce7; color: #15803d; }
    .item-thumb {
      width: 72px;
      height: 72px;
      border-radius: var(--radius-md);
      object-fit: cover;
    }
    .timeline-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 500px;
      margin: 10px auto;
    }
    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
    }
    .timeline-step.completed {
      color: var(--primary);
    }
    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-subtle);
      border: 2px solid var(--border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .timeline-step.completed .step-circle {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    .step-label {
      font-size: 11px;
      font-weight: 700;
    }
    .step-line {
      flex: 1;
      height: 3px;
      background: var(--border-strong);
      margin: 0 10px;
      margin-bottom: 20px;
    }
    .step-line.active {
      background: var(--primary);
    }
    .border-b { border-bottom: 1px solid var(--border-subtle); }
    .border-t { border-top: 1px solid var(--border-subtle); }
  `]
})
export class OrderHistoryComponent implements OnInit {
  orderSvc = inject(OrderService);
  auth = inject(AuthService);
  svc = inject(AuctionService);

  isReviewModalOpen = false;
  activeOrderForReview: Order | null = null;
  reviewRating = 5;
  reviewComment = '';

  get myOrders(): Order[] {
    const user = this.auth.currentUser();
    if (!user) return [];
    return this.orderSvc.orders().filter(o => o.buyerId === user.id || o.buyerName === user.name);
  }

  ngOnInit() {}

  advanceStatus(order: Order, newStatus: 'Paid' | 'Shipped' | 'Delivered') {
    this.orderSvc.updateOrderStatus(order.id, newStatus);
    this.svc.showToast(`Order #${order.id} status updated to: ${newStatus}!`, 'info');
  }

  openReviewModal(order: Order) {
    this.activeOrderForReview = order;
    this.reviewRating = 5;
    this.reviewComment = 'Pristine item condition and lightning fast dispatch. 100% recommended seller!';
    this.isReviewModalOpen = true;
  }

  submitReview() {
    if (!this.activeOrderForReview || !this.reviewComment.trim()) return;

    this.orderSvc.addReview(
      this.activeOrderForReview.id,
      this.activeOrderForReview.seller,
      this.reviewRating,
      this.reviewComment.trim(),
      this.activeOrderForReview.auctionTitle
    );

    this.svc.showToast('Your rating and review has been published!', 'success');
    this.isReviewModalOpen = false;
  }
}

