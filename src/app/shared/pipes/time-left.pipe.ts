import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeLeft',
  standalone: true
})
export class TimeLeftPipe implements PipeTransform {
  transform(endTime: number | null | undefined, now: number = Date.now()): string {
    if (!endTime) return 'Ended';
    const diff = Math.max(0, Math.floor((endTime - now) / 1000));
    if (diff === 0) return 'Ended';

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  }
}

