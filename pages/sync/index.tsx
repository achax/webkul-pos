import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { db, openConnection } from '~/models';
import {
  StoreConfig,
  Products,
  Categories,
  Customers,
  Coupons,
  HoldCart,
  OrderList,
  CashDrawer,
  Reports,
  StoreList,
  TaxRateList,
  Creditmemo,
  TaxRuleList,
} from '@webkul/pos-sync';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { isValidArray, isValidObject } from '~/utils/Helper';
import { configActions } from '~/store/config';
import { cashierActions } from '~/store/cashier';
import { Loader } from '@webkul/pos-ui';
import { cartActions } from '~store/cart';
import { useAccessToken } from '~hooks';
import { useSelector } from 'react-redux';
import { Trans } from '@lingui/macro';
let outletId: number = 0;
let cashierId: number = 0;

export enum SECTION {
  CONFIG,
  CASHIER,
  CATEGORIES,
  PRODUCTS,
  CUSTOMERS,
  COUPONS,
  HOLDCART,
  ORDERLIST,
  CREDITMEMO,
  CASHDRAWER,
  CART,
  REPORTS,
  STORELIST,
  TAX_RATE_LIST,
  TAX_RULE_LIST,
  LOADED,
}

const Sync: NextPage = () => {
  const router = useRouter();
  const { accessToken } = useAccessToken();

  const dispatch = useDispatch();

  const [showFetch, setShowFetch] = useState(false);
  const storeConfig = useSelector((state: any) => state?.storeConfig?.config);
  const [appName, setAppName] = useState('Pos-App');

  const [activeSection, setActiveSection] = useState(SECTION.CONFIG);
  if (!db.isOpen()) {
    openConnection();
  }
  useEffect(() => {
    if (isValidObject(storeConfig)) {
      setAppName(storeConfig?.application_name);
    }
  }, [storeConfig]);

  useEffect(() => {
    if (isValidObject(storeConfig)) {
      setAppName(storeConfig?.application_name);
    }
  }, [storeConfig]);

  useEffect(() => {
    async function fetchPosConfig() {
      const storeConfig = await db.storeConfig.toArray();
      if (isValidArray(storeConfig)) {
        dispatch(configActions.setConfig(storeConfig?.[0]));
        setActiveSection(SECTION.CASHIER);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchCashier() {
      const cashier = await db.cashier.toArray();
      if (isValidArray(cashier)) {
        dispatch(cashierActions.loggedIn(cashier[0]));
        outletId = cashier[0].outlet_id;
        cashierId = cashier[0].id;
        setActiveSection(SECTION.CATEGORIES);
      } else {
        router.replace('/login');
      }
    }

    async function fetchCategories() {
      const categories = await db.categories.count();
      if (categories > 0) {
        setActiveSection(SECTION.PRODUCTS);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchProducts() {
      const products = await db.products.count();
      if (products > 0) {
        setActiveSection(SECTION.CUSTOMERS);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchCustomers() {
      const customers = await db.customer.count();
      if (customers > 0) {
        setActiveSection(SECTION.COUPONS);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchCoupons() {
      const coupons = await db.coupons.count();
      if (coupons > 0) {
        setActiveSection(SECTION.HOLDCART);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchHoldCarts() {
      const holdCart = await db.holdCart.count();
      if (holdCart > 0) {
        setActiveSection(SECTION.ORDERLIST);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchOrderLists() {
      const orderList = await db.orderList.count();
      if (orderList > 0) {
        setActiveSection(SECTION.CREDITMEMO);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchCreditmemo() {
      const creditMemo = await db.creditMemo.count();
      if (creditMemo > 0) {
        setActiveSection(SECTION.CASHDRAWER);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchCashDrawer() {
      const cashDrawer = await db.cashDrawer.count();
      if (cashDrawer > 0) {
        setActiveSection(SECTION.REPORTS);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchCart() {
      const cart = await db.cart.toArray();
      if (cart.length > 0) {
        dispatch(cartActions.setCart(cart[0] as any));
        setActiveSection(SECTION.LOADED);
      } else {
        setActiveSection(SECTION.REPORTS);
        setActiveSection(SECTION.LOADED);
      }
    }

    async function fetchReports() {
      const reports = await db.reports.toArray();
      if (reports.length > 0) {
        setActiveSection(SECTION.STORELIST);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchStoreList() {
      const storeList = await db.storeList.toArray();
      if (isValidArray(storeList)) {
        setActiveSection(SECTION.TAX_RATE_LIST);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchTaxRateList() {
      const taxRateList = await db.taxRateList.toArray();
      if (isValidArray(taxRateList)) {
        setActiveSection(SECTION.TAX_RULE_LIST);
      } else {
        setShowFetch(true);
      }
    }

    async function fetchTaxRuleList() {
      const taxRuleList = await db.taxRuleList.toArray();
      if (isValidArray(taxRuleList)) {
        setActiveSection(SECTION.CART);
      } else {
        setShowFetch(true);
      }
    }

    if (activeSection === SECTION.LOADED) {
      router.replace('/');
    }
    async function processSync() {
      if (activeSection === SECTION.CONFIG) await fetchPosConfig();
      if (activeSection === SECTION.CASHIER) await fetchCashier();
      if (activeSection === SECTION.CATEGORIES) await fetchCategories();
      if (activeSection === SECTION.PRODUCTS) await fetchProducts();
      if (activeSection === SECTION.CUSTOMERS) await fetchCustomers();
      if (activeSection === SECTION.COUPONS) await fetchCoupons();
      if (activeSection === SECTION.HOLDCART) await fetchHoldCarts();
      if (activeSection === SECTION.ORDERLIST) await fetchOrderLists();
      if (activeSection === SECTION.CREDITMEMO) await fetchCreditmemo();
      if (activeSection === SECTION.CASHDRAWER) await fetchCashDrawer();
      if (activeSection === SECTION.REPORTS) await fetchReports();
      if (activeSection === SECTION.STORELIST) await fetchStoreList();
      if (activeSection === SECTION.TAX_RATE_LIST) await fetchTaxRateList();
      if (activeSection === SECTION.TAX_RULE_LIST) await fetchTaxRuleList();
      if (activeSection === SECTION.CART) await fetchCart();
    }

    processSync();
  }, [activeSection, dispatch, router]);

  const afterFetch = (section: SECTION) => {
    setShowFetch(false);
    setActiveSection(section);
  };
  return (
    <React.Fragment>
      <div className="pos_sync_loader">
        <Loader />
        <h1>
          {appName} <Trans>is Syncing...</Trans>
        </h1>
      </div>

      {showFetch && activeSection === SECTION.CONFIG && (
        <StoreConfig
          header={accessToken}
          triggerReqCompleted={() => {
            afterFetch(SECTION.CASHIER);
          }}
        />
      )}
      {showFetch && activeSection === SECTION.CATEGORIES && (
        <Categories
          triggerReqCompleted={() => {
            afterFetch(SECTION.PRODUCTS);
          }}
          header={accessToken}
        />
      )}
      {showFetch && activeSection === SECTION.PRODUCTS && (
        <Products
          triggerReqCompleted={() => {
            afterFetch(SECTION.CUSTOMERS);
          }}
          header={accessToken}
        />
      )}
      {showFetch && activeSection === SECTION.CUSTOMERS && (
        <Customers
          triggerReqCompleted={() => {
            afterFetch(SECTION.COUPONS);
          }}
          header={accessToken}
        />
      )}
      {showFetch && activeSection === SECTION.COUPONS && (
        <Coupons
          triggerReqCompleted={() => {
            afterFetch(SECTION.HOLDCART);
          }}
          header={accessToken}
        />
      )}
      {showFetch && activeSection === SECTION.HOLDCART && (
        <>
          <HoldCart
            triggerReqCompleted={() => {
              afterFetch(SECTION.ORDERLIST);
            }}
            header={accessToken}
          />
        </>
      )}
      {showFetch && activeSection === SECTION.ORDERLIST && (
        <OrderList
          triggerReqCompleted={() => {
            afterFetch(SECTION.CREDITMEMO);
          }}
          header={accessToken}
        />
      )}
      {showFetch && activeSection === SECTION.CREDITMEMO && (
        <Creditmemo
          triggerReqCompleted={() => {
            afterFetch(SECTION.CASHDRAWER);
          }}
          header={accessToken}
        />
      )}
      {showFetch && activeSection === SECTION.REPORTS && (
        <Reports
          triggerReqCompleted={() => {
            afterFetch(SECTION.STORELIST);
          }}
          header={accessToken}
        />
      )}
      {showFetch && activeSection === SECTION.CASHDRAWER && (
        <CashDrawer
          triggerReqCompleted={() => {
            afterFetch(SECTION.REPORTS);
          }}
          header={accessToken}
        />
      )}

      {showFetch && activeSection === SECTION.STORELIST && (
        <StoreList
          triggerReqCompleted={() => {
            afterFetch(SECTION.TAX_RATE_LIST);
          }}
          header={accessToken}
        />
      )}

      {showFetch && activeSection === SECTION.TAX_RATE_LIST && (
        <TaxRateList
          triggerReqCompleted={() => {
            afterFetch(SECTION.TAX_RULE_LIST);
          }}
          header={accessToken}
        />
      )}

      {showFetch && activeSection === SECTION.TAX_RULE_LIST && (
        <TaxRuleList
          triggerReqCompleted={() => {
            afterFetch(SECTION.CART);
          }}
          header={accessToken}
        />
      )}
    </React.Fragment>
  );
};
export default Sync;
