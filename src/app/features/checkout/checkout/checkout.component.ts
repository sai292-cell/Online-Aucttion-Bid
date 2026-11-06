import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuctionService } from '../../../core/services/auction.service';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { OrderService } from '../../../core/services/order.service';
import { Auction } from '../../../core/models/auction.model';
import { CurrencyINRPipe } from '../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, CurrencyINRPipe],
  template: `
    @if (auction) {
      <div class="checkout-page container">
        <h1 class="page-title mb-2">Secure Auction Checkout</h1>
        <p class="text-sm text-secondary mb-6">Complete your purchase &amp; dispatch arrangement for Lot #{{ auction.id }}</p>

        <div class="checkout-grid">
          <!-- Left: Forms (Address & Payment) -->
          <div class="checkout-forms">
            <!-- Step 1: Shipping Address Form -->
            <div class="card p-6 mb-6">
              <h3 class="section-title mb-4 flex items-center gap-2">
                <span class="step-num">1</span> Delivery Shipping Address
              </h3>

              <form [formGroup]="addressForm">
                <div class="form-group">
                  <label class="form-label" for="fullName">Recipient Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    class="form-control"
                    formControlName="fullName"
                    placeholder="e.g. Sarthak Sharma"
                  />
                  @if (f['fullName'].touched && f['fullName'].errors) {
                    <div class="invalid-feedback">Full name is required.</div>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label" for="street">Street Address &amp; Apartment / Suite</label>
                  <input
                    id="street"
                    type="text"
                    class="form-control"
                    formControlName="street"
                    placeholder="e.g. 402, Lotus Residency, MG Road"
                  />
                  @if (f['street'].touched && f['street'].errors) {
                    <div class="invalid-feedback">Street address is required.</div>
                  }
                </div>

                <div class="grid grid-cols-3 gap-3">
                  <div class="form-group">
                    <label class="form-label" for="city">City</label>
                    <input id="city" type="text" class="form-control" formControlName="city" placeholder="Mumbai" />
                    @if (f['city'].touched && f['city'].errors) {
                      <div class="invalid-feedback">City required.</div>
                    }
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="state">State</label>
                    <input id="state" type="text" class="form-control" formControlName="state" placeholder="Maharashtra" />
                    @if (f['state'].touched && f['state'].errors) {
                      <div class="invalid-feedback">State required.</div>
                    }
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="pincode">Pincode</label>
                    <input id="pincode" type="text" class="form-control" formControlName="pincode" placeholder="400001" />
                    @if (f['pincode'].touched && f['pincode'].errors) {
                      <div class="invalid-feedback">6-digit pincode.</div>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="phone">Phone Number (For Courier Contact)</label>
                  <input id="phone" type="tel" class="form-control" formControlName="phone" placeholder="+91 98765 43210" />
                  @if (f['phone'].touched && f['phone'].errors) {
                    <div class="invalid-feedback">Valid phone number required.</div>
                  }
                </div>
              </form>
            </div>

            <!-- Step 2: Payment Method -->
            <div class="card p-6">
              <h3 class="section-title mb-4 flex items-center gap-2">
                <span class="step-num">2</span> Payment Method
              </h3>

              <div class="payment-methods-list flex flex-col gap-3">
                <!-- Option 1: BidBazaar Wallet -->
                <label class="payment-card-option" [class.selected]="selectedPayment === 'wallet'">
                  <input type="radio" name="payment" value="wallet" [(ngModel)]="selectedPayment" />
                  <div class="flex items-center justify-between flex-1">
                    <div class="flex items-center gap-3">
                      <i class="bi bi-wallet2 text-xl text-primary"></i>
                      <div>
                        <strong>BidBazaar Escrow Wallet</strong>
                        <div class="text-xs text-muted">Available: {{ walletSvc.balance | currencyINR }}</div>
                      </div>
                    </div>
                    @if (walletSvc.balance < totalAmount) {
                      <span class="badge badge-urgent">Insufficient Funds</span>
                    } @else {
                      <span class="badge badge-live">Ready</span>
                    }
                  </div>
                </label>

                <!-- Option 2: Mock Card -->
                <label class="payment-card-option" [class.selected]="selectedPayment === 'card'">
                  <input type="radio" name="payment" value="card" [(ngModel)]="selectedPayment" />
                  <div class="flex items-center gap-3">
                    <i class="bi bi-credit-card-fill text-xl text-primary"></i>
                    <div>
                      <strong>Credit / Debit Card (Simulated)</strong>
                      <div class="text-xs text-muted">Instant mock authorization (Visa / Mastercard / RuPay)</div>
                    </div>
                  </div>
                </label>

                <!-- Option 3: UPI Mock -->
                <label class="payment-card-option" [class.selected]="selectedPayment === 'upi'">
                  <input type="radio" name="payment" value="upi" [(ngModel)]="selectedPayment" />
                  <div class="flex items-center gap-3">
                    <i class="bi bi-qr-code text-xl text-primary"></i>
                    <div>
                      <strong>UPI Instant Pay (Simulated)</strong>
                      <div class="text-xs text-muted">Google Pay / PhonePe / BHIM test payment</div>
                    </div>
                  </div>
                </label>
              </div>

              <!-- Extra Insufficient warning if Wallet selected -->
              @if (selectedPayment === 'wallet' && walletSvc.balance < totalAmount) {
                <div class="alert alert-warning mt-4 p-3 bg-subtle border rounded flex justify-between items-center">
                  <span class="text-xs">Your wallet needs ₹{{ (totalAmount - walletSvc.balance).toLocaleString('en-IN') }} more.</span>
                  <button class="btn btn-secondary btn-sm" (click)="addMissingWalletFunds()">
                    + Add Missing Funds
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Right: Order Summary Sidebar -->
          <div class="checkout-summary card p-6">
            <h3 class="section-title mb-4">Order Summary</h3>

            <!-- Item Mini Card -->
            <div class="flex items-center gap-3 pb-4 border-b">
              <img [src]="auction.images[0]" [alt]="auction.title" class="summary-thumb" />
              <div>
                <span class="text-xs text-muted font-bold">{{ auction.category }}</span>
                <h4 class="text-sm font-bold">{{ auction.title }}</h4>
                <div class="text-xs text-muted">Seller: {{ auction.seller }}</div>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="price-breakdown py-4 border-b flex flex-col gap-2 text-sm">
              <div class="flex justify-between">
                <span class="text-secondary">Winning Hammer Price:</span>
                <span class="font-bold">{{ winningAmount | currencyINR }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary">Insured Armored Shipping:</span>
                <span>{{ shippingFee | currencyINR }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary">GST &amp; Escrow Fee (3%):</span>
                <span>{{ taxAmount | currencyINR }}</span>
              </div>
            </div>

            <!-- Grand Total -->
            <div class="flex justify-between items-center py-4 text-base font-bold">
              <span>Grand Total:</span>
              <span class="text-2xl text-primary font-heading">{{ totalAmount | currencyINR }}</span>
            </div>

            <button
              class="btn btn-primary btn-lg w-full checkout-submit-btn"
              [disabled]="addressForm.invalid || isProcessing"
              (click)="processOrder()"
            >
              @if (isProcessing) {
                <span>Processing Payment...</span>
              } @else {
                <span><i class="bi bi-shield-lock-fill"></i> Confirm &amp; Pay {{ totalAmount | currencyINR }}</span>
              }
            </button>

            <div class="text-xs text-muted text-center mt-3">
              <i class="bi bi-lock-fill"></i> 256-bit Encrypted Frontend Mock Checkout
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="container text-center p-12">
        <h2>Auction not found or invalid checkout.</h2>
        <a routerLink="/dashboard" class="btn btn-primary mt-4">Back to Dashboard</a>
      </div>
    }
  `,
  styles: [`
    .checkout-page {
      padding-top: 30px;
      padding-bottom: 60px;
    }
    .page-title {
      font-size: 28px;
      font-weight: 800;
    }
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      align-items: flex-start;
    }
    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .payment-card-option {
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      transition: var(--transition);
      background: var(--bg-surface);
    }
    .payment-card-option.selected {
      border-color: var(--primary);
      background: var(--primary-light);
    }
    .summary-thumb {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    .checkout-submit-btn {
      width: 100%;
    }
    @media (max-width: 900px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  svc = inject(AuctionService);
  auth = inject(AuthService);
  walletSvc = inject(WalletService);
  orderSvc = inject(OrderService);

  auction: Auction | null = null;
  addressForm!: FormGroup;
  selectedPayment: 'wallet' | 'card' | 'upi' = 'wallet';
  isProcessing = false;

  shippingFee = 1500;

  get winningAmount(): number {
    if (!this.auction) return 0;
    return this.auction.soldAmount || this.svc.getCurrentPrice(this.auction);
  }

  get taxAmount(): number {
    return Math.round(this.winningAmount * 0.03);
  }

  get totalAmount(): number {
    return this.winningAmount + this.shippingFee + this.taxAmount;
  }

  get f() { return this.addressForm.controls; }

  ngOnInit() {
    const user = this.auth.currentUser();
    this.addressForm = this.fb.group({
      fullName: [user?.name || '', Validators.required],
      street: ['402, Lotus Heights, Andheri West', Validators.required],
      city: ['Mumbai', Validators.required],
      state: ['Maharashtra', Validators.required],
      pincode: ['400053', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      phone: [user?.phone || '+91 97110 99887', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      const found = this.svc.getAuctionById(id);
      if (found) {
        this.auction = found;
      }
    });
  }

  addMissingWalletFunds() {
    const missing = this.totalAmount - this.walletSvc.balance;
    if (missing > 0) {
      this.walletSvc.addFunds(missing);
      this.svc.showToast(`₹${missing.toLocaleString('en-IN')} auto-topped up to your wallet!`, 'success');
    }
  }

  processOrder() {
    if (this.addressForm.invalid || !this.auction) return;

    if (this.selectedPayment === 'wallet') {
      if (this.walletSvc.balance < this.totalAmount) {
        this.svc.showToast('Insufficient wallet balance. Please add funds or pick mock Card/UPI.', 'danger');
        return;
      }
      // Deduct from wallet
      this.walletSvc.deductFunds(
        this.totalAmount,
        `Payment for won lot: ${this.auction.title}`,
        'LOT-' + this.auction.id
      );
    }

    this.isProcessing = true;

    setTimeout(() => {
      const newOrder = this.orderSvc.createOrder({
        auctionId: this.auction!.id,
        auctionTitle: this.auction!.title,
        auctionImage: this.auction!.images[0],
        seller: this.auction!.seller,
        finalAmount: this.winningAmount,
        shippingFee: this.shippingFee,
        tax: this.taxAmount,
        shippingAddress: this.addressForm.value,
        paymentMethod: this.selectedPayment
      });

      this.isProcessing = false;
      this.svc.showToast('Payment successful! Your order has been placed.', 'success');
      this.router.navigate(['/checkout/confirmation', newOrder.id]);
    }, 1000);
  }
}
