import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auction, Bid, Category, Question } from '../models/auction.model';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { WalletService } from './wallet.service';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class AuctionService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private notif = inject(NotificationService);
  private wallet = inject(WalletService);

  private readonly AUCTIONS_KEY = 'bb_auctions';
  private readonly WATCHLIST_KEY = 'bb_watchlist';
  private readonly BOTS = [
    'Aarav Mehta',
    'Diya Kapoor',
    'Kabir Singhania',
    'Meera Nair',
    'Rohan Deshmukh',
    'Sneha Iyer',
    'Vihaan Reddy',
    'Anaya Joshi'
  ];

  // Reactive State Signals
  auctions = signal<Auction[]>([]);
  categories = signal<Category[]>([]);
  watchlist = signal<number[]>(this.loadWatchlist());
  currentTime = signal<number>(Date.now());
  toast = signal<ToastMessage | null>(null);

  // Global filters
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('all');

  // Computed state
  activeAuctions = computed(() => {
    const now = this.currentTime();
    return this.auctions().filter(a => !a.isSold && a.endTime > now);
  });

  endedAuctions = computed(() => {
    const now = this.currentTime();
    return this.auctions().filter(a => a.isSold || a.endTime <= now);
  });

  featuredAuctions = computed(() => {
    return this.activeAuctions().filter(a => a.featured);
  });

  endingSoonAuctions = computed(() => {
    const now = this.currentTime();
    return this.activeAuctions()
      .filter(a => a.endTime - now <= 30 * 60 * 1000) // ending within 30 min
      .sort((a, b) => a.endTime - b.endTime);
  });

  hotAuctions = computed(() => {
    return [...this.activeAuctions()].sort((a, b) => (b.bids?.length || 0) - (a.bids?.length || 0));
  });

  totalBidsCount = computed(() => {
    return this.auctions().reduce((acc, a) => acc + (a.bids?.length || 0), 0);
  });

  totalVolume = computed(() => {
    return this.auctions().reduce((acc, a) => acc + this.getCurrentPrice(a), 0);
  });

  uniqueBiddersCount = computed(() => {
    const set = new Set<string>();
    this.auctions().forEach(a => a.bids?.forEach(b => set.add(b.bidder)));
    return set.size;
  });

  constructor() {
    this.initData();

    // 1-second live clock ticker
    setInterval(() => {
      this.currentTime.set(Date.now());
      this.checkFinishedAuctions();
    }, 1000);

    // Bot bidding simulation engine (every 3 to 6 seconds)
    this.scheduleNextBotBid();
  }

  private initData() {
    const saved = localStorage.getItem(this.AUCTIONS_KEY);
    if (saved) {
      try {
        const parsed: Auction[] = JSON.parse(saved);
        this.auctions.set(parsed);
      } catch (e) {
        console.error('Failed to parse saved auctions', e);
      }
    }

    this.http.get<{ categories: Category[]; auctions: any[] }>('assets/db.json').subscribe({
      next: (db) => {
        if (db.categories) {
          this.categories.set(db.categories);
        }

        // If no local storage auctions, seed from db.json
        if (!saved && db.auctions) {
          const now = Date.now();
          const seeded: Auction[] = db.auctions.map(a => {
            const calculatedEndTime = now + (a.endsInMinutes || 30) * 60 * 1000;
            return {
              ...a,
              endTime: calculatedEndTime,
              bids: (a.bids || []).map((b: any, index: number) => ({
                ...b,
                time: b.time && b.time > 0 ? b.time : now - (index + 1) * 300000
              }))
            };
          });

          this.auctions.set(seeded);
          this.saveAuctions(seeded);
        }
      },
      error: (err) => console.error('Could not load db.json', err)
    });
  }

  resetDemoData() {
    localStorage.removeItem(this.AUCTIONS_KEY);
    localStorage.removeItem(this.WATCHLIST_KEY);
    localStorage.removeItem('bb_orders');
    localStorage.removeItem('bb_notifications');
    localStorage.removeItem('bb_wallet_tx');

    this.http.get<{ categories: Category[]; auctions: any[] }>('assets/db.json').subscribe({
      next: (db) => {
        const now = Date.now();
        const seeded: Auction[] = (db.auctions || []).map(a => ({
          ...a,
          endTime: now + (a.endsInMinutes || 30) * 60 * 1000,
          bids: (a.bids || []).map((b: any, i: number) => ({
            ...b,
            time: b.time && b.time > 0 ? b.time : now - (i + 1) * 300000
          }))
        }));

        this.auctions.set(seeded);
        this.saveAuctions(seeded);
        this.watchlist.set([]);
        this.showToast('Demo data successfully reset to initial factory state!', 'info');
      }
    });
  }

  // --- Pricing & Calculation Helpers ---
  getCurrentPrice(a: Auction): number {
    if (!a.bids || a.bids.length === 0) return a.startPrice;
    return a.bids.reduce((max, b) => b.amount > max ? b.amount : max, a.bids[0].amount);
  }

  getMinNextBid(a: Auction): number {
    if (!a.bids || a.bids.length === 0) return a.startPrice;
    return this.getCurrentPrice(a) + a.bidIncrement;
  }

  getHighestBidder(a: Auction): string | null {
    if (!a.bids || a.bids.length === 0) return null;
    const sorted = [...a.bids].sort((x, y) => y.amount - x.amount);
    return sorted[0].bidder;
  }

  isReserveMet(a: Auction): boolean {
    if (!a.reservePrice) return true;
    return this.getCurrentPrice(a) >= a.reservePrice;
  }

  isAuctionEnded(a: Auction): boolean {
    return !!a.isSold || a.endTime <= this.currentTime();
  }

  isUrgent(a: Auction): boolean {
    const diff = a.endTime - this.currentTime();
    return diff > 0 && diff < 5 * 60 * 1000; // under 5 mins
  }

  getAuctionById(id: number): Auction | undefined {
    return this.auctions().find(a => a.id === Number(id));
  }

  // --- Bidding & Anti-Sniping ---
  placeBid(auctionId: number, amount: number, isAutoBid: boolean = false): { success: boolean; message?: string } {
    const user = this.auth.currentUser();
    if (!user) {
      return { success: false, message: 'Please log in to place bids' };
    }

    const auction = this.getAuctionById(auctionId);
    if (!auction) {
      return { success: false, message: 'Auction not found' };
    }

    if (this.isAuctionEnded(auction)) {
      return { success: false, message: 'This auction has already ended' };
    }

    const minRequired = this.getMinNextBid(auction);
    if (amount < minRequired) {
      return {
        success: false,
        message: `Bid must be at least ₹${minRequired.toLocaleString('en-IN')} (Minimum increment is ₹${auction.bidIncrement.toLocaleString('en-IN')})`
      };
    }

    if (user.wallet < amount) {
      return {
        success: false,
        message: `Insufficient wallet balance. You have ₹${user.wallet.toLocaleString('en-IN')} but bid is ₹${amount.toLocaleString('en-IN')}. Please top up your wallet!`
      };
    }

    const previousHighestBidder = this.getHighestBidder(auction);

    // Anti-Sniping check: if placed in the last 60 seconds, extend auction by 2 minutes
    const now = Date.now();
    let newEndTime = auction.endTime;
    const remainingSeconds = Math.floor((auction.endTime - now) / 1000);
    let extendedNotice = false;

    if (remainingSeconds > 0 && remainingSeconds <= 60) {
      newEndTime = auction.endTime + 2 * 60 * 1000;
      extendedNotice = true;
    }

    const newBid: Bid = {
      id: 'bid-' + Date.now() + Math.floor(Math.random() * 1000),
      bidder: user.name,
      amount,
      time: now,
      isAutoBid
    };

    const updatedAuction: Auction = {
      ...auction,
      endTime: newEndTime,
      bids: [...(auction.bids || []), newBid]
    };

    this.updateAuctionInStore(updatedAuction);

    if (extendedNotice) {
      this.showToast('⏱️ Anti-sniping activated! Auction timer extended by 2 minutes.', 'warning');
      this.notif.add(
        'Anti-Sniping Extension',
        `A last-minute bid extended '${auction.title}' by 2 minutes!`,
        'system',
        auction.id
      );
    } else {
      this.showToast(`Bid of ₹${amount.toLocaleString('en-IN')} placed successfully!`, 'success');
    }

    // Notify previous bidder if outbid
    if (previousHighestBidder && previousHighestBidder !== user.name) {
      this.notif.add(
        'Outbid Alert!',
        `You have been outbid on '${auction.title}' by ${user.name} (₹${amount.toLocaleString('en-IN')}).`,
        'outbid',
        auction.id
      );
    }

    return { success: true };
  }

  // --- Proxy / Max Auto-Bid ---
  setProxyMaxBid(auctionId: number, maxAmount: number): { success: boolean; message?: string } {
    const user = this.auth.currentUser();
    if (!user) return { success: false, message: 'Please log in' };

    const auction = this.getAuctionById(auctionId);
    if (!auction) return { success: false, message: 'Auction not found' };

    const minRequired = this.getMinNextBid(auction);
    if (maxAmount < minRequired) {
      return { success: false, message: `Auto-bid ceiling must be at least ₹${minRequired.toLocaleString('en-IN')}` };
    }

    if (user.wallet < maxAmount) {
      return { success: false, message: `Wallet balance insufficient for auto-bid limit of ₹${maxAmount.toLocaleString('en-IN')}` };
    }

    // Place initial minimum bid
    this.placeBid(auctionId, minRequired, true);

    // Save proxy limit
    const existingProxies = auction.proxyMaxBids || {};
    const updatedAuction: Auction = {
      ...this.getAuctionById(auctionId)!,
      proxyMaxBids: {
        ...existingProxies,
        [user.name]: maxAmount
      }
    };

    this.updateAuctionInStore(updatedAuction);
    this.showToast(`Auto-bidding activated up to ₹${maxAmount.toLocaleString('en-IN')}!`, 'success');
    return { success: true };
  }

  // --- Buy Now ---
  buyNow(auctionId: number): { success: boolean; message?: string } {
    const user = this.auth.currentUser();
    if (!user) return { success: false, message: 'Please log in to purchase' };

    const auction = this.getAuctionById(auctionId);
    if (!auction) return { success: false, message: 'Auction not found' };

    if (!auction.buyNowPrice) return { success: false, message: 'Buy Now is not enabled for this item' };

    if (this.isAuctionEnded(auction)) return { success: false, message: 'Auction is already ended or sold' };

    if (user.wallet < auction.buyNowPrice) {
      return {
        success: false,
        message: `Insufficient wallet balance (Requires ₹${auction.buyNowPrice.toLocaleString('en-IN')}). Please add funds to wallet!`
      };
    }

    const updatedAuction: Auction = {
      ...auction,
      isSold: true,
      soldTo: user.name,
      soldAmount: auction.buyNowPrice,
      endTime: Date.now() // End immediately
    };

    this.updateAuctionInStore(updatedAuction);
    this.showToast(`Congratulations! You bought '${auction.title}' via Buy Now!`, 'success');

    this.notif.add(
      'Instant Buy Now Complete',
      `You purchased '${auction.title}' for ₹${auction.buyNowPrice.toLocaleString('en-IN')}. Proceed to checkout!`,
      'won',
      auction.id
    );

    return { success: true };
  }

  // --- Watchlist Management ---
  private loadWatchlist(): number[] {
    const saved = localStorage.getItem(this.WATCHLIST_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  toggleWatchlist(auctionId: number) {
    const current = this.watchlist();
    let updated: number[];
    if (current.includes(auctionId)) {
      updated = current.filter(id => id !== auctionId);
      this.showToast('Removed from watchlist', 'info');
    } else {
      updated = [...current, auctionId];
      this.showToast('Added to watchlist ⭐', 'success');
    }
    this.watchlist.set(updated);
    localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(updated));
  }

  isWatchlisted(auctionId: number): boolean {
    return this.watchlist().includes(auctionId);
  }

  // --- Seller Operations ---
  createAuction(newItem: Partial<Auction>): Auction {
    const user = this.auth.currentUser();
    const id = Date.now();
    const durationMinutes = newItem.endsInMinutes || 60;
    const endTime = Date.now() + durationMinutes * 60 * 1000;

    const auction: Auction = {
      id,
      title: newItem.title || 'Untitled Auction',
      category: newItem.category || 'Collectibles',
      condition: newItem.condition || 'Brand New',
      seller: user ? user.name : 'Verified Seller',
      sellerRating: 5.0,
      sellerSales: 1,
      startPrice: Number(newItem.startPrice) || 1000,
      reservePrice: newItem.reservePrice ? Number(newItem.reservePrice) : undefined,
      buyNowPrice: newItem.buyNowPrice ? Number(newItem.buyNowPrice) : undefined,
      bidIncrement: Number(newItem.bidIncrement) || 500,
      endsInMinutes: durationMinutes,
      endTime,
      location: newItem.location || 'Mumbai, Maharashtra',
      rating: 5.0,
      featured: false,
      description: newItem.description || '',
      images: newItem.images && newItem.images.length > 0 ? newItem.images : [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80'
      ],
      bids: [],
      questions: []
    };

    const updated = [auction, ...this.auctions()];
    this.auctions.set(updated);
    this.saveAuctions(updated);
    this.showToast('Your item has been listed for auction!', 'success');
    return auction;
  }

  updateAuction(updatedAuction: Auction) {
    const updated = this.auctions().map(a => a.id === updatedAuction.id ? updatedAuction : a);
    this.auctions.set(updated);
    this.saveAuctions(updated);
    this.showToast('Listing updated successfully', 'success');
  }

  deleteAuction(id: number): boolean {
    const auction = this.getAuctionById(id);
    if (!auction) return false;

    if (auction.bids && auction.bids.length > 0 && !this.auth.isAdmin()) {
      this.showToast('Cannot cancel listing: Bids have already been placed on this item', 'danger');
      return false;
    }

    const updated = this.auctions().filter(a => a.id !== id);
    this.auctions.set(updated);
    this.saveAuctions(updated);
    this.showToast('Auction listing deleted', 'info');
    return true;
  }

  // --- Q&A on Auctions ---
  addQuestion(auctionId: number, questionText: string) {
    const user = this.auth.currentUser();
    const auction = this.getAuctionById(auctionId);
    if (!auction) return;

    const newQ: Question = {
      id: 'q-' + Date.now(),
      user: user ? user.name : 'Anonymous Buyer',
      question: questionText,
      time: Date.now()
    };

    const updated: Auction = {
      ...auction,
      questions: [...(auction.questions || []), newQ]
    };
    this.updateAuctionInStore(updated);
    this.showToast('Question submitted to seller!', 'success');
  }

  answerQuestion(auctionId: number, questionId: string, answerText: string) {
    const auction = this.getAuctionById(auctionId);
    if (!auction || !auction.questions) return;

    const updatedQuestions = auction.questions.map(q => q.id === questionId ? { ...q, answer: answerText } : q);
    const updated: Auction = {
      ...auction,
      questions: updatedQuestions
    };
    this.updateAuctionInStore(updated);
    this.showToast('Answer posted!', 'success');
  }

  // --- Real-Time Bot Bidding Simulation ---
  private scheduleNextBotBid() {
    // Pick random interval between 3000ms and 6000ms
    const randomDelay = Math.floor(Math.random() * 3000) + 3000;
    setTimeout(() => {
      this.simulateBotBid();
      this.scheduleNextBotBid();
    }, randomDelay);
  }

  private simulateBotBid() {
    const active = this.activeAuctions();
    if (active.length === 0) return;

    // Pick a random active auction
    const target = active[Math.floor(Math.random() * active.length)];
    const currentHighBidder = this.getHighestBidder(target);

    // Pick a bot bidder
    const availableBots = this.BOTS.filter(b => b !== currentHighBidder);
    const botName = availableBots[Math.floor(Math.random() * availableBots.length)];

    const minBid = this.getMinNextBid(target);
    // Occasionally jump 1 or 2 increments
    const bidStepMultiplier = Math.random() < 0.25 ? 2 : 1;
    const botBidAmount = minBid + (bidStepMultiplier - 1) * target.bidIncrement;

    const newBid: Bid = {
      id: 'bid-bot-' + Date.now() + Math.floor(Math.random() * 100),
      bidder: botName,
      amount: botBidAmount,
      time: Date.now(),
      isAutoBid: false
    };

    // Check if any registered user has proxy auto-bid configured
    let proxyCounterBid: Bid | null = null;
    if (target.proxyMaxBids) {
      for (const [username, maxLimit] of Object.entries(target.proxyMaxBids)) {
        if (username !== botName && maxLimit >= botBidAmount + target.bidIncrement) {
          proxyCounterBid = {
            id: 'bid-proxy-' + (Date.now() + 50),
            bidder: username,
            amount: botBidAmount + target.bidIncrement,
            time: Date.now() + 500,
            isAutoBid: true
          };
          break;
        }
      }
    }

    const newBidsList = [...(target.bids || []), newBid];
    if (proxyCounterBid) {
      newBidsList.push(proxyCounterBid);
    }

    // Check anti-sniping for bot bid
    let newEndTime = target.endTime;
    const remainingSecs = Math.floor((target.endTime - Date.now()) / 1000);
    if (remainingSecs > 0 && remainingSecs <= 60) {
      newEndTime = target.endTime + 2 * 60 * 1000;
    }

    const updatedAuction: Auction = {
      ...target,
      endTime: newEndTime,
      bids: newBidsList
    };

    this.updateAuctionInStore(updatedAuction);

    // If current logged-in user was the leader and was outbid by bot:
    const currentUser = this.auth.currentUser();
    if (currentUser && currentHighBidder === currentUser.name && (!proxyCounterBid || proxyCounterBid.bidder !== currentUser.name)) {
      this.notif.add(
        'Outbid Alert!',
        `You were outbid on '${target.title}' by ${botName} (₹${botBidAmount.toLocaleString('en-IN')})`,
        'outbid',
        target.id
      );
    }
  }

  private checkFinishedAuctions() {
    const now = this.currentTime();
    const currentList = this.auctions();
    let hasChanges = false;

    currentList.forEach(a => {
      if (!a.isSold && a.endTime <= now) {
        const winner = this.getHighestBidder(a);
        const winningAmount = this.getCurrentPrice(a);

        if (winner) {
          const reserveMet = !a.reservePrice || winningAmount >= a.reservePrice;
          if (reserveMet) {
            a.isSold = true;
            a.soldTo = winner;
            a.soldAmount = winningAmount;
            hasChanges = true;

            const currentUser = this.auth.currentUser();
            if (currentUser && currentUser.name === winner) {
              this.notif.add(
                '🏆 You Won the Auction!',
                `Congratulations! You won '${a.title}' for ₹${winningAmount.toLocaleString('en-IN')}. Complete payment now!`,
                'won',
                a.id
              );
            }
          }
        }
      }
    });

    if (hasChanges) {
      this.auctions.set([...currentList]);
      this.saveAuctions(currentList);
    }
  }

  private updateAuctionInStore(auction: Auction) {
    const updated = this.auctions().map(a => a.id === auction.id ? auction : a);
    this.auctions.set(updated);
    this.saveAuctions(updated);
  }

  private saveAuctions(list: Auction[]) {
    localStorage.setItem(this.AUCTIONS_KEY, JSON.stringify(list));
  }

  showToast(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info') {
    const id = 'toast-' + Date.now();
    this.toast.set({ id, message, type });
    setTimeout(() => {
      if (this.toast()?.id === id) {
        this.toast.set(null);
      }
    }, 4000);
  }
}

