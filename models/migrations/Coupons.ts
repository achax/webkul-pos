export interface CouponsInterface {
  coupon_code: string;
  rule_id: number;
  name: string;
  description: string;
  from_date: string;
  to_date: string;
  is_active: number;
  simple_action: string;
  discount_amount: number;
  discount_step: number;
}
