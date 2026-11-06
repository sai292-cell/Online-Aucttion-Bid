export type TransactionType = 'CREDIT' | 'DEBIT' | 'BID_HOLD' | 'BID_REFUND';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: number;
  balanceAfter: number;
  referenceId?: string;
}

