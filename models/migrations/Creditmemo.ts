export interface CreditMemo {
  cashier_id: number;
  creditmemo_id: number;
  creditmemo_increment_id: string;
  creditmemo_status: string;
  date: string;
  discounts: string;
  id: number;
  item_qtys: [
    {
      item_id: number;
      qty: number;
    }
  ];
  message: string;
  order_id: string;
  return_amount: number;
}
