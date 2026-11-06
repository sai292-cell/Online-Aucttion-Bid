import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuctionService } from '../../../core/services/auction.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuctionCondition } from '../../../core/models/auction.model';
import { CurrencyINRPipe } from '../../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-sell-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, CurrencyINRPipe],
  template: `
    <div class="sell-item-page container">
      <!-- Multi-step Stepper Header -->
      <div class="stepper-header mb-8">
        <h1 class="page-title text-center mb-2">Consign &amp; List an Auction Lot</h1>
        <p class="text-sm text-secondary text-center mb-6">Complete 5 quick steps to launch your real-time auction lot</p>

        <div class="stepper-progress-bar">
          <div class="step-indicator" [class.active]="currentStep >= 1" [class.current]="currentStep === 1">
            <span class="step-bullet">1</span>
            <span class="step-text">Details</span>
          </div>
          <div class="stepper-line" [class.active]="currentStep >= 2"></div>
          <div class="step-indicator" [class.active]="currentStep >= 2" [class.current]="currentStep === 2">
            <span class="step-bullet">2</span>
            <span class="step-text">Media</span>
          </div>
          <div class="stepper-line" [class.active]="currentStep >= 3"></div>
          <div class="step-indicator" [class.active]="currentStep >= 3" [class.current]="currentStep === 3">
            <span class="step-bullet">3</span>
            <span class="step-text">Pricing</span>
          </div>
          <div class="stepper-line" [class.active]="currentStep >= 4"></div>
          <div class="step-indicator" [class.active]="currentStep >= 4" [class.current]="currentStep === 4">
            <span class="step-bullet">4</span>
            <span class="step-text">Duration</span>
          </div>
          <div class="stepper-line" [class.active]="currentStep >= 5"></div>
          <div class="step-indicator" [class.active]="currentStep >= 5" [class.current]="currentStep === 5">
            <span class="step-bullet">5</span>
            <span class="step-text">Review</span>
          </div>
        </div>
      </div>

      <!-- Step Cards Container -->
      <div class="sell-card-wrap">
        <div class="card p-8 sell-form-card">
          <!-- STEP 1: Details -->
          @if (currentStep === 1) {
            <div class="step-panel">
              <h2 class="step-title mb-4">Step 1: Item Details &amp; Provenance</h2>
              <form [formGroup]="detailsForm">
                <div class="form-group">
                  <label class="form-label" for="lotTitle">Auction Title</label>
                  <input
                    id="lotTitle"
                    type="text"
                    class="form-control"
                    formControlName="title"
                    placeholder="e.g. 1968 Omega Seamaster 300 Automatic"
                  />
                  @if (df['title'].touched && df['title'].errors) {
                    <div class="invalid-feedback">Title is required (minimum 5 characters).</div>
                  }
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label class="form-label" for="lotCategory">Category</label>
                    <select id="lotCategory" class="form-control" formControlName="category">
                      @for (cat of svc.categories(); track cat.id) {
                        <option [value]="cat.name">{{ cat.name }}</option>
                      }
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="lotCondition">Condition</label>
                    <select id="lotCondition" class="form-control" formControlName="condition">
                      <option value="Brand New">Brand New</option>
                      <option value="Like New">Like New</option>
                      <option value="Refurbished">Refurbished</option>
                      <option value="Vintage">Vintage</option>
                      <option value="Good">Good</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="lotLocation">Location (City, State)</label>
                  <input id="lotLocation" type="text" class="form-control" formControlName="location" placeholder="e.g. Mumbai, Maharashtra" />
                </div>

                <div class="form-group">
                  <label class="form-label" for="lotDesc">Detailed Description</label>
                  <textarea
                    id="lotDesc"
                    rows="4"
                    class="form-control"
                    formControlName="description"
                    placeholder="Describe original documentation, service history, box, papers and condition notes..."
                  ></textarea>
                  @if (df['description'].touched && df['description'].errors) {
                    <div class="invalid-feedback">Description required (min 20 characters).</div>
                  }
                </div>
              </form>
            </div>
          }

          <!-- STEP 2: Images -->
          @if (currentStep === 2) {
            <div class="step-panel">
              <h2 class="step-title mb-2">Step 2: High Resolution Photos</h2>
              <p class="text-sm text-secondary mb-4">Provide 3 image URLs for your auction gallery or use our verified presets.</p>

              <div class="form-group">
                <label class="form-label">Primary Cover Image URL</label>
                <input type="text" class="form-control mb-2" [(ngModel)]="image1" placeholder="https://..." />
              </div>
              <div class="form-group">
                <label class="form-label">Image 2 (Angle/Detail)</label>
                <input type="text" class="form-control mb-2" [(ngModel)]="image2" placeholder="https://..." />
              </div>
              <div class="form-group">
                <label class="form-label">Image 3 (Serial/Back/Accessories)</label>
                <input type="text" class="form-control mb-4" [(ngModel)]="image3" placeholder="https://..." />
              </div>

              <!-- Live Preview Row -->
              <div class="photo-preview-grid">
                <div class="preview-box card">
                  <img [src]="image1" alt="Cover Preview" />
                  <span class="preview-tag">Cover Photo</span>
                </div>
                <div class="preview-box card">
                  <img [src]="image2" alt="Angle Preview" />
                  <span class="preview-tag">Detail</span>
                </div>
                <div class="preview-box card">
                  <img [src]="image3" alt="Close-up Preview" />
                  <span class="preview-tag">Close-up</span>
                </div>
              </div>
            </div>
          }

          <!-- STEP 3: Pricing -->
          @if (currentStep === 3) {
            <div class="step-panel">
              <h2 class="step-title mb-4">Step 3: Reserve &amp; Increments</h2>
              <form [formGroup]="pricingForm">
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label class="form-label">Starting Bid (₹)</label>
                    <input type="number" class="form-control" formControlName="startPrice" />
                    @if (pf['startPrice'].touched && pf['startPrice'].errors) {
                      <div class="invalid-feedback">Minimum starting bid is ₹500.</div>
                    }
                  </div>

                  <div class="form-group">
                    <label class="form-label">Bid Increment Step (₹)</label>
                    <input type="number" class="form-control" formControlName="bidIncrement" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-2">
                  <div class="form-group">
                    <label class="form-label">Hidden Reserve Price (Optional ₹)</label>
                    <input type="number" class="form-control" formControlName="reservePrice" placeholder="e.g. 50000" />
                    <span class="text-xs text-muted">Item will not sell unless bids reach this amount.</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Instant Buy Now Price (Optional ₹)</label>
                    <input type="number" class="form-control" formControlName="buyNowPrice" placeholder="e.g. 75000" />
                    <span class="text-xs text-muted">Allows immediate purchase bypassing bidding.</span>
                  </div>
                </div>
              </form>
            </div>
          }

          <!-- STEP 4: Duration -->
          @if (currentStep === 4) {
            <div class="step-panel">
              <h2 class="step-title mb-4">Step 4: Auction Duration</h2>
              <p class="text-sm text-secondary mb-4">Select how long this lot should remain open for simulated real-time bidding.</p>

              <div class="duration-grid">
                <label class="duration-card" [class.selected]="endsInMinutes === 5">
                  <input type="radio" [(ngModel)]="endsInMinutes" [value]="5" />
                  <div class="flex items-center gap-2">
                    <i class="bi bi-lightning-fill text-warning"></i>
                    <div>
                      <strong>5 Minutes (Flash Demo)</strong>
                      <div class="text-xs text-muted">Ideal for immediate testing &amp; evaluation</div>
                    </div>
                  </div>
                </label>

                <label class="duration-card" [class.selected]="endsInMinutes === 30">
                  <input type="radio" [(ngModel)]="endsInMinutes" [value]="30" />
                  <div class="flex items-center gap-2">
                    <i class="bi bi-clock-history text-primary"></i>
                    <div>
                      <strong>30 Minutes</strong>
                      <div class="text-xs text-muted">Recommended for live test runs</div>
                    </div>
                  </div>
                </label>

                <label class="duration-card" [class.selected]="endsInMinutes === 180">
                  <input type="radio" [(ngModel)]="endsInMinutes" [value]="180" />
                  <div class="flex items-center gap-2">
                    <i class="bi bi-calendar3"></i>
                    <div>
                      <strong>3 Hours</strong>
                      <div class="text-xs text-muted">Standard auction session</div>
                    </div>
                  </div>
                </label>

                <label class="duration-card" [class.selected]="endsInMinutes === 1440">
                  <input type="radio" [(ngModel)]="endsInMinutes" [value]="1440" />
                  <div class="flex items-center gap-2">
                    <i class="bi bi-calendar-check"></i>
                    <div>
                      <strong>24 Hours (1 Day)</strong>
                      <div class="text-xs text-muted">Overnight estate sale</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          }

          <!-- STEP 5: Review & Publish -->
          @if (currentStep === 5) {
            <div class="step-panel">
              <h2 class="step-title mb-4">Step 5: Review Lot &amp; Publish</h2>

              <div class="review-summary card p-6 bg-subtle">
                <div class="flex items-center gap-4 pb-4 border-b">
                  <img [src]="image1" alt="Preview" class="review-thumb" />
                  <div>
                    <span class="badge condition-badge mb-1">{{ detailsForm.value.condition }}</span>
                    <h3 class="font-bold text-lg">{{ detailsForm.value.title }}</h3>
                    <div class="text-xs text-muted">{{ detailsForm.value.category }} • {{ detailsForm.value.location }}</div>
                  </div>
                </div>

                <div class="review-details-grid py-4 border-b text-sm">
                  <div class="flex justify-between py-1">
                    <span class="text-secondary">Starting Bid:</span>
                    <span class="font-bold">{{ pricingForm.value.startPrice | currencyINR }}</span>
                  </div>
                  <div class="flex justify-between py-1">
                    <span class="text-secondary">Bid Increment:</span>
                    <span class="font-bold">+{{ pricingForm.value.bidIncrement | currencyINR }}</span>
                  </div>
                  <div class="flex justify-between py-1">
                    <span class="text-secondary">Reserve Price:</span>
                    <span>{{ pricingForm.value.reservePrice ? (pricingForm.value.reservePrice | currencyINR) : 'None' }}</span>
                  </div>
                  <div class="flex justify-between py-1">
                    <span class="text-secondary">Buy Now:</span>
                    <span>{{ pricingForm.value.buyNowPrice ? (pricingForm.value.buyNowPrice | currencyINR) : 'Disabled' }}</span>
                  </div>
                  <div class="flex justify-between py-1">
                    <span class="text-secondary">Simulated Duration:</span>
                    <span class="font-bold text-primary">{{ endsInMinutes }} Minutes</span>
                  </div>
                </div>

                <p class="text-xs text-secondary mt-3">
                  <i class="bi bi-info-circle"></i> Once published, real-time bots and users will immediately see your lot and may begin placing bids.
                </p>
              </div>
            </div>
          }

          <!-- Navigation Footer Buttons -->
          <div class="stepper-nav-footer flex justify-between items-center mt-8 pt-4 border-t">
            <button
              class="btn btn-secondary"
              (click)="prevStep()"
              [disabled]="currentStep === 1"
            >
              <i class="bi bi-chevron-left"></i> Previous
            </button>

            @if (currentStep < 5) {
              <button class="btn btn-primary" (click)="nextStep()">
                Next Step <i class="bi bi-chevron-right"></i>
              </button>
            } @else {
              <button class="btn btn-primary btn-lg" (click)="publishAuction()">
                <i class="bi bi-rocket-takeoff-fill"></i> Launch Live Auction Now!
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sell-item-page {
      padding-top: 30px;
      padding-bottom: 60px;
    }
    .stepper-progress-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 680px;
      margin: 0 auto;
    }
    .step-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
    }
    .step-bullet {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-subtle);
      border: 2px solid var(--border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
    }
    .step-indicator.active .step-bullet {
      background: var(--primary-light);
      border-color: var(--primary);
      color: var(--primary);
    }
    .step-indicator.current .step-bullet {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    .step-text {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .stepper-line {
      flex: 1;
      height: 2px;
      background: var(--border-strong);
      margin: 0 8px 18px;
    }
    .stepper-line.active {
      background: var(--primary);
    }
    .sell-card-wrap {
      max-width: 760px;
      margin: 0 auto;
    }
    .step-title {
      font-size: 20px;
      font-weight: 800;
    }
    .photo-preview-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .preview-box {
      height: 140px;
      position: relative;
      overflow: hidden;
    }
    .preview-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .preview-tag {
      position: absolute;
      bottom: 6px;
      left: 6px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }
    .duration-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .duration-card {
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      background: var(--bg-surface);
      transition: var(--transition);
    }
    .duration-card.selected {
      border-color: var(--primary);
      background: var(--primary-light);
    }
    .review-thumb {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: var(--radius-md);
    }
    .border-b { border-bottom: 1px solid var(--border-subtle); }
    .border-t { border-top: 1px solid var(--border-subtle); }
    @media (max-width: 768px) {
      .duration-grid, .photo-preview-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SellItemComponent implements OnInit {
  private fb = inject(FormBuilder);
  svc = inject(AuctionService);
  auth = inject(AuthService);
  private router = inject(Router);

  currentStep = 1;

  detailsForm!: FormGroup;
  pricingForm!: FormGroup;

  image1 = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80';
  image2 = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop&q=80';
  image3 = 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&auto=format&fit=crop&q=80';

  endsInMinutes = 30;

  get df() { return this.detailsForm.controls; }
  get pf() { return this.pricingForm.controls; }

  ngOnInit() {
    this.detailsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      category: ['Watches', Validators.required],
      condition: ['Like New', Validators.required],
      location: ['Mumbai, Maharashtra', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });

    this.pricingForm = this.fb.group({
      startPrice: [50000, [Validators.required, Validators.min(500)]],
      bidIncrement: [2500, [Validators.required, Validators.min(100)]],
      reservePrice: [null],
      buyNowPrice: [null]
    });
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (this.detailsForm.invalid) {
        this.detailsForm.markAllAsTouched();
        return;
      }
    }
    if (this.currentStep === 3) {
      if (this.pricingForm.invalid) {
        this.pricingForm.markAllAsTouched();
        return;
      }
    }
    this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  publishAuction() {
    const dVal = this.detailsForm.value;
    const pVal = this.pricingForm.value;

    const created = this.svc.createAuction({
      title: dVal.title,
      category: dVal.category,
      condition: dVal.condition as AuctionCondition,
      location: dVal.location,
      description: dVal.description,
      images: [this.image1, this.image2, this.image3],
      startPrice: Number(pVal.startPrice),
      bidIncrement: Number(pVal.bidIncrement),
      reservePrice: pVal.reservePrice ? Number(pVal.reservePrice) : undefined,
      buyNowPrice: pVal.buyNowPrice ? Number(pVal.buyNowPrice) : undefined,
      endsInMinutes: this.endsInMinutes
    });

    this.router.navigate(['/auctions', created.id]);
  }
}

