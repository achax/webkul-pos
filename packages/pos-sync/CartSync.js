import React from 'react';
import { db } from '~/models';

export const CartSync = ({ item }) => {
  /**
   * set cart product object
   */
  const cartProduct = {
    quoteId: Math.floor(Math.random() * 99999),
    cashierId: null,
    discount: null,
    grandDiscount: null,
    grandDiscountType: null,
    items: {
      productId: item.entity_id,
      qty: 1,
      options: [],
      price: item.final_price,
      max_allowed_qty: item.quantity,
      min_allowed_qty: 1,
      name: item.name,
      sku: item.sku,
      subtotal: item.final_price,
    },
    applied_coupons: null,
    tax: null,
  };

  return <div></div>;
};
