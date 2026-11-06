import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionService } from '../../../core/services/auction.service';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="countdown-badge" [class.urgent]="isUrgent" [class.ended]="isEnded" [class.compact]="compact">
      <i class="bi" [class.bi-clock]="!isEnded" [class.bi-hourglass-bottom]="isUrgent && !isEnded" [class.bi-check-circle]="isEnded"></i>
      <span class="timer-text">{{ formattedTime }}</span>
    </div>
  `,
  styles: [`
    .countdown-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 600;
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
      letter-spacing: 0.3px;
    }

    .countdown-badge.compact {
      padding: 3px 8px;
      font-size: 11px;
    }

    .countdown-badge.urgent {
      background: var(--danger-light);
      color: var(--danger-text);
      border-color: rgba(239, 68, 68, 0.3);
      animation: pulse-urgent 1.5s infinite;
    }

    .countdown-badge.ended {
      background: var(--bg-hover);
      color: var(--text-muted);
      border-color: var(--border-subtle);
    }

    @keyframes pulse-urgent {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
  `]
})
export class CountdownTimerComponent {
  private svc = inject(AuctionService);

  @Input({ required: true }) endTime!: number;
  @Input() compact = false;

  get now(): number {
    return this.svc.currentTime();
  }

  get isEnded(): boolean {
    return !this.endTime || this.endTime <= this.now;
  }

  get isUrgent(): boolean {
    if (this.isEnded) return false;
    const diff = this.endTime - this.now;
    return diff > 0 && diff < 5 * 60 * 1000;
  }

  get formattedTime(): string {
    if (this.isEnded) return 'Ended';
    const totalSecs = Math.max(0, Math.floor((this.endTime - this.now) / 1000));
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  }
}
