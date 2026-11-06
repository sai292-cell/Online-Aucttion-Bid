export type NotificationType = 'outbid' | 'ending' | 'won' | 'payment_due' | 'wallet' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  time: number;
  read: boolean;
  type: NotificationType;
  auctionId?: number;
}

