import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="how-it-works-page container">
      <div class="text-center py-10">
        <span class="badge" style="background:#dbeafe; color:#1e40af; margin-bottom: 12px;">STEP-BY-STEP GUIDE</span>
        <h1 class="page-title">How Real-Time Bidding Works</h1>
        <p class="text-secondary max-w-lg mx-auto">
          Everything you need to know about placing bids, proxy bidding, anti-sniping protection, and winning items on BidBazaar.
        </p>
      </div>

      <!-- 4 Step Cards -->
      <div class="steps-grid mb-12">
        <div class="step-box card p-6">
          <div class="step-badge">1</div>
          <div class="step-icon"><i class="bi bi-person-check-fill"></i></div>
          <h3 class="step-title">Register &amp; Claim Wallet</h3>
          <p class="step-desc">
            Sign up in 30 seconds with mock email &amp; password. Every new account receives ₹50,000 in simulated wallet credits ready for live bids.
          </p>
        </div>

        <div class="step-box card p-6">
          <div class="step-badge">2</div>
          <div class="step-icon"><i class="bi bi-hammer"></i></div>
          <h3 class="step-title">Place Bids &amp; Auto-Bids</h3>
          <p class="step-desc">
            Bid manually with quick increments (+1x, +2x, +5x) or set a <strong>Proxy Auto-Bid ceiling</strong> so our bot outbids rivals for you automatically.
          </p>
        </div>

        <div class="step-box card p-6">
          <div class="step-badge">3</div>
          <div class="step-icon"><i class="bi bi-trophy-fill"></i></div>
          <h3 class="step-title">Win With Anti-Sniping</h3>
          <p class="step-desc">
            No last-second automated bots stealing your item! Any bid in the last 60 seconds extends the auction by 2 minutes for fair competition.
          </p>
        </div>

        <div class="step-box card p-6">
          <div class="step-badge">4</div>
          <div class="step-icon"><i class="bi bi-box-seam-fill"></i></div>
          <h3 class="step-title">Pay &amp; Receive Delivery</h3>
          <p class="step-desc">
            Complete simulated checkout, generate your printable tax invoice receipt, track delivery status (Paid > Shipped > Delivered), and rate your seller.
          </p>
        </div>
      </div>

      <!-- Detailed Feature Callouts -->
      <div class="grid grid-cols-2 gap-6 mb-12">
        <!-- Anti-sniping explanation card -->
        <div class="card p-6 feature-highlight-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="feature-icon bg-warning"><i class="bi bi-stopwatch-fill"></i></div>
            <h3 class="font-bold text-lg">Anti-Sniping Engine Explained</h3>
          </div>
          <p class="text-sm text-secondary leading-relaxed mb-3">
            In traditional auctions, "snipers" place bids with 1 second remaining, preventing genuine buyers from responding.
          </p>
          <div class="rule-box p-3 bg-subtle border rounded text-xs font-semibold">
            <i class="bi bi-check-circle-fill text-success"></i> If a bid is submitted with &lt;60 seconds remaining on the clock, BidBazaar automatically pushes back the end time by 120 seconds.
          </div>
        </div>

        <!-- Proxy Bidding card -->
        <div class="card p-6 feature-highlight-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="feature-icon bg-primary"><i class="bi bi-robot"></i></div>
            <h3 class="font-bold text-lg">Proxy / Auto-Bidding Mechanics</h3>
          </div>
          <p class="text-sm text-secondary leading-relaxed mb-3">
            Don't have time to watch the countdown? Set your maximum secret limit (e.g., ₹2,00,000 when current bid is ₹1,00,000).
          </p>
          <div class="rule-box p-3 bg-subtle border rounded text-xs font-semibold">
            <i class="bi bi-check-circle-fill text-success"></i> BidBazaar places only the minimum required increment to keep you in the lead until your maximum ceiling is exceeded.
          </div>
        </div>
      </div>

      <div class="text-center">
        <a routerLink="/auctions" class="btn btn-primary btn-lg">
          <i class="bi bi-hammer"></i> Try Live Bidding Right Now
        </a>
      </div>
    </div>
  `,
  styles: [`
    .how-it-works-page {
      padding-top: 20px;
      padding-bottom: 60px;
    }
    .page-title {
      font-size: 38px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .step-box {
      position: relative;
      text-align: center;
      padding-top: 36px;
    }
    .step-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: 13px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .step-icon {
      font-size: 36px;
      color: var(--primary);
      margin-bottom: 14px;
    }
    .step-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .step-desc {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .feature-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 20px;
    }
    .bg-warning { background: #f59e0b; }
    .bg-primary { background: #4f46e5; }
    @media (max-width: 900px) {
      .steps-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HowItWorksComponent {}

