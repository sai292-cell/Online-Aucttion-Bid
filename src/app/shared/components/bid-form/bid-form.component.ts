import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auction } from '../../../core/models/auction.model';
import { AuctionService } from '../../../core/services/auction.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyINRPipe } from '../../pipes/currency-inr.pipe';

@Component({
  selector: 'app-bid-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, CurrencyINRPipe],
  template: `
    <div class="bid-box card">
      <!-- Status Header -->
      <div class="bid-box-header">
        <div>
          <span class="label-muted">{{ isEnded ? 'Final Winning Bid' : 'Current Highest Bid' }}</span>
          <div class="bid-current-amount">{{ currentPrice | currencyINR }}</div>
        </div>
        <div class="text-right">
          <span class="label-muted">Increment</span>
          <div class="increment-badge">+{{ auction.bidIncrement | currencyINR }}</div>
        </div>
      </div>

      <!-- Reserve Met Status -->
      @if (auction.reservePrice) {
        <div class="reserve-status" [class.met]="isReserveMet">
          <i class="bi" [class.bi-check-circle-fill]="isReserveMet" [class.bi-info-circle-fill]="!isReserveMet"></i>
          <span>{{ isReserveMet ? 'Reserve price met' : 'Reserve price not yet met' }}</span>
        </div>
      }

      @if (!isEnded) {
        @if (!auth.isAuthenticated()) {
          <!-- Login Prompt -->
          <div class="auth-prompt">
            <i class="bi bi-shield-lock auth-prompt-icon"></i>
            <p>You must be signed in to place bids and participate in real-time auctions.</p>
            <a routerLink="/auth/login" class="btn btn-primary" style="width: 100%;">
              <i class="bi bi-box-arrow-in-right"></i> Log In to Bid
            </a>
          </div>
        } @else {
          <!-- User Wallet Balance Check -->
          <div class="wallet-status-bar">
            <span><i class="bi bi-wallet2"></i> Your Wallet Balance:</span>
            <strong>{{ auth.currentUser()?.wallet | currencyINR }}</strong>
          </div>

          <!-- Quick Bid Buttons -->
          <div class="quick-bids-section">
            <span class="section-subheading">Quick Bid:</span>
            <div class="quick-bid-buttons">
              <button
                type="button"
                class="btn btn-secondary quick-btn"
                (click)="placeQuickBid(1)"
                [disabled]="isPlacing"
              >
                +1x ({{ minNextBid | currencyINR }})
              </button>
              <button
                type="button"
                class="btn btn-secondary quick-btn"
                (click)="placeQuickBid(2)"
                [disabled]="isPlacing"
              >
                +2x ({{ (currentPrice + auction.bidIncrement * 2) | currencyINR }})
              </button>
              <button
                type="button"
                class="btn btn-secondary quick-btn"
                (click)="placeQuickBid(5)"
                [disabled]="isPlacing"
              >
                +5x ({{ (currentPrice + auction.bidIncrement * 5) | currencyINR }})
              </button>
            </div>
          </div>

          <!-- Custom Bid Form -->
          <form [formGroup]="bidForm" (ngSubmit)="submitCustomBid()" class="custom-bid-form">
            <label class="form-label" for="customBid">Enter Custom Bid (Min {{ minNextBid | currencyINR }}):</label>
            <div class="input-with-button">
              <span class="currency-symbol">₹</span>
              <input
                id="customBid"
                type="number"
                class="form-control bid-input"
                formControlName="amount"
                [min]="minNextBid"
                [step]="auction.bidIncrement"
                placeholder="Enter amount"
              />
              <button type="submit" class="btn btn-primary" [disabled]="bidForm.invalid || isPlacing">
                <i class="bi bi-hammer"></i> Place Bid
              </button>
            </div>
            @if (bidForm.get('amount')?.touched && bidForm.get('amount')?.errors) {
              <div class="invalid-feedback">
                Bid must be at least {{ minNextBid | currencyINR }}.
              </div>
            }
          </form>

          <!-- Proxy / Auto-Bid Option -->
          <div class="proxy-bid-container">
            <div class="proxy-header" (click)="toggleProxyAccordion()">
              <div class="flex items-center gap-2">
                <i class="bi bi-robot text-primary"></i>
                <span class="proxy-title">Set Proxy / Max Auto-Bid</span>
              </div>
              <i class="bi" [class.bi-chevron-down]="!showProxy" [class.bi-chevron-up]="showProxy"></i>
            </div>

            @if (showProxy) {
              <div class="proxy-body">
                <p class="proxy-desc">
                  Our system will automatically place the lowest winning bid on your behalf whenever someone bids, up to your maximum limit!
                </p>
                <div class="input-with-button">
                  <span class="currency-symbol">₹</span>
                  <input
                    type="number"
                    class="form-control"
                    [(ngModel)]="proxyAmount"
                    [min]="minNextBid + auction.bidIncrement"
                    placeholder="Enter maximum ceiling"
                  />
                  <button type="button" class="btn btn-secondary" (click)="submitProxyBid()">
                    Set Limit
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Buy Now Action (if available) -->
          @if (auction.buyNowPrice) {
            <div class="buy-now-wrapper">
              <div class="buy-now-divider">
                <span>OR BUY INSTANTLY</span>
              </div>
              <button type="button" class="btn btn-accent buy-now-btn" (click)="triggerBuyNow()">
                <i class="bi bi-lightning-charge-fill"></i>
                <span>Buy Now for {{ auction.buyNowPrice | currencyINR }}</span>
              </button>
            </div>
          }
        }
      } @else {
        <!-- Ended Summary -->
        <div class="auction-ended-box">
          <div class="ended-icon"><i class="bi bi-trophy-fill"></i></div>
          <h3>Auction Closed</h3>
          @if (highestBidder) {
            <p>Won by <strong>{{ highestBidder }}</strong> for <strong>{{ currentPrice | currencyINR }}</strong></p>
            @if (auth.currentUser()?.name === highestBidder) {
              <div class="winner-alert">
                <span>🎉 You are the winning bidder!</span>
                <a [routerLink]="['/checkout', auction.id]" class="btn btn-primary" style="margin-top: 10px; width: 100%;">
                  <i class="bi bi-credit-card-2-front"></i> Complete Checkout Now
                </a>
              </div>
            }
          } @else {
            <p>This auction ended with no bids.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .bid-box {
      padding: 24px;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      box-shadow: var(--shadow-md);
    }
    .bid-box-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .label-muted {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .bid-current-amount {
      font-size: 28px;
      font-weight: 800;
      font-family: var(--font-heading);
      color: var(--primary);
    }
    .increment-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      background: var(--bg-subtle);
      font-weight: 700;
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    .reserve-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 600;
      background: var(--bg-subtle);
      color: var(--text-muted);
      margin-bottom: 18px;
    }
    .reserve-status.met {
      background: var(--success-light);
      color: var(--success-text);
    }
    .auth-prompt {
      text-align: center;
      padding: 20px;
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      border: 1px dashed var(--border-strong);
    }
    .auth-prompt-icon {
      font-size: 32px;
      color: var(--primary);
      margin-bottom: 8px;
      display: block;
    }
    .auth-prompt p {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }
    .wallet-status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12.5px;
      padding: 8px 12px;
      background: var(--primary-light);
      border: 1px solid var(--primary-border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      margin-bottom: 16px;
    }
    .quick-bids-section {
      margin-bottom: 18px;
    }
    .section-subheading {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .quick-bid-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .quick-btn {
      font-size: 12px;
      padding: 8px 6px;
    }
    .custom-bid-form {
      margin-bottom: 18px;
    }
    .input-with-button {
      position: relative;
      display: flex;
      gap: 8px;
    }
    .currency-symbol {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-weight: 700;
      color: var(--text-muted);
      z-index: 2;
    }
    .bid-input {
      padding-left: 28px;
      font-size: 16px;
      font-weight: 600;
    }
    .proxy-bid-container {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: 18px;
    }
    .proxy-header {
      padding: 10px 14px;
      background: var(--bg-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }
    .proxy-body {
      padding: 14px;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);
    }
    .proxy-desc {
      font-size: 11.5px;
      color: var(--text-secondary);
      margin-bottom: 10px;
      line-height: 1.4;
    }
    .buy-now-wrapper {
      margin-top: 14px;
    }
    .buy-now-divider {
      position: relative;
      text-align: center;
      margin: 16px 0;
    }
    .buy-now-divider::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--border-subtle);
    }
    .buy-now-divider span {
      position: relative;
      background: var(--bg-surface);
      padding: 0 10px;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }
    .buy-now-btn {
      width: 100%;
      padding: 12px;
    }
    .auction-ended-box {
      text-align: center;
      padding: 24px 12px;
    }
    .ended-icon {
      font-size: 36px;
      color: #f59e0b;
      margin-bottom: 10px;
    }
    .winner-alert {
      margin-top: 16px;
      padding: 14px;
      background: var(--success-light);
      border: 1px solid var(--success);
      border-radius: var(--radius-md);
      color: var(--success-text);
      font-weight: 600;
    }
  `]
})
export class BidFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  svc = inject(AuctionService);
  auth = inject(AuthService);

  @Input({ required: true }) auction!: Auction;
  @Output() bidPlaced = new EventEmitter<number>();

  bidForm!: FormGroup;
  showProxy = false;
  proxyAmount: number | null = null;
  isPlacing = false;

  get currentPrice(): number {
    return this.svc.getCurrentPrice(this.auction);
  }

  get minNextBid(): number {
    return this.svc.getMinNextBid(this.auction);
  }

  get isReserveMet(): boolean {
    return this.svc.isReserveMet(this.auction);
  }

  get isEnded(): boolean {
    return this.svc.isAuctionEnded(this.auction);
  }

  get highestBidder(): string | null {
    return this.svc.getHighestBidder(this.auction);
  }

  ngOnInit() {
    this.bidForm = this.fb.group({
      amount: [this.minNextBid, [Validators.required, Validators.min(this.minNextBid)]]
    });
  }

  placeQuickBid(multiplier: number) {
    const amount = this.currentPrice + this.auction.bidIncrement * multiplier;
    this.executeBid(amount);
  }

  submitCustomBid() {
    if (this.bidForm.invalid) return;
    const amount = Number(this.bidForm.value.amount);
    this.executeBid(amount);
  }

  private executeBid(amount: number) {
    this.isPlacing = true;
    const res = this.svc.placeBid(this.auction.id, amount);
    this.isPlacing = false;

    if (res.success) {
      this.bidPlaced.emit(amount);
      this.bidForm.patchValue({ amount: this.minNextBid });
    } else if (res.message) {
      this.svc.showToast(res.message, 'danger');
    }
  }

  toggleProxyAccordion() {
    this.showProxy = !this.showProxy;
    if (this.showProxy && !this.proxyAmount) {
      this.proxyAmount = this.minNextBid + this.auction.bidIncrement * 2;
    }
  }

  submitProxyBid() {
    if (!this.proxyAmount) return;
    const res = this.svc.setProxyMaxBid(this.auction.id, this.proxyAmount);
    if (res.success) {
      this.showProxy = false;
    } else if (res.message) {
      this.svc.showToast(res.message, 'danger');
    }
  }

  triggerBuyNow() {
    if (confirm(`Are you sure you want to Buy Now for ₹${this.auction.buyNowPrice?.toLocaleString('en-IN')}?`)) {
      const res = this.svc.buyNow(this.auction.id);
      if (res.success) {
        this.router.navigate(['/checkout', this.auction.id]);
      } else if (res.message) {
        this.svc.showToast(res.message, 'danger');
      }
    }
  }
}
