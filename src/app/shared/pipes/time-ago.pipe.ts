import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(timestamp: number | null | undefined): string {
    if (!timestamp) return '';
    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));

    if (elapsedSeconds < 5) return 'just now';
    if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `${elapsedHours}h ago`;

    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays === 1) return 'yesterday';
    if (elapsedDays < 30) return `${elapsedDays}d ago`;

    const elapsedMonths = Math.floor(elapsedDays / 30);
    if (elapsedMonths < 12) return `${elapsedMonths}mo ago`;

    const elapsedYears = Math.floor(elapsedDays / 365);
    return `${elapsedYears}y ago`;
  }
}

