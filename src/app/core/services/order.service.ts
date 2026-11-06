import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order, Review, ShippingAddress } from '../models/order.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly ORDERS_KEY = 'bb_orders';
  private readonly REVIEWS_KEY = 'bb_reviews';

  orders = signal<Order[]>([]);
  reviews = signal<Review[]>([]);

  constructor() {
    this.initData();
  }

  private initData() {
    // Orders
    const savedOrders = localStorage.getItem(this.ORDERS_KEY);
    if (savedOrders) {
      try {
        this.orders.set(JSON.parse(savedOrders));
      } catch (e) {
        console.error(e);
      }
    } else {
      this.http.get<{ sampleOrders: Order[] }>('assets/db.json').subscribe({
        next: (data) => {
          if (data && data.sampleOrders) {
            this.orders.set(data.sampleOrders);
            localStorage.setItem(this.ORDERS_KEY, JSON.stringify(data.sampleOrders));
          }
        }
      });
    }

    // Reviews
    const savedReviews = localStorage.getItem(this.REVIEWS_KEY);
    if (savedReviews) {
      try {
        this.reviews.set(JSON.parse(savedReviews));
      } catch (e) {
        console.error(e);
      }
    } else {
      this.http.get<{ reviews: Review[] }>('assets/db.json').subscribe({
        next: (data) => {
          if (data && data.reviews) {
            this.reviews.set(data.reviews);
            localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(data.reviews));
          }
        }
      });
    }
  }

  createOrder(orderData: {
    auctionId: number;
    auctionTitle: string;
    auctionImage: string;
    seller: string;
    finalAmount: number;
    shippingFee: number;
    tax: number;
    shippingAddress: ShippingAddress;
    paymentMethod: 'wallet' | 'card' | 'upi';
  }): Order {
    const user = this.auth.currentUser();
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const totalPaid = orderData.finalAmount + orderData.shippingFee + orderData.tax;

    const newOrder: Order = {
      id: orderId,
      auctionId: orderData.auctionId,
      auctionTitle: orderData.auctionTitle,
      auctionImage: orderData.auctionImage,
      buyerId: user ? user.id : 'u-buyer',
      buyerName: user ? user.name : 'Guest Buyer',
      seller: orderData.seller,
      finalAmount: orderData.finalAmount,
      shippingFee: orderData.shippingFee,
      tax: orderData.tax,
      totalPaid,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      orderDate: Date.now(),
      status: 'Paid',
      trackingNumber: 'BBZ-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      hasReviewed: false
    };

    const updated = [newOrder, ...this.orders()];
    this.orders.set(updated);
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(updated));
    return newOrder;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders().find(o => o.id === id);
  }

  updateOrderStatus(orderId: string, status: 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled') {
    const updated = this.orders().map(o => o.id === orderId ? { ...o, status } : o);
    this.orders.set(updated);
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(updated));
  }

  addReview(orderId: string, seller: string, rating: number, comment: string, itemTitle: string) {
    const user = this.auth.currentUser();
    const newReview: Review = {
      id: 'rev-' + Date.now(),
      seller,
      buyerName: user ? user.name : 'Anonymous Buyer',
      rating,
      comment,
      time: Date.now(),
      itemTitle
    };

    const updatedReviews = [newReview, ...this.reviews()];
    this.reviews.set(updatedReviews);
    localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(updatedReviews));

    // Mark order as reviewed
    const updatedOrders = this.orders().map(o => o.id === orderId ? { ...o, hasReviewed: true } : o);
    this.orders.set(updatedOrders);
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(updatedOrders));
  }

  getSellerReviews(sellerName: string): Review[] {
    return this.reviews().filter(r => r.seller.toLowerCase() === sellerName.toLowerCase());
  }
}

