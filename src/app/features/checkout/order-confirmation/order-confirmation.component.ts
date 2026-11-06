import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { CurrencyINRPipe } from '../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyINRPipe],
  template: `
    @if (order) {
      <div class="confirmation-page container">
        <!-- Print & Navigation Actions -->
        <div class="no-print confirmation-actions flex justify-between items-center mb-6">
          <a routerLink="/checkout/orders" class="btn btn-secondary">
            <i class="bi bi-arrow-left"></i> Go to My Orders
          </a>
          <button class="btn btn-primary" (click)="printInvoice()">
            <i class="bi bi-printer-fill"></i> Print Official Tax Invoice
          </button>
        </div>

        <!-- Printable Invoice Sheet -->
        <div class="invoice-sheet card printable-invoice">
          <!-- Invoice Header -->
          <div class="invoice-header flex justify-between items-start pb-6 border-b">
            <div>
              <div class="brand-box flex items-center gap-2 mb-2">
                <div class="logo-icon-box"><i class="bi bi-hammer"></i></div>
                <h2 class="brand-title">Bid<span class="text-primary">Bazaar</span></h2>
              </div>
              <p class="text-xs text-muted">Online Auction &amp; Real-Time Bidding Marketplace</p>
              <p class="text-xs text-muted">GSTIN: 27AABCB1234F1Z0 • Mumbai, Maharashtra</p>
            </div>
            <div class="text-right">
              <span class="badge badge-live mb-2">PAYMENT CONFIRMED</span>
              <h3 class="invoice-title">TAX INVOICE</h3>
              <div class="text-xs text-muted"><strong>Invoice #:</strong> {{ order.id }}</div>
              <div class="text-xs text-muted"><strong>Date:</strong> {{ order.orderDate | date:'mediumDate' }}</div>
              <div class="text-xs text-muted"><strong>Tracking:</strong> {{ order.trackingNumber }}</div>
            </div>
          </div>

          <!-- Billing & Shipping Parties Grid -->
          <div class="parties-grid py-6 border-b">
            <div>
              <h4 class="text-xs text-muted text-uppercase font-bold mb-2">Billed To (Buyer):</h4>
              <div class="font-bold text-sm">{{ order.shippingAddress.fullName }}</div>
              <div class="text-xs text-secondary">{{ order.shippingAddress.street }}</div>
              <div class="text-xs text-secondary">{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} - {{ order.shippingAddress.pincode }}</div>
              <div class="text-xs text-secondary">Phone: {{ order.shippingAddress.phone }}</div>
            </div>
            <div>
              <h4 class="text-xs text-muted text-uppercase font-bold mb-2">Seller / Consignor:</h4>
              <div class="font-bold text-sm">{{ order.seller }}</div>
              <div class="text-xs text-secondary">Verified Merchant Partner</div>
              <div class="text-xs text-secondary">Payment Method: {{ order.paymentMethod | uppercase }}</div>
              <div class="text-xs text-secondary">Escrow Reference: ESC-{{ order.id }}</div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="py-6 border-b">
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Lot ID</th>
                  <th>Status</th>
                  <th class="text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="font-bold text-sm">{{ order.auctionTitle }}</div>
                    <div class="text-xs text-muted">Authenticity Guaranteed &amp; Insured Shipment</div>
                  </td>
                  <td>#{{ order.auctionId }}</td>
                  <td><span class="badge" style="background:#dcfce7; color:#15803d;">PAID</span></td>
                  <td class="text-right font-bold">{{ order.finalAmount | currencyINR }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Calculations Footer -->
          <div class="invoice-totals-footer flex justify-between pt-6">
            <div class="terms-notes max-w-sm">
              <h5 class="text-xs font-bold text-uppercase text-muted mb-1">Terms &amp; Protection:</h5>
              <p class="text-xs text-secondary leading-relaxed">
                All lots are guaranteed authentic by BidBazaar escrow protection. The seller is required to dispatch the item within 48 hours with full transit insurance.
              </p>
            </div>

            <div class="totals-breakdown flex flex-col gap-2 min-w-xs">
              <div class="flex justify-between text-sm">
                <span class="text-secondary">Hammer Total:</span>
                <span>{{ order.finalAmount | currencyINR }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-secondary">Shipping &amp; Handling:</span>
                <span>{{ order.shippingFee | currencyINR }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-secondary">GST &amp; Escrow Fee (3%):</span>
                <span>{{ order.tax | currencyINR }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Total Paid:</span>
                <span class="text-primary">{{ order.totalPaid | currencyINR }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="container text-center p-12">
        <h2>Order not found</h2>
        <a routerLink="/dashboard" class="btn btn-primary mt-4">Go to Dashboard</a>
      </div>
    }
  `,
  styles: [`
    .confirmation-page {
      padding-top: 30px;
      padding-bottom: 60px;
      max-width: 820px;
    }
    .invoice-sheet {
      padding: 40px;
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }
    .logo-icon-box {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
    }
    .invoice-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    .invoice-table th, .invoice-table td {
      padding: 10px 0;
      text-align: left;
    }
    .invoice-table th {
      font-size: 11.5px;
      color: var(--text-muted);
      text-transform: uppercase;
      border-bottom: 1px solid var(--border-subtle);
    }
    .min-w-xs {
      min-width: 260px;
    }
    .border-b { border-bottom: 1px solid var(--border-subtle); }
    .border-t { border-top: 1px solid var(--border-subtle); }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderSvc = inject(OrderService);

  order: Order | undefined;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.order = this.orderSvc.getOrderById(id);
      }
    });
  }

  printInvoice() {
    window.print();
  }
}

