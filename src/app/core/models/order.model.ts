export type OrderStatus = 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Order {
  id: string;
  auctionId: number;
  auctionTitle: string;
  auctionImage: string;
  buyerId: string;
  buyerName: string;
  seller: string;
  finalAmount: number;
  shippingFee: number;
  tax: number;
  totalPaid: number;
  shippingAddress: ShippingAddress;
  paymentMethod: 'wallet' | 'card' | 'upi';
  orderDate: number;
  status: OrderStatus;
  trackingNumber?: string;
  hasReviewed?: boolean;
}

export interface Review {
  id: string;
  seller: string;
  buyerName: string;
  rating: number;
  comment: string;
  time: number;
  itemTitle: string;
}

