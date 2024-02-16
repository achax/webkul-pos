export interface OrderListInterface {
  address: string;
  cash_received: number;
  cash_returned: number;
  cashier_name: string;
  currency_code: string;
  coupon_code: string;
  customer: string;
  date: string;
  discount: number;
  grand_total: number;
  grandtotal_discount: number;
  increment_id: string;
  items: string;
  message: string;
  order_id: string;
  cashier_id: number;
  payment: string;
  pos_order_id: string;
  payment_code: string;
  payment_label: string;
  state: string;
  status: string;
  synchronized: number;
  tax: number;
}
