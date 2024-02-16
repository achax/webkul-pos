export interface TaxRuleList {
  calculate_subtotal: Boolean;
  code: String;
  position: Number;
  priority: Number;
  tax_calculation_rule_id: Number;
  customer_tax_classes: [];
  product_tax_classes: [];
  tax_rates: [];
}
