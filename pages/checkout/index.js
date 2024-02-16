import React, { useState, useEffect, useRef } from 'react';
import styles from '~/styles/Checkout/Checkout.module.scss';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { OrderItem } from '~/packages/pos-checkout';
import { Popup } from '@webkul/pos-ui';
import Image from 'next/image';
import { CUSTOM_PRODUCT_SKU } from '~/utils/Constants';
import { usePosSync } from '~/hooks';
import { EditCustomer } from '~/packages/pos-customers';
import {
  Input,
  Button,
  TabContent,
  TabList,
  Tabs,
  InitialAmountPopup,
} from '@webkul/pos-ui';
import { Trans, t } from '@lingui/macro';
import { cartActions } from '~/store/cart';
import { useForm } from 'react-hook-form';
import { customerActions } from '~/store/customer';
import { checkoutActions } from '~/store/checkout';
import { orderActions } from '~/store/order';
import { orderItemActions } from '~/store/orderItem';
import { useRouter } from 'next/router';
import {
  showToast,
  getFormattedPrice,
  setOrderInvoice,
  setTransactionData,
  getFormattedText,
  getFormattedDate,
  isValidArray,
  isValidObject,
  getTodayCashDrawer,
  getWeekReport,
  getMonthReport,
  getMonthReportOfNewDay,
  getWeekReportOfNewDay,
  getCurrentTimeIndex,
  getDayReport,
  isValidString,
  getDiscountValue,
  getProductSubTotal,
  getProductItemAmount,
  getSubTotalAfterTax,
  getTax,
  getCartTax,
  getCustomCartDiscount,
  getCartCouponAmt,
  getCurrencyCode,
  getCurrencySymbol,
} from '~/utils/Helper';
import { OtherPay, OrderNote, OrderSuccess } from '../../packages/pos-checkout';
import { AddCustomer, ListPopup } from '@webkul/pos-customers';
import { db } from '~/models';
import ReactTooltip from 'react-tooltip';
import PLACE_ORDER from '~API/mutation/PosPlaceOrder.graphql';
import SAVE_CASH_DRAWER from '~/API/mutation/SaveCashDrawer.graphql';
import { useMutation } from '@apollo/client';
import { usePosTax } from '~/hooks';
import { useAccessToken } from '~/hooks';
import { updateProductQty } from '@webkul/pos-products/hooks/product-handler';
const Pay = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const cardRef = useRef(null);
  const currecy = getCurrencySymbol();
  const { afterOrderPlace } = updateProductQty()
  const cartProducts = useSelector((state) => state.cart?.quote);
  const checkoutData = useSelector((state) => state.checkout?.checkoutData);

  const cashAmount = checkoutData.cashAmount ? checkoutData.cashAmount : 0;
  const cardAmount = checkoutData.cardAmount ? checkoutData.cardAmount : 0;
  const storeConfig = useSelector((state) => state.storeConfig?.config);
  const { cash_title, credit_title, possplit_title } = storeConfig;

  const discountType = cartProducts.grandDiscountType;
  const discount = cartProducts.discount ? cartProducts.discount : 0;
  const [isCustomerPopup, setIsCustomerPopup] = useState(false);
  const [isListPopup, setIsListPopup] = useState(false);
  const [isNotePopup, setIsNotePopup] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [note, setNote] = useState(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInitialAmt, setIsInitialAmt] = useState(false);
  const [cartStatus, setCartStatus] = useState(null);
  const [payableAmount, setPayableAmount] = useState(0);
  const [loader, setLoader] = useState(false);
  const [products, setProducts] = useState();
  const cashierData = useSelector((state) => state?.cashier);
  const applied_coupons = useSelector(
    (state) => state.cart?.quote.applied_coupons
  );
  const { accessToken, getAuthToken } = useAccessToken();
  const offlineMode = useSelector((state) => state.offline?.appOffline);

  const TABS = [
    {
      id: 1,
      title: t`Cash Payment`,
    },
    {
      id: 2,
      title: t`Cards`,
    },
  ];
  const [saveCashDrawer] = useMutation(SAVE_CASH_DRAWER, {
    onError: (error) => console.error(error),
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });
  /**
   * this Usetate For Customer edit Pop up if customer phone number is not exist.
   */
  const [editCustomerPopup, setEditCustomerPopup] = useState(false);
  const [placeOrder] = useMutation(PLACE_ORDER, {
    onError: (e) => {
      handleError(e);
    },
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });

  const {
    taxRate,
    ruleProductTaxClass,
    productCalculationMethod,
    storeProductTaxClass,
  } = usePosTax();

  const {
    formState: { errors },
  } = useForm();

  const current = new Date();
  const date = getFormattedDate(current, false, 'YYYY-DD-MM');
  const [showOptions, setShowOptions] = useState(false);

  const cartData = cartProducts.items;
  const message = useSelector(
    (state) =>
      isValidObject(state?.order?.orderData) && state.order.orderData.message
  );

  const selectedCustomer = useSelector(
    (state) => state.customer?.selectedCustomer
  );

  const { handleFunCallOnPosMode } = usePosSync();

  useEffect(() => {
    setNote(message);
  }, [message]);

  useEffect(() => {
    async function getCustomer() {
      const customer = await db.customer.toCollection().first();
      if (customer?.entity_id) {
        dispatch(customerActions.setCustomer(customer));
      }
    }

    if (!selectedCustomer?.entity_id) getCustomer();
  }, [selectedCustomer, dispatch]);
  useEffect(() => {
    async function loadCashDrawer() {
      try {
        const cashDrawer = await db.cashDrawer.toArray();
        let todayCashDrawer = getTodayCashDrawer(cashDrawer);

        if (!todayCashDrawer) {
          setIsInitialAmt(true);
        }
      } catch (err) {
        showToast({ type: 'error', message: err.message });
      }
      getAuthToken();
    }
    loadCashDrawer();
  });
  /**
   * Managing the custom product and simple products
   */
  useEffect(() => {
    let product =
      isValidArray(cartData) &&
      cartData.filter((item) => !item?.custom_product);
    let customProduct =
      isValidArray(cartData) && cartData.filter((item) => item?.custom_product);

    let productData =
      isValidArray(product) &&
      product.map((item) => ({
        qty: item.qty,
        sku: item.sku,
        name: item.name,
        price: item.price,
        discount: item?.discount
          ? getDiscountValue(
            item?.discount_type,
            item?.discount,
            parseFloat(item?.price) * parseFloat(item?.qty)
          )
          : 0,
        discount_type: item.discount_type,
        product_option: item.product_option,
        displayOption: item.displayOption,
        product_type: item?.typeId ? item?.typeId : 'simple',
        selectedProductSku: item?.selectedChildSku
          ? item?.selectedChildSku
          : item?.sku,
        taxAmount: getTax(item?.calculationRule, item?.taxRate, item?.subtotal),
        baseSubtotal: getSubTotalAfterTax(
          item?.calculationRule,
          item?.taxRate,
          item?.subtotal
        ),
      }));

    let customProductData =
      isValidArray(customProduct) &&
      customProduct.map((item) => ({
        qty: item?.qty,
        sku: CUSTOM_PRODUCT_SKU,
        selectedProductSku: CUSTOM_PRODUCT_SKU,
        discount: item?.discount
          ? getDiscountValue(
            item?.discount_type,
            item?.discount,
            parseFloat(item?.price) * parseFloat(item?.qty)
          )
          : 0,
        discount_type: item?.discount_type,
        product_type: CUSTOM_PRODUCT_SKU,
        pos_custom_option: {
          name: item?.name,
          price: item?.price,
          quantity: item?.qty,
          description: item?.note,
        },
        taxAmount: 0,
        baseSubtotal: item?.subtotal,
      }));

    let products =
      isValidArray(productData) && isValidArray(customProductData)
        ? productData.concat(customProductData)
        : !isValidArray(productData) && isValidArray(customProductData)
          ? customProductData
          : isValidArray(productData) && !isValidArray(customProductData)
            ? productData
            : [{}];
    setProducts(products);
  }, [cartData]);

  useEffect(() => {
    try {
      if (cartData.length < 1) {
        router.replace('/');
      }
    } catch (e) {
      console.log(e);
    }

    let payAmount = 0;

    if (cashAmount) {
      // there was parseInt instead of parseFloat
      payAmount = payAmount + parseFloat(cashAmount);
      setPayableAmount(payAmount);
    } else {
      setCartStatus(t`Enter Payment Amount !!`);
    }

    if (cardAmount) {
      // there was parseInt instead of parseFloat
      payAmount = payAmount + parseFloat(cardAmount);
      setPayableAmount(payAmount);
    }

    if (
      (payAmount && payAmount > totalPayableAmount) ||
      (payAmount && payAmount === totalPayableAmount)
    ) {
      const returnAmount = payAmount - totalPayableAmount;
      setCreditAmount(returnAmount);
      checkCustomer(selectedCustomer);
    } else {
      setCartStatus(t`Enter Payable amount`);
      setCreditAmount(0);
    }
  }, [
    totalPayableAmount,
    cardAmount,
    cashAmount,
    selectedCustomer,
    cartStatus,
    router,
    cartData,
  ]);

  function checkCustomer(customer) {
    isValidObject(customer) && customer.status
      ? setCartStatus('')
      : setCartStatus(t`Please Add the Customer !!`);
  }

  if (discountType === '%') {
    const discount = (cartPrice * discount) / 100;
  }

  const cartPrice = cartData.reduce(
    (acc, current) => acc + current.subtotal,
    0
  );
  let subTotal = 0;
  let totalPayableAmount = 0;
  let customCartDiscount = 0;
  let couponCodeVal = 0;
  let cartTax = 0;

  const taxableCartItems =
    isValidArray(cartData) &&
    cartData?.filter((item) => item?.isProductTaxable);

  const nonTaxableCartItems =
    isValidArray(cartData) &&
    cartData.filter((item) => !item?.isProductTaxable);

  let cartPriceWithTaxItems = isValidArray(taxableCartItems)
    ? taxableCartItems.reduce(
      (acc, current) =>
        acc +
        (current.subtotal != 'undefined'
          ? getProductSubTotal(
            productCalculationMethod,
            ruleProductTaxClass,
            storeProductTaxClass,
            current?.taxClassId,
            current?.subtotal,
            taxRate
          )
          : 0),
      0
    )
    : 0;

  let cartPriceWithoutTaxItems = isValidArray(nonTaxableCartItems)
    ? nonTaxableCartItems.reduce(
      (acc, current) =>
        acc + (current.subtotal != 'undefined' ? current.subtotal : 0),
      0
    )
    : 0;

  // subTotal is sum of taxableProduct and nonTaxableProducts.

  subTotal =
    parseFloat(cartPriceWithTaxItems) + parseFloat(cartPriceWithoutTaxItems);

  // get the CouponCode  Amount on product Items.

  couponCodeVal = isValidArray(cartData)
    ? cartData.reduce(
      (acc, current) =>
        acc +
        (current.subtotal != 'undefined'
          ? getCartCouponAmt(applied_coupons, current)
          : 0),
      0
    )
    : 0;

  const cartPriceAfterDiscount = isValidArray(cartData)
    ? cartData.reduce(
      (acc, current) =>
        acc +
        (current.subtotal != 'undefined'
          ? getProductItemAmount(
            applied_coupons,
            current,
            current.isProductTaxable
          )
          : 0),
      0
    )
    : 0;

  // Custom Cart Discount is value discount applied after tax and coupon-code.
  customCartDiscount =
    isValidObject(cartProducts) && cartProducts?.discount
      ? getCustomCartDiscount(
        cartProducts?.grandDiscountType,
        cartProducts?.discount,
        subTotal
      )
      : 0;

  // cartTax Amt value

  cartTax = isValidArray(cartData)
    ? cartData.reduce(
      (acc, current) =>
        acc +
        (current.subtotal != 'undefined'
          ? getCartTax(current, applied_coupons, current?.isProductTaxable)
          : 0),
      0
    )
    : 0;

  // Payable Amount after applied coupon code and tax.

  totalPayableAmount = cartPriceAfterDiscount - customCartDiscount;

  const toggleLoadCustomer = () => {
    setIsListPopup(!isListPopup);
    dispatch(customerActions.setCustomerSelectStatus(false));
  };

  const toggleCustomerPopup = () => {
    setIsCustomerPopup(!isCustomerPopup);
  };

  const toggleNotePopup = () => {
    setIsNotePopup(!isNotePopup);
    errors.message = '';
  };

  const handleRemoveNote = () => {
    dispatch(orderActions.updateNote(null));
    setNote();
    showToast({ message: t`Order note removed !!`, type: 'success' });
  };

  const cardSubmit = () => {
    const cardValue = cardRef.current.value || '';
    if (cardValue) dispatch(checkoutActions.updateCard(cardValue));
    else showToast({ message: t`Card number needed!!`, type: 'error' });
  };

  const customerSort = {
    id: selectedCustomer && selectedCustomer.entity_id,
    firstname: selectedCustomer && selectedCustomer.name,
    lastname: selectedCustomer && selectedCustomer.name,
    phone_no: selectedCustomer && selectedCustomer.phone_number,
  };

  const getPaymentInfo = () => {
    const { cardAmount, cashAmount } = checkoutData;
    if (cashAmount && cashAmount > 0 && cardAmount && cardAmount > 0) {
      return {
        mode: 'possplit',
        title: possplit_title,
      };
    }

    if (!cashAmount && cardAmount && cardAmount > 0) {
      return { mode: 'poscredit', title: credit_title };
    }

    return {
      mode: 'poscash',
      title: cash_title,
    };
  };

  const paymentInfo = getPaymentInfo();

  const handleOnlinePay = () => {
    if (
      (cardAmount > 0 && cardRef.current?.value) ||
      cardAmount <= 0 ||
      cardRef.current?.value == null
    ) {
      if (customerSort?.phone_no !== null) {
        const orderData = {
          date: getFormattedDate(new Date()),
          items: products ? products : {},
          message: isValidString(note) ? note : '',
          billing_address: {
            use_for_shipping: true,
            same_as_shipping: true,
          },
          customer: customerSort,
          cashier_name: cashierData?.cashier?.firstname
            .concat(' ')
            .concat(cashierData?.cashier?.lastname),
          pos_order_id: cartProducts.quoteId,
          payment_code: paymentInfo.mode,
          payment_label: paymentInfo.title,
          cash_received: cashAmount ? cashAmount : 0,
          base_cash_received: cashAmount ? cashAmount : 0,
          cash_returned: creditAmount ? creditAmount : 0,
          base_cash_returned: creditAmount ? creditAmount : 0,
          cashdrawer_id: '1',
          synchronized: 1,
          is_new_customer: 0,
          currency_code: getCurrencyCode(),
          is_split_payment: '0',
          coupon_info: cartProducts.applied_coupons
            ? [cartProducts.applied_coupons]
            : {},
          payment_info_data: JSON.stringify({
            ...checkoutData,
            cardNumber: cardRef?.current?.value || '',
          }),
          discount: couponCodeVal,
          grand_total: totalPayableAmount,
          grandtotal_discount: customCartDiscount,
          state: 'Complete',
          status: 'Complete',
          base_sub_total: subTotal,
          sub_total: subTotal,
          tax: cartTax,
          base_tax: cartTax,
          increment_id: null,
        };

        setLoader(true);
        if (orderData) {
          placeOrder({
            variables: {
              input: orderData,
            },
          })
            .then((res) => {
              const orderData =
                res?.data?.posPlaceOrder || {};
              if (res && orderData?.message) {
                const orderData = res?.data?.posPlaceOrder.place_order_data
                dispatch(orderActions.setOrder(orderData));
                const orderItemData = setOrderInvoice(orderData);
                afterOrderPlace(orderData?.items)
                orderItemData &&
                  dispatch(orderItemActions.setOrderItem(orderItemData));
                /**
                 * Updating the reports table of indexedDB.
                 */
                updateReports(orderData);

                /**
                 * Updating the cashDrawer table of indexedDB.
                 */
                const transactionData = setTransactionData(
                  orderData,
                  totalPayableAmount,
                  date
                );
                setLoader(false);
                transactionData && updateCashDrawer(transactionData);
                transactionData && syncedCashDrawer(transactionData);
                dispatch(orderActions.clearOrder(null));
              }
              // toaster manage the case when cashier send invalid value.
            })
            .catch((err) => {
              console.error(err);
              setLoader(false);
              showToast({ type: 'error', message: t`Order is not placed !!` });
            });
        }
      } else {
        setEditCustomerPopup(!editCustomerPopup);
      }
    } else {
      showToast({ message: t`Card number needed!!`, type: 'error' });
    }
  };

  const handleOfflinePay = async () => {
    if (
      (cardAmount > 0 && cardRef.current?.value) ||
      cardAmount <= 0 ||
      cardRef.current?.value == null
    ) {
      const orderData = {
        date: getFormattedDate(new Date()),
        items: products ? products : {},
        message: note,
        billing_address: {
          use_for_shipping: true,
          same_as_shipping: true,
        },
        customer: customerSort,
        cashier_name: cashierData?.cashier?.firstname
          .concat(' ')
          .concat(cashierData?.cashier?.lastname),
        pos_order_id: cartProducts.quoteId,
        payment_code: paymentInfo.mode,
        payment_label: paymentInfo.title,
        order_id: cartProducts?.quoteId,
        increment_id: cartProducts?.quoteId,
        cash_received: cashAmount ? cashAmount : 0,
        base_cash_received: cashAmount ? cashAmount : 0,
        cash_returned: creditAmount ? creditAmount : 0,
        base_cash_returned: creditAmount ? creditAmount : 0,
        cashdrawer_id: '1',
        synchronized: 0,
        is_new_customer: 0,
        currency_code: getCurrencyCode(),
        outlet_id: cashierData?.cashier?.outlet_id,
        is_split_payment: '0',
        coupon_info: cartProducts.applied_coupons
          ? [cartProducts.applied_coupons]
          : {},
        payment_info_data: JSON.stringify({
          ...checkoutData,
          cardNumber: cardRef?.current?.value || '',
        }),
        discount: couponCodeVal,
        grand_total: totalPayableAmount,
        grandtotal_discount: customCartDiscount,
        base_sub_total: subTotal,
        sub_total: subTotal,
        tax: cartTax,
        base_tax: cartTax,
        state: 'Complete',
        status: 'Complete',
      };

      setLoader(true);
      if (isValidObject(orderData)) {
        dispatch(orderActions.setOrder(orderData));
        const orderItemData = setOrderInvoice(orderData);

        orderItemData && dispatch(orderItemActions.setOrderItem(orderItemData));
        showToast({
          type: 'success',
          message: t`Order is Successfully Placed`,
        });

        /**
         * Updating the reports table of indexedDB.
         */

        updateReports(orderData);

        /**
         * Updating the cashDrawer table of indexedDB.
         */

        const transactionData = setTransactionData(
          orderData,
          totalPayableAmount,
          date
        );
        setLoader(false);
        transactionData && updateCashDrawer(transactionData);
        dispatch(orderActions.clearOrder(null));
      }

      setLoader(false);
    } else {
      showToast({ message: t`Card number needed!!`, type: 'error' });
    }
  };

  async function updateCashDrawer(transactionData) {
    let oldTransactions = [];
    const cashDrawerList = await db.cashDrawer.toArray();

    const todayCashDrawer = getTodayCashDrawer(cashDrawerList);
    const recentCashDrawerIndex =
      isValidArray(cashDrawerList) &&
      cashDrawerList.findIndex((item) => todayCashDrawer?.id == item?.id);

    if (todayCashDrawer) {
      oldTransactions = cashDrawerList[recentCashDrawerIndex].transactions;
      oldTransactions.push(transactionData);

      db.cashDrawer
        .update(cashDrawerList?.[recentCashDrawerIndex]?.id, {
          transactions: oldTransactions,
        })
        .then(function (updated) {
          if (updated) {
            setIsSuccess(!isSuccess);
          } else {
            console.error(t`Product Order is not successfully placed !!`);
          }
        });
    }
  }

  const syncedCashDrawer = async (transactionData) => {
    const cashDrawerList = await db.cashDrawer.toArray();
    const todayCashDrawer = getTodayCashDrawer(cashDrawerList);
    const recentCashDrawerIndex =
      isValidArray(cashDrawerList) &&
      cashDrawerList.findIndex((item) => todayCashDrawer?.id == item?.id);
    let transactions = [];

    if (cashDrawerList) {
      transactions = cashDrawerList[recentCashDrawerIndex]?.transactions;

      transactions.push(transactionData);

      let cashDrawer = {
        date: getFormattedDate(new Date(), false, 'YYYY-DD-MM'),
        transactions: isValidArray(transactions) ? transactions : [],
        initial_amount: todayCashDrawer?.initial_amount,
        base_initial_amount: todayCashDrawer?.base_initial_amount,
        remaining_amount: todayCashDrawer?.remaining_amount,
        base_remaining_amount: todayCashDrawer?.base_remaining_amount,
        currency_code: todayCashDrawer?.currency_code,
        is_synced: 1,
        closed_at: false,
        note: note,
        status: false,
      };

      try {
        saveCashDrawer({
          variables: { input: cashDrawer },
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateReports = async (orderData) => {
    const reports = await db.reports.toArray();

    if (isValidObject(reports[0])) {
      let weekReport = reports[0]?.posReport?.week;
      let monthReport = reports[0]?.posReport?.month;
      let dayReport = reports[0]?.posReport?.day;

      if (isValidObject(dayReport)) {
        let time = getCurrentTimeIndex();
        const report = getDayReport(dayReport, orderData, time);
        dayReport = report;
      }

      if (isValidObject(weekReport) && isValidObject(monthReport)) {
        const isTodayDateAvailable = weekReport?.orderData?.find((item) => {
          if (
            getFormattedDate(new Date(item?.label), false, 'YYYY-DD-MM') ==
            orderData?.date
          ) {
            return true;
          }
        });

        if (isTodayDateAvailable) {
          const reportOfWeek = getWeekReport(weekReport, orderData);
          const reportOfMonth = getMonthReport(monthReport, orderData);
          weekReport = reportOfWeek;
          monthReport = reportOfMonth;
        } else {
          const reportOfWeekOnNewDay = getWeekReportOfNewDay(
            weekReport,
            orderData
          );
          const reportOfMonthOnNewDay = getMonthReportOfNewDay(
            monthReport,
            orderData,
            reportOfWeekOnNewDay
          );
          weekReport = reportOfWeekOnNewDay;
          monthReport = reportOfMonthOnNewDay;
        }
      }

      reports[0].day = dayReport;
      reports[0].week = weekReport;
      reports[0].month = monthReport;

      db.reports
        .update(1, {
          posReport: reports[0]?.posReport,
        })
        .then(() => { })
        .catch(() => console.error(t`Unable to update reports table !!`));
    }
  };

  const handleError = (data) => {
    if (data) {
      showToast({
        type: 'error',
        message: JSON.parse(JSON.stringify(data)).message,
      });
    }
  };

  const isCheckOutAcceptable = React.useMemo(() => {
    return `${Boolean(
      !(isValidObject(selectedCustomer) &&
        selectedCustomer.status &&
        Boolean(parseFloat(cashAmount || cardAmount)) &&
        payableAmount >= totalPayableAmount
        ? true
        : false)
    )}`;
  }, [
    selectedCustomer,
    cardAmount,
    cashAmount,
    payableAmount,
    totalPayableAmount,
  ]);

  return (
    <div className={styles.pay}>
      <div className={styles.pay_orderbox}>
        <div className={styles.pay__head}>
          <Link href="/">
            <Trans>Back</Trans>
          </Link>
        </div>
        <div className={styles.pay__calctotal}>
          <div className={styles.orderhead}>
            <h3>
              <Trans>Order ID</Trans> <span>#{cartProducts.quoteId}</span>
            </h3>
          </div>
          <div className={styles.orderbody}>
            <div className={styles.order_cartproduct}>
              <ul>
                {cartData ? (
                  cartData.map((item, index) => (
                    <OrderItem item={item} key={index} />
                  ))
                ) : (
                  <Trans>No product into cart</Trans>
                )}
              </ul>
            </div>

            <div className={styles.cart_pricing_section}>
              <div className={styles.carttotal}>
                <hr />
                <table className="mb-10">
                  <tbody>
                    <tr>
                      <td>
                        <Trans>Subtotal</Trans>
                      </td>
                      <td className={styles.drop_down}>
                        <span className="break-point">
                          {getFormattedPrice(subTotal)}
                        </span>
                        <span className="break-pint-abs">
                          <span
                            onClick={() =>
                              setShowOptions((showOptions) => !showOptions)
                            }
                            className={
                              showOptions
                                ? 'icon icon-right-angle down transition'
                                : 'icon icon-right-angle transition'
                            }
                          ></span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  {showOptions ? (
                    <tbody>
                      <tr>
                        <td>
                          <Trans>Tax</Trans>

                          {isValidObject(cartProducts) &&
                            cartTax > 0 &&
                            isValidArray(cartData) &&
                            cartProducts?.calculationRule !== 0 &&
                            ` (+${cartProducts?.taxRate}%)`}
                        </td>
                        <td>
                          {cartTax > 0
                            ? getFormattedPrice(cartTax)
                            : getFormattedPrice(0)}
                        </td>
                      </tr>

                      {discount > 0 && (
                        <tr className={styles.payamount}>
                          <td>
                            <Trans>Discount</Trans>
                            {cartProducts.grandDiscountType === '%'
                              ? ` (-${cartProducts.discount}%)`
                              : ` (-${currecy}${cartProducts.discount})`}
                          </td>
                          <td className={styles.discountAmount_price}>
                            <span className={styles.price}>
                              -{getFormattedPrice(customCartDiscount)}
                            </span>
                            <span
                              className="icon icon-xcircle carticon crossIcon"
                              onClick={() =>
                                dispatch(
                                  cartActions.applyDiscount({
                                    discount: null,
                                    type: null,
                                  })
                                )
                              }
                            ></span>
                          </td>
                        </tr>
                      )}
                      {applied_coupons && (
                        <tr className={styles.couponStatus}>
                          <td className={styles.coupon}>
                            <Trans>Coupon</Trans> ({applied_coupons.coupon_code}
                            ) : (
                            {applied_coupons.simple_action === 'by_fixed'
                              ? `-$${applied_coupons.discount_amount}`
                              : `-${applied_coupons.discount_amount}%`}
                            )
                          </td>
                          <td className={styles.discountAmount_price}>
                            <span className={styles.price}>
                              -{getFormattedPrice(couponCodeVal)}
                            </span>
                            <span
                              className="icon icon-xcircle carticon crossIcon"
                              onClick={() =>
                                dispatch(cartActions.clearCoupon(null))
                              }
                            ></span>
                          </td>
                        </tr>
                      )}

                      {note && (
                        <tr className={styles.note}>
                          <td>
                            <Trans>Order Message</Trans>
                          </td>
                          <td className={styles.note_amount}>
                            <span className={styles.note_text}>
                              {getFormattedText(note, 12)}
                            </span>
                            <span
                              className="icon icon-xcircle removeIcon"
                              onClick={handleRemoveNote}
                            >ss</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  ) : (
                    ''
                  )}

                  <tbody>
                    <tr className={styles.payamount}>
                      <td>
                        <Trans>Pay in cash</Trans>
                      </td>
                      <td className={styles.cash}>
                        <span className={styles.cash_value}>
                          {cashAmount > 0
                            ? getFormattedPrice(cashAmount)
                            : getFormattedPrice(0)}
                        </span>

                        {cashAmount > 0 ? (
                          <span
                            className="icon icon-xcircle removeIcon"
                            onClick={() =>
                              dispatch(checkoutActions.remove('cash'))
                            }
                          ></span>
                        ) : (
                          ''
                        )}
                      </td>
                    </tr>

                    <tr className={styles.payamount}>
                      <td>
                        <Trans>Pay in card</Trans>

                        {cardAmount > 0 &&
                          checkoutData.cardAmount &&
                          !checkoutData.card ? (
                          <form id="cardNumber">
                            <Input
                              type="text"
                              name={'cardNumber'}
                              placeholder={'xxxx-xxxx-xxxx-xxxx'}
                              className={styles.cardInput}
                              autoFocus={true}
                              ref={cardRef}
                            />
                            <span
                              className="icon-green-check cardicon"
                              onClick={cardSubmit}
                            ></span>
                          </form>
                        ) : (
                          ''
                        )}
                      </td>

                      <td className={styles.cash}>
                        <span className={styles.cash_value}>
                          {cardAmount > 0
                            ? getFormattedPrice(cardAmount)
                            : getFormattedPrice(0)}
                        </span>
                        {cardAmount > 0 ? (
                          <span
                            className="icon icon-xcircle removeIcon"
                            onClick={() =>
                              dispatch(checkoutActions.remove('card'))
                            }
                          ></span>
                        ) : (
                          ''
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className={styles.grand_total}>
                        <Trans>Grand Total</Trans>
                      </td>
                      <td className={styles.grand_total}>
                        {getFormattedPrice(totalPayableAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={styles.discountWrapper}>
                <table className="mb-10">
                  <tbody>
                    <tr>
                      <td>
                        <Trans>Credit</Trans>
                      </td>
                      <td>{getFormattedPrice(creditAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={styles.actions}>
                <Button
                  title={t`Add Order Note`}
                  buttonType={'primary'}
                  type="button"
                  btnClass={styles.confirmpayment}
                  clickHandler={toggleNotePopup}
                />
                <span
                  data-tip={`Enter payable amount`}
                  data-place="top"
                  data-type="dark"
                >
                  <Button
                    title={t`Confirm Payment`}
                    buttonType={'success'}
                    type="button"
                    btnClass={`${styles.confirmpayment} ${styles.submitBtn}`}
                    clickHandler={() =>
                      handleFunCallOnPosMode(handleOnlinePay, handleOfflinePay)
                    }
                    disabled={isCheckOutAcceptable}
                  />
                </span>
                <span className={styles.message}>
                  {/* {cartStatus && cartStatus} */}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.customerpayment}>
        <div className={styles.calculatepay}>
          <div className={styles.customer}>
            <div className={styles.payamount}>
              <h4>
                <Trans>Payable Amount</Trans>
              </h4>
              <h3>{getFormattedPrice(totalPayableAmount)}</h3>
            </div>

            <div
              className={`${styles.searchbox} ${isValidObject(selectedCustomer) && selectedCustomer.status
                ? styles.active
                : styles.inactive
                }`}
            >
              {isValidObject(selectedCustomer) && selectedCustomer.status ? (
                <div className={styles.selected_customer}>
                  <div
                    className={styles.selected_customer_section}
                    onClick={toggleLoadCustomer}
                  >
                    <div className={styles.avatar}>
                      <div className=" p-5 avatar icon-customer-profile "></div>
                    </div>
                    <div className={styles.metainfo}>
                      <h5 className={styles.customer_name}>
                        {selectedCustomer.name}
                        {selectedCustomer.billing_lastname}
                      </h5>
                      <p>{selectedCustomer.email}</p>
                    </div>
                  </div>
                  {offlineMode && (
                    <div
                      className={styles.add__customer}
                      onClick={toggleCustomerPopup}
                    >
                      <i className="icon icon-user-plus"></i>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {offlineMode ? (
                    <div
                      className={styles.avatar}
                      onClick={toggleCustomerPopup}
                    >
                      <span
                        className="icon icon-user-plus"
                        data-tip="Add Customer"
                        data-place="bottom"
                        data-type="light"
                      ></span>
                    </div>
                  ) : (
                    <div className={styles.avatar_disable}>
                      <span
                        className="icon icon-user-plus"
                        data-tip="Add Customer"
                        data-place="bottom"
                        data-type="light"
                      ></span>
                    </div>
                  )}
                  <div
                    className={styles.addcustomer}
                    onClick={toggleLoadCustomer}
                  >
                    <span
                      className="icon icon-listItem"
                      data-tip="All Customer"
                      data-place="bottom"
                      data-type="light"
                    ></span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className={styles.payment_type}>
            <div className={styles.tabcontent_container}>
              <div className={styles.keypad_handle}>
                <div className={styles.split_button}>
                  <Tabs>
                    {TABS.map((tab) => (
                      <TabList
                        key={tab.id}
                        id={tab.id}
                        tabName="outlet_tab_list"
                        defaultActiveTab={activeTab}
                        switchHandler={() => {
                          setActiveTab(tab.id);
                        }}
                        title={tab.title}
                      />
                    ))}
                  </Tabs>
                </div>
                <TabContent>
                  <OtherPay
                    activeTab={activeTab}
                    totalPayAmt={totalPayableAmount}
                  />
                </TabContent>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCustomerPopup && (
        <div className={styles.add_customer_section}>
          <AddCustomer
            CustomerPopup={isCustomerPopup}
            change={(isCheck) => setIsCustomerPopup(!isCheck)}
          />
        </div>
      )}

      {loader && (
        <Popup box="category">
          <div className={styles.loader}>
            <h1>
              <Trans>Placing Order !!</Trans>
            </h1>
            <Image
              alt="loadericon"
              src="/assets/icons/square-loader-color.gif"
              width="100"
              height="50"
              priority={true}
            />
          </div>
        </Popup>
      )}

      {isListPopup && (
        <ListPopup
          isList={isListPopup}
          change={(isCheck) => setIsListPopup(!isCheck)}
        />
      )}
      {isSuccess && <OrderSuccess props={isSuccess} />}
      {isNotePopup && (
        <OrderNote
          isNote={isNotePopup}
          change={(isCheck) => {
            setIsNotePopup(!isCheck);
          }}
        />
      )}
      {isInitialAmt && (
        <InitialAmountPopup
          initialPopup={isInitialAmt}
          change={setIsInitialAmt}
        />
      )}
      {editCustomerPopup && (
        <EditCustomer
          CustomerPopup={editCustomerPopup}
          change={(isCheck) => setEditCustomerPopup(!isCheck)}
        />
      )}
      <ReactTooltip />
    </div>
  );
};

export default Pay;
/**
 * Generate at build time.
 *
 * @returns {JSON} props
 */
export async function getStaticProps() {
  return {
    props: {
      twoColumnLayout: true,
    },
  };
}

