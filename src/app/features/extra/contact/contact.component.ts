import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuctionService } from '../../../core/services/auction.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="contact-page container">
      <div class="text-center py-10">
        <h1 class="page-title">Contact Support &amp; Concierge</h1>
        <p class="text-secondary max-w-lg mx-auto">
          Need assistance with lot consignments, appraisals, or bidding questions? We're here to assist.
        </p>
      </div>

      <div class="contact-grid">
        <!-- Info Column -->
        <div class="contact-info card p-8">
          <h3 class="font-bold text-xl mb-4">Concierge Headquarters</h3>
          <p class="text-sm text-secondary mb-6 leading-relaxed">
            BidBazaar Auctioneers Private Limited<br/>
            Level 14, Express Towers, Nariman Point<br/>
            Mumbai, Maharashtra 400021, India
          </p>

          <div class="contact-item flex items-center gap-3 mb-4">
            <div class="contact-icon"><i class="bi bi-telephone-fill"></i></div>
            <div>
              <div class="text-xs text-muted">Toll-Free Phone:</div>
              <strong class="text-sm">+91 (22) 6789-0123</strong>
            </div>
          </div>

          <div class="contact-item flex items-center gap-3 mb-4">
            <div class="contact-icon"><i class="bi bi-envelope-fill"></i></div>
            <div>
              <div class="text-xs text-muted">Email Desk:</div>
              <strong class="text-sm">support&#64;bidbazaar.com</strong>
            </div>
          </div>

          <div class="contact-item flex items-center gap-3">
            <div class="contact-icon"><i class="bi bi-clock-fill"></i></div>
            <div>
              <div class="text-xs text-muted">Live Support Hours:</div>
              <strong class="text-sm">24/7 Real-Time Concierge</strong>
            </div>
          </div>
        </div>

        <!-- Form Column -->
        <div class="contact-form-wrap card p-8">
          <h3 class="font-bold text-xl mb-4">Send a Message</h3>
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label" for="cName">Your Name</label>
              <input id="cName" type="text" class="form-control" formControlName="name" placeholder="Sarthak Sharma" />
            </div>

            <div class="form-group">
              <label class="form-label" for="cEmail">Your Email</label>
              <input id="cEmail" type="email" class="form-control" formControlName="email" placeholder="you@example.com" />
            </div>

            <div class="form-group">
              <label class="form-label" for="cSubject">Subject</label>
              <select id="cSubject" class="form-control" formControlName="subject">
                <option value="bidding">Bidding &amp; Auto-Bids</option>
                <option value="seller">Consigning &amp; Selling Items</option>
                <option value="escrow">Wallet &amp; Payment Escrow</option>
                <option value="technical">Technical Inquiries</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="cMsg">Message</label>
              <textarea id="cMsg" rows="4" class="form-control" formControlName="message" placeholder="How can our specialist help you?"></textarea>
            </div>

            <button type="submit" class="btn btn-primary w-full" [disabled]="contactForm.invalid">
              <i class="bi bi-send-fill"></i> Submit Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-page {
      padding-top: 20px;
      padding-bottom: 60px;
    }
    .page-title {
      font-size: 38px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 32px;
      max-width: 900px;
      margin: 0 auto;
    }
    .contact-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    @media (max-width: 768px) {
      .contact-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(AuctionService);

  contactForm!: FormGroup;

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['bidding', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) return;
    this.svc.showToast('Your message has been sent to our concierge desk!', 'success');
    this.contactForm.reset({ subject: 'bidding' });
  }
}

