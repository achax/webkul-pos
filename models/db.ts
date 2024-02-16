import Dexie, { Table } from 'dexie';
import {
  CashierInterface,
  CategoriesInterface,
  ProductInterface,
  StoreConfigInterface,
  CartsInterface,
  CustomersInterface,
  HoldCartInterface,
  OrderListInterface,
  CashDrawerInterface,
  CouponsInterface,
  PosReportsInterface,
  StoreListInterface,
  TaxRateList,
  CreditMemo,
  TaxRuleList,
} from './migrations';
import { useState } from 'react';

const VERSION = 2.2;

export const DB_NAME = 'PosDb';

export class PosDb extends Dexie {
  products!: Table<ProductInterface, number>;
  storeConfig!: Table<StoreConfigInterface, number>;
  cashier!: Table<CashierInterface, number>;
  categories!: Table<CategoriesInterface, number>;
  cart!: Table<CartsInterface, number>;
  customer!: Table<CustomersInterface, number>;
  holdCart!: Table<HoldCartInterface, number>;
  orderList!: Table<OrderListInterface, number>;
  creditMemo!: Table<CreditMemo, number>;
  cashDrawer!: Table<CashDrawerInterface, number>;
  coupons!: Table<CouponsInterface, number>;
  reports!: Table<PosReportsInterface, number>;
  storeList!: Table<StoreListInterface, number>;
  taxRuleList!: Table<TaxRuleList, number>;
  taxRateList!: Table<TaxRateList, number>;

  constructor() {
    super(DB_NAME);
    this.version(VERSION).stores({
      products: 'entity_id, sku, barcode_attribute, visibility, quantity',
      categories: 'category_id, parent_id',
      storeConfig: 'id, code',
      cashier: 'id, outlet_id, email',
      cart: 'quoteId, cashierId',
      customer: '++entity_id, id, group_id',
      holdCart: ' ++id,hold_cart_id, cashier_id, outlet_id,synchronized',
      orderList:
        '++increment_id, order_id,id, cashier_id, outlet_id, synchronized,pos_order_id',
      creditMemo: '++creditmemo_increment_id, id, cashier_id, order_id',
      cashDrawer: '++id,cashier_id, date, status, is_synced',
      coupons: 'rule_id',
      reports:
        '++id, grossRevenueTotal,netRevenueTotal,totalOrder,averageOrder,averageItemOrder,totalDiscountedOffer,grossRevenue,netRevenue,orderData,averageOrderValue,averageItemPerOrder,discountedOffers',
      storeList: '++id',
      taxRateList:
        '++tax_calculation_rate_id, id,code,rate,region_name,tax_country_id,tax_postcode,tax_region_id',
      taxRuleList:
        '++tax_calculation_rule_id,id, calculate_subtotal,code,position,priority,  product_tax_classes, tax_rates,  customer_tax_classes',
    });
    this.open();
  }
}

export const db = new PosDb();

const tables: [
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table
] = [
  db.products,
  db.storeConfig,
  db.cashier,
  db.categories,
  db.cart,
  db.customer,
  db.holdCart,
  db.orderList,
  db.creditMemo,
  db.cashDrawer,
  db.coupons,
  db.reports,
  db.storeList,
  db.taxRateList,
  db.taxRuleList,
];

export function resetDatabase() {
  return db.transaction('rw', tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
}

const refreshTable: [
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table,
  Table
] = [
  db.products,
  db.storeConfig,
  db.cashier,
  db.categories,
  db.cart,
  db.customer,
  db.holdCart,
  db.orderList,
  db.cashDrawer,
  db.coupons,
  db.reports,
  db.storeList,
  db.taxRateList,
  db.taxRuleList,
];

export function refreshDatabase() {
  return db.transaction('rw', refreshTable, async () => {
    await db.cashier.clear();
    await db.storeConfig.clear();
    await db.categories.clear();
    await db.products.clear();
    await db.customer.clear();
    await db.coupons.clear();
    await db.holdCart.clear();
    await db.orderList.clear();
    await db.cashDrawer.clear();
    await db.cart.clear();
    await db.reports.clear();
    await db.taxRateList.clear();
    await db.taxRuleList.clear();
  });
}

export function openConnection() {
  return db.open();
}

export function closeConnection() {
  if (db.isOpen() === true) {
    db.close();
  }
  return true;
}
/**
 * Method for check database that exist or not
 */
export function useCheckDbStatus() {
  const [checkIndexDb, setCheckIndexDb] = useState<Boolean>(false);
  Dexie.exists('PosDb').then(function (exists) {
    setCheckIndexDb(exists);
  });
  return checkIndexDb;
}
/**
 * Method for delete database
 */
export function deleteIndexDb() {
  Dexie.exists('PosDb').then(function (exists) {
    if (exists) {
      Dexie.delete('PosDb');
    }
  });
}
