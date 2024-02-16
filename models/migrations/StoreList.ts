export interface StoreListInterface {
  code: string;
  currencies: [Currencies];
  group_id: Number;
  is_active: string;
  is_currently_active: Boolean;
  locale_code: string;
  locale_label: string;
  name: string;
  store_id: Number;
  website_id: Number;
}

export interface Currencies {
  currency: string;
  rate: Number;
}
