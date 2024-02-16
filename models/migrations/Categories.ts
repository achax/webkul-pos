export interface CategoriesInterface {
  category_id: number;
  parent_id: number;
  name: string;
  position: number;
  level: number;
  is_active: number;
  is_allowed: number;
  product_count: number;
  outlet_id: number;
  children_data: string;
}
