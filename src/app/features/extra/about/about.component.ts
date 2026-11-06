import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="about-page container">
      <!-- Hero -->
      <div class="about-hero text-center py-12">
        <span class="badge" style="background:#e0e7ff; color:#3730a3; margin-bottom: 12px;">ENGINEERED FOR EXCELLENCE</span>
        <h1 class="page-title">About BidBazaar</h1>
        <p class="hero-desc text-secondary">
          India's most sophisticated online auction simulation marketplace, crafted as a modern Angular 17 single-page application.
        </p>
      </div>

      <div class="about-grid mb-12">
        <div class="card p-8">
          <div class="icon-circle mb-4"><i class="bi bi-bullseye"></i></div>
          <h3 class="text-xl font-bold mb-2">Our Mission</h3>
          <p class="text-secondary leading-relaxed">
            To provide collectors, connoisseurs, and enthusiasts with an authentic Sotheby's &amp; Catawiki-grade digital bidding arena. We combine real-time competitive bidding simulation with strict anti-sniping and escrow security.
          </p>
        </div>

        <div class="card p-8">
          <div class="icon-circle mb-4"><i class="bi bi-lightning-charge"></i></div>
          <h3 class="text-xl font-bold mb-2">Architectural Highlights</h3>
          <p class="text-secondary leading-relaxed">
            Built 100% on the frontend using Angular 17 standalone components, fine-grained Signals reactivity, functional route guards, reactive forms with custom validation, and zero third-party UI framework bloat.
          </p>
        </div>
      </div>

      <!-- Core Features Grid -->
      <div class="card p-8 mb-12">
        <h2 class="text-2xl font-bold text-center mb-8">Platform Pillars</h2>
        <div class="grid grid-cols-3 gap-6">
          <div class="pillar-box">
            <i class="bi bi-robot text-3xl text-primary mb-2"></i>
            <h4 class="font-bold text-base mb-1">Bot Bidding Engine</h4>
            <p class="text-xs text-secondary">Simulates 8 autonomous competitive bidders placing realistic counter-bids every 3 to 6 seconds.</p>
          </div>

          <div class="pillar-box">
            <i class="bi bi-clock-history text-3xl text-warning mb-2"></i>
            <h4 class="font-bold text-base mb-1">Anti-Sniping Shield</h4>
            <p class="text-xs text-secondary">Ensures fair auctions by extending the timer by 2 minutes whenever a bid is submitted in the final 60 seconds.</p>
          </div>

          <div class="pillar-box">
            <i class="bi bi-wallet2 text-3xl text-success mb-2"></i>
            <h4 class="font-bold text-base mb-1">Escrow &amp; Local Persistence</h4>
            <p class="text-xs text-secondary">All bids, wallet transactions, watchlists, listings, orders and invoices persist locally in browser localStorage.</p>
          </div>
        </div>
      </div>

      <div class="cta-banner card p-8 text-center bg-subtle">
        <h3 class="text-xl font-bold mb-2">Ready to explore rare treasures?</h3>
        <p class="text-sm text-secondary mb-4">Register free today and start bidding with ₹50,000 welcome wallet balance.</p>
        <a routerLink="/auctions" class="btn btn-primary">Browse All 30 Auctions</a>
      </div>
    </div>
  `,
  styles: [`
    .about-page {
      padding-top: 20px;
      padding-bottom: 60px;
    }
    .page-title {
      font-size: 38px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .hero-desc {
      font-size: 16px;
      max-width: 680px;
      margin: 0 auto;
    }
    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    .pillar-box {
      text-align: center;
      padding: 16px;
    }
    @media (max-width: 768px) {
      .about-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AboutComponent {}

