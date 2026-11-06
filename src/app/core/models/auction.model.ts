export interface Bid {
  id: string;
  bidder: string;
  amount: number;
  time: number;
  isAutoBid?: boolean;
}

export interface Question {
  id: string;
  user: string;
  question: string;
  answer?: string;
  time: number;
}

export type AuctionCondition = 'Brand New' | 'Like New' | 'Refurbished' | 'Vintage' | 'Good' | 'Fair';

export interface Auction {
  id: number;
  title: string;
  category: string;
  condition: AuctionCondition;
  seller: string;
  sellerRating?: number;
  sellerSales?: number;
  startPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  bidIncrement: number;
  endsInMinutes: number;
  endTime: number; // calculated epoch timestamp
  location: string;
  rating?: number;
  featured?: boolean;
  description: string;
  images: string[];
  bids: Bid[];
  questions?: Question[];
  proxyMaxBids?: { [username: string]: number }; // Max/auto-bid for proxy bidding
  isSold?: boolean;
  soldTo?: string;
  soldAmount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

