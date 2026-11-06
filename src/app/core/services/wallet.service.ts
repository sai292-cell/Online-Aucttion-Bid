import { Injectable, inject, signal, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { WalletTransaction, TransactionType } from '../models/wallet.model';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private auth = inject(AuthService);
  private readonly TX_STORAGE_KEY = 'bb_wallet_tx';

  transactions = signal<WalletTransaction[]>([]);

  constructor() {
    this.loadTransactions();

    // Re-load when user changes
    effect(() => {
      const u = this.auth.currentUser();
      if (u) {
        this.loadTransactions();
      } else {
        this.transactions.set([]);
      }
    }, { allowSignalWrites: true });
  }

  get balance(): number {
    return this.auth.currentUser()?.wallet || 0;
  }

  private loadTransactions() {
    const raw = localStorage.getItem(this.TX_STORAGE_KEY);
    if (raw) {
      try {
        const all: WalletTransaction[] = JSON.parse(raw);
        const user = this.auth.currentUser();
        if (user) {
          this.transactions.set(all.filter(tx => tx.userId === user.id));
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Default sample transaction if empty
    const user = this.auth.currentUser();
    if (user && this.transactions().length === 0) {
      const initialTx: WalletTransaction = {
        id: 'TX-INIT-' + Math.floor(Math.random() * 89999 + 10000),
        userId: user.id,
        type: 'CREDIT',
        amount: user.wallet,
        description: 'Account signup balance allocation',
        timestamp: Date.now() - 86400000 * 2,
        balanceAfter: user.wallet,
        referenceId: 'REF-JOIN-BONUS'
      };
      this.transactions.set([initialTx]);
      this.saveTransactions([initialTx]);
    }
  }

  addFunds(amount: number, paymentMethod: string = 'UPI'): boolean {
    const user = this.auth.currentUser();
    if (!user || amount <= 0) return false;

    const newBalance = user.wallet + amount;
    const tx: WalletTransaction = {
      id: 'TX-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100),
      userId: user.id,
      type: 'CREDIT',
      amount,
      description: `Wallet top-up via ${paymentMethod.toUpperCase()}`,
      timestamp: Date.now(),
      balanceAfter: newBalance,
      referenceId: 'TOPUP-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    this.auth.updateCurrentUserWallet(newBalance);
    const updated = [tx, ...this.transactions()];
    this.transactions.set(updated);
    this.saveTransactions(updated);
    return true;
  }

  deductFunds(amount: number, description: string, referenceId?: string): boolean {
    const user = this.auth.currentUser();
    if (!user || user.wallet < amount) return false;

    const newBalance = user.wallet - amount;
    const tx: WalletTransaction = {
      id: 'TX-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100),
      userId: user.id,
      type: 'DEBIT',
      amount,
      description,
      timestamp: Date.now(),
      balanceAfter: newBalance,
      referenceId
    };

    this.auth.updateCurrentUserWallet(newBalance);
    const updated = [tx, ...this.transactions()];
    this.transactions.set(updated);
    this.saveTransactions(updated);
    return true;
  }

  private saveTransactions(userTx: WalletTransaction[]) {
    const raw = localStorage.getItem(this.TX_STORAGE_KEY);
    let all: WalletTransaction[] = [];
    if (raw) {
      try {
        all = JSON.parse(raw);
      } catch {
        all = [];
      }
    }
    const user = this.auth.currentUser();
    if (!user) return;

    // Filter out this user's old txs and merge
    const others = all.filter(t => t.userId !== user.id);
    localStorage.setItem(this.TX_STORAGE_KEY, JSON.stringify([...userTx, ...others]));
  }
}

