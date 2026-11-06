import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuctionService } from '../../../core/services/auction.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <footer class="footer-root">
      <div class="container footer-content">
        <div class="footer-grid">
          <!-- Col 1: Brand & College Project info -->
          <div class="footer-col brand-col">
            <div class="footer-logo flex items-center gap-2">
              <div class="logo-icon-box">
                <i class="bi bi-hammer"></i>
              </div>
              <span class="brand-title">Bid<span class="brand-highlight">Bazaar</span></span>
            </div>
            <p class="brand-description">
              India's premier real-time auction marketplace engineered with Angular 17 standalone components, Signals, and reactive simulated live bidding.
            </p>
            <div class="college-badge">
              <i class="bi bi-mortarboard-fill"></i>
              <span>College Final Project • Complete Frontend</span>
            </div>
          </div>

          <!-- Col 2: Categories -->
          <div class="footer-col">
            <h4 class="col-heading">Top Categories</h4>
            <ul class="footer-links">
              <li><a [routerLink]="['/auctions']" [queryParams]="{ cat: 'Watches' }">Luxury Watches</a></li>
              <li><a [routerLink]="['/auctions']" [queryParams]="{ cat: 'Electronics' }">Flagship Electronics</a></li>
              <li><a [routerLink]="['/auctions']" [queryParams]="{ cat: 'Art' }">Fine Art & Sculptures</a></li>
              <li><a [routerLink]="['/auctions']" [queryParams]="{ cat: 'Vehicles' }">Classic Automobiles</a></li>
              <li><a [routerLink]="['/auctions']" [queryParams]="{ cat: 'Collectibles' }">Rare Collectibles</a></li>
            </ul>
          </div>

          <!-- Col 3: Quick Links -->
          <div class="footer-col">
            <h4 class="col-heading">Marketplace</h4>
            <ul class="footer-links">
              <li><a routerLink="/how-it-works">How Real-Time Bidding Works</a></li>
              <li><a routerLink="/seller/new">Sell an Item</a></li>
              <li><a routerLink="/dashboard">Buyer Dashboard</a></li>
              <li><a routerLink="/about">About BidBazaar</a></li>
              <li><a routerLink="/faq">Frequently Asked Questions</a></li>
              <li><a routerLink="/contact">Contact Support</a></li>
            </ul>
          </div>

          <!-- Col 4: Newsletter & Security -->
          <div class="footer-col">
            <h4 class="col-heading">Auction Alerts</h4>
            <p class="newsletter-subtext">Get notified when ultra-rare grail items and estate auctions go live.</p>
            <form (ngSubmit)="subscribeNewsletter()" class="newsletter-form">
              <div class="newsletter-input-group">
                <input
                  type="email"
                  class="newsletter-input"
                  placeholder="Enter your email"
                  [(ngModel)]="newsletterEmail"
                  name="email"
                  required
                />
                <button type="submit" class="btn btn-primary btn-sm newsletter-btn">Join</button>
              </div>
            </form>
            <div class="security-badges flex items-center gap-3">
              <div class="sec-item"><i class="bi bi-shield-check"></i> Escrow Protected</div>
              <div class="sec-item"><i class="bi bi-stopwatch"></i> Anti-Sniping</div>
            </div>
          </div>
        </div>

        <div class="footer-bottom flex justify-between items-center">
          <div class="copy-text">
            © 2026 BidBazaar Inc. Built with Angular 17 & Signals. All simulation data stored locally.
          </div>
          <div class="social-links flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noopener" class="social-icon"><i class="bi bi-github"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" class="social-icon"><i class="bi bi-linkedin"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noopener" class="social-icon"><i class="bi bi-twitter-x"></i></a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-root {
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);
      margin-top: 60px;
      padding-top: 50px;
      padding-bottom: 30px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 36px;
      margin-bottom: 40px;
    }
    .brand-col {
      padding-right: 20px;
    }
    .footer-logo {
      margin-bottom: 14px;
    }
    .logo-icon-box {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
    }
    .brand-title {
      font-family: var(--font-heading);
      font-size: 20px;
      font-weight: 800;
      color: var(--text-primary);
    }
    .brand-highlight {
      color: var(--primary);
    }
    .brand-description {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .college-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      border: 1px solid var(--border-subtle);
      font-size: 12px;
      font-weight: 600;
      color: var(--primary);
    }
    .col-heading {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 16px;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-links a {
      font-size: 13px;
      color: var(--text-secondary);
    }
    .footer-links a:hover {
      color: var(--primary);
      text-decoration: underline;
    }
    .newsletter-subtext {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .newsletter-input-group {
      display: flex;
      gap: 6px;
    }
    .newsletter-input {
      flex: 1;
      padding: 8px 12px;
      font-size: 13px;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      color: var(--text-primary);
      outline: none;
    }
    .newsletter-input:focus {
      border-color: var(--primary);
    }
    .newsletter-btn {
      padding: 8px 14px;
    }
    .security-badges {
      margin-top: 18px;
    }
    .sec-item {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .footer-bottom {
      border-top: 1px solid var(--border-subtle);
      padding-top: 24px;
      font-size: 12.5px;
      color: var(--text-muted);
    }
    .social-icon {
      font-size: 16px;
      color: var(--text-secondary);
      transition: var(--transition);
    }
    .social-icon:hover {
      color: var(--primary);
    }
    @media (max-width: 900px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      .footer-bottom {
        flex-direction: column;
        gap: 14px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  private svc = inject(AuctionService);
  newsletterEmail = '';

  subscribeNewsletter() {
    if (this.newsletterEmail) {
      this.svc.showToast('Thanks for subscribing to BidBazaar auction drops! 🔔', 'success');
      this.newsletterEmail = '';
    }
  }
}
