import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppNotification, NotificationType } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly STORAGE_KEY = 'bb_notifications';

  notifications = signal<AppNotification[]>([]);

  unreadCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  constructor() {
    this.initNotifications();

    effect(() => {
      const u = this.auth.currentUser();
      if (u) {
        this.filterForCurrentUser();
      }
    }, { allowSignalWrites: true });
  }

  private initNotifications() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const list: AppNotification[] = JSON.parse(saved);
        this.notifications.set(list);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    this.http.get<{ notifications: AppNotification[] }>('assets/db.json').subscribe({
      next: (data) => {
        if (data && data.notifications) {
          this.notifications.set(data.notifications);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.notifications));
        }
      }
    });
  }

  private filterForCurrentUser() {
    const user = this.auth.currentUser();
    if (!user) return;
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        const list: AppNotification[] = JSON.parse(raw);
        this.notifications.set(list.filter(n => n.userId === user.id || n.userId === 'all'));
      } catch (e) {
        console.error(e);
      }
    }
  }

  add(title: string, message: string, type: NotificationType = 'system', auctionId?: number) {
    const user = this.auth.currentUser();
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now() + Math.floor(Math.random() * 100),
      userId: user ? user.id : 'u-buyer',
      title,
      message,
      time: Date.now(),
      read: false,
      type,
      auctionId
    };

    const current = this.notifications();
    const updated = [newNotif, ...current];
    this.notifications.set(updated);
    this.persistAll(newNotif);
  }

  markAsRead(id: string) {
    const updated = this.notifications().map(n => n.id === id ? { ...n, read: true } : n);
    this.notifications.set(updated);
    this.saveCurrent();
  }

  markAllAsRead() {
    const updated = this.notifications().map(n => ({ ...n, read: true }));
    this.notifications.set(updated);
    this.saveCurrent();
  }

  remove(id: string) {
    const updated = this.notifications().filter(n => n.id !== id);
    this.notifications.set(updated);
    this.saveCurrent();
  }

  private saveCurrent() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    let all: AppNotification[] = [];
    if (raw) {
      try { all = JSON.parse(raw); } catch { all = []; }
    }
    const current = this.notifications();
    const user = this.auth.currentUser();
    if (!user) return;

    const others = all.filter(n => n.userId !== user.id && n.userId !== 'all');
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...current, ...others]));
  }

  private persistAll(single: AppNotification) {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    let all: AppNotification[] = [];
    if (raw) {
      try { all = JSON.parse(raw); } catch { all = []; }
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([single, ...all]));
  }
}

