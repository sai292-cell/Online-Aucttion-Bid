import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" [class.interactive]="interactive">
      @for (star of stars; track star) {
        <i
          class="bi"
          [class.bi-star-fill]="currentRating >= star"
          [class.bi-star-half]="currentRating >= star - 0.5 && currentRating < star"
          [class.bi-star]="currentRating < star - 0.5"
          (click)="onSelect(star)"
        ></i>
      }
      @if (showValue) {
        <span class="rating-value">{{ currentRating | number:'1.1-1' }}</span>
      }
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      color: #f59e0b;
      font-size: 14px;
    }
    .star-rating.interactive i {
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .star-rating.interactive i:hover {
      transform: scale(1.2);
    }
    .rating-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-left: 4px;
    }
  `]
})
export class StarRatingComponent {
  @Input() currentRating = 5;
  @Input() interactive = false;
  @Input() showValue = true;
  @Output() ratingChange = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5];

  onSelect(star: number) {
    if (this.interactive) {
      this.currentRating = star;
      this.ratingChange.emit(star);
    }
  }
}

