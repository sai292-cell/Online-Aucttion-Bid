import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FaqItem {
  q: string;
  a: string;
  open?: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="faq-page container">
      <div class="text-center py-10">
        <span class="badge" style="background:#fef3c7; color:#92400e; margin-bottom: 12px;">KNOWLEDGE BASE</span>
        <h1 class="page-title">Frequently Asked Questions</h1>
        <p class="text-secondary max-w-lg mx-auto">
          Everything about simulated bidding, proxy limits, wallets, and seller listings
        </p>
      </div>

      <div class="faq-accordion-wrap max-w-3xl mx-auto">
        @for (item of faqs; track $index) {
          <div class="faq-item card mb-3" [class.is-open]="item.open">
            <div class="faq-question p-4 flex justify-between items-center" (click)="toggle($index)">
              <span class="font-bold text-sm">{{ item.q }}</span>
              <i class="bi" [class.bi-chevron-down]="!item.open" [class.bi-chevron-up]="item.open"></i>
            </div>
            @if (item.open) {
              <div class="faq-answer px-4 pb-4 pt-1 text-sm text-secondary border-t">
                {{ item.a }}
              </div>
            }
          </div>
        }
      </div>

      <div class="support-card card p-6 mt-8 max-w-3xl mx-auto text-center bg-subtle">
        <h4 class="font-bold mb-1">Still have questions?</h4>
        <p class="text-xs text-muted mb-3">Our support team and viva guide have answers to all technical questions.</p>
        <a routerLink="/contact" class="btn btn-secondary btn-sm">Contact Support Desk</a>
      </div>
    </div>
  `,
  styles: [`
    .faq-page {
      padding-top: 20px;
      padding-bottom: 60px;
    }
    .page-title {
      font-size: 38px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .faq-question {
      cursor: pointer;
      user-select: none;
    }
    .faq-item.is-open {
      border-color: var(--primary-border);
    }
    .faq-answer {
      line-height: 1.6;
    }
  `]
})
export class FaqComponent {
  faqs: FaqItem[] = [
    {
      q: 'How does the simulated real-time bidding work without a backend server?',
      a: 'BidBazaar uses an RxJS timer/interval simulation engine running inside Angular. A pool of 8 autonomous simulated bot bidders (Aarav, Diya, Kabir, Meera, Rohan, Sneha, Vihaan, Anaya) evaluate active auctions every 3 to 6 seconds and place incremental bids with authentic timestamp records, simulating a live Sotheby’s or eBay bidding room.',
      open: true
    },
    {
      q: 'What is the Anti-Sniping rule and how does it prevent unfair wins?',
      a: 'Anti-sniping ensures fair competition for all collectors. If any bidder (human or bot) submits a qualifying bid within the final 60 seconds before an auction closes, our engine automatically extends the lot end time by an additional 120 seconds (2 minutes).',
      open: false
    },
    {
      q: 'How does Proxy / Max Auto-Bidding work?',
      a: 'When you enter a maximum limit on an auction, the system places only the minimum bid needed to put you in the lead. Whenever another user or bot bids against you, the system automatically counters on your behalf up to your ceiling limit.',
      open: false
    },
    {
      q: 'Where is user and auction data stored?',
      a: 'All state changes (user accounts, bids, wallet balances, watchlists, seller listings, notifications, orders, and reviews) are persisted in the browser’s localStorage. Initial seed data is retrieved via Angular HttpClient from src/assets/db.json on first launch.',
      open: false
    },
    {
      q: 'Can I cancel or delete an auction I created as a seller?',
      a: 'Per fair auction regulations, sellers can only cancel or remove an active lot if ZERO bids have been placed on it. Once a bidder submits a valid bid, the listing is locked until the auction concludes.',
      open: false
    },
    {
      q: 'What is a "Reserve Price"?',
      a: 'A reserve price is a confidential minimum price below which a seller is not obligated to sell the item. If the highest bid at closing is below the reserve price, the auction ends as unsold.',
      open: false
    },
    {
      q: 'How does Buy Now work?',
      a: 'If a seller specifies a Buy Now price, a buyer can bypass the bidding countdown entirely and instantly purchase the lot at that pre-set price. The item is immediately marked as SOLD and the buyer is guided to checkout.',
      open: false
    },
    {
      q: 'How do I top up my simulated wallet balance?',
      a: 'Click the wallet pill in the sticky top navigation bar or the "Add Money" button on the dashboard. You can select instant test amounts (₹10,000, ₹50,000, ₹1,00,000) via mock UPI or Cards.',
      open: false
    }
  ];

  toggle(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}

