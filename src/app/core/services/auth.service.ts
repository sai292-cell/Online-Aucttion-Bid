import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, AuthSession, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly SESSION_KEY = 'bb_session';
  private readonly USERS_KEY = 'bb_users';

  currentUser = signal<User | null>(this.getStoredSessionUser());
  users = signal<User[]>([]);

  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isSeller = computed(() => this.currentUser()?.role === 'seller' || this.currentUser()?.role === 'admin');
  isBuyer = computed(() => this.currentUser()?.role === 'buyer');

  constructor() {
    this.initUsers();
  }

  private initUsers() {
    const saved = localStorage.getItem(this.USERS_KEY);
    if (saved) {
      try {
        this.users.set(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }

    // Load from db.json if not present
    this.http.get<{ users: User[] }>('assets/db.json').subscribe({
      next: (data) => {
        if (data && data.users) {
          this.users.set(data.users);
          localStorage.setItem(this.USERS_KEY, JSON.stringify(data.users));
        }
      },
      error: (err) => console.error('Could not load seed users', err)
    });
  }

  private getStoredSessionUser(): User | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) return null;
    try {
      const session: AuthSession = JSON.parse(raw);
      if (session.expiresAt > Date.now()) {
        return session.user;
      } else {
        localStorage.removeItem(this.SESSION_KEY);
        return null;
      }
    } catch {
      return null;
    }
  }

  login(email: string, password: string): { success: boolean; message?: string } {
    const user = this.users().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'Invalid email or user does not exist' };
    }

    if (user.isBlocked) {
      return { success: false, message: 'Your account has been suspended by administration. Please contact support.' };
    }

    // Simple match or demo match
    if (user.password && user.password !== password && password !== 'Password@123') {
      return { success: false, message: 'Incorrect password' };
    }

    const fakeToken = 'bb_jwt_' + btoa(`${user.id}:${user.role}:${Date.now()}`);
    const session: AuthSession = {
      token: fakeToken,
      user,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.currentUser.set(user);
    return { success: true };
  }

  register(userData: { name: string; email: string; password: string; role: UserRole; phone?: string }): { success: boolean; message?: string } {
    const exists = this.users().some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Email is already registered. Please login.' };
    }

    const newUser: User = {
      id: 'u-' + Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      wallet: 50000, // Sign up bonus ₹50,000 to bid immediately!
      phone: userData.phone || '+91 99999 00000',
      isBlocked: false,
      joined: new Date().toISOString().split('T')[0]
    };

    const updated = [...this.users(), newUser];
    this.users.set(updated);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(updated));

    // Log the user in directly
    return this.login(newUser.email, userData.password);
  }

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  updateCurrentUserWallet(newBalance: number) {
    const current = this.currentUser();
    if (!current) return;

    const updatedUser = { ...current, wallet: newBalance };
    this.currentUser.set(updatedUser);

    // Update in session
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      session.user = updatedUser;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }

    // Update in users array
    const updatedUsers = this.users().map(u => u.id === current.id ? updatedUser : u);
    this.users.set(updatedUsers);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));
  }

  // Admin controls
  toggleUserBlock(userId: string): boolean {
    const updated = this.users().map(u => {
      if (u.id === userId) {
        return { ...u, isBlocked: !u.isBlocked };
      }
      return u;
    });
    this.users.set(updated);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(updated));

    if (this.currentUser()?.id === userId) {
      this.logout();
    }
    return true;
  }
}

