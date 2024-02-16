export interface CashDrawerInterface {
  cashier_id: number;
  CurrencyCode: string;
  date: string;
  initialAmount: string;
  is_synced: number;
  remainingAmount: string;
  transaction: string;
  note: string;
  status: string;
  closed_at: string;
}
