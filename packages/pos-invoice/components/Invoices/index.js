import React, { useEffect, useState } from 'react';
import styles from '~/styles/Invoice/Invoice.module.scss';
import Image from 'next/image';
import InvoiceDetails from './InvoiceDetails';
import { useDispatch, useSelector } from 'react-redux';
import { getFormattedPrice, isValidObject, isValidArray } from '~/utils/Helper';
import { db } from '~/models';
import { cashierActions } from '~/store/cashier';
import { t } from '@lingui/macro';

export const Invoices = React.forwardRef((props, ref) => {
  const [showDefaultLogo, setShowDefaultLogo] = useState(false);

  const cashier = useSelector((state) => state.cashier?.cashier);
  const storeConfig = useSelector((state) => state.storeConfig?.config);
  const selectedOrder = props.data;
  const orderList = isValidObject(selectedOrder) ? selectedOrder?.item : [];
  const orderPaymentData =
    selectedOrder && JSON.parse(selectedOrder.payment_info_data);
  const dispatch = useDispatch();
  const currency_code =
    isValidObject(props?.data) && props?.data?.currency_code;

  const orders =
    isValidArray(orderList) &&
    orderList.filter((item) => item?.name && !item?.pos_custom_option?.name);

  const filterCustomOrder =
    isValidArray(orderList) &&
    orderList.filter((item) => item?.pos_custom_option?.name);

  const customOrders =
    isValidArray(filterCustomOrder) &&
    filterCustomOrder.map((item) => ({
      name: item?.pos_custom_option?.name,
      quantity: item?.pos_custom_option?.quantity,
      price: item?.pos_custom_option?.price,
      discount: item?.discount,
      discount_type: item?.discount_type,
      baseSubTotal: item?.baseSubtotal,
    }));

  useEffect(() => {
    const getCashierDetails = async () => {
      const cashier = await db.cashier.toArray();
      if (isValidObject(cashier[0])) {
        dispatch(cashierActions.loggedIn(cashier[0]));
      }
    };
    getCashierDetails();
  }, []);

  const invoiceLogo =
    storeConfig && storeConfig.logo && storeConfig.logo !== '/'
      ? `${storeConfig.base_media_url}/pos/logo/${storeConfig.logo}`
      : invoiceDefaultLogo;

  const invoiceDefaultLogo = '/assets/images/logo.png';

  const subTotal =
    isValidObject(selectedOrder) && selectedOrder?.subTotal
      ? selectedOrder?.subTotal
      : 0;

  const couponAmt =
    selectedOrder && selectedOrder?.discount ? selectedOrder?.discount : 0;
  const discountAmt =
    selectedOrder && selectedOrder?.grandDiscountAmt
      ? parseFloat(selectedOrder?.grandDiscountAmt)
      : 0;

  return (
    <div className={styles.invoice} ref={ref}>
      <div className={styles.invoices_container}>
        <div className={styles.wrapper}>
          <div className={styles.head}>
            <label className={styles.title}>Tax Invoice / Bill of supply</label>
            <div className={styles.logo}>
              <Image
                alt="login_user"
                src={!showDefaultLogo ? invoiceLogo : invoiceDefaultLogo}
                onError={() => setShowDefaultLogo(true)}
                width="60"
                height="60"
              />
            </div>
            <label className={styles.address}>{storeConfig.country_id}</label>
          </div>
          <div className={styles.ordertop}>
            <div style={styles.order_id}>
              <label>
                Order -{' '}
                {selectedOrder &&
                  (selectedOrder.increment_id || selectedOrder.order_id)}
              </label>
              <label>Date - {selectedOrder && selectedOrder.date}</label>

              {isValidObject(selectedOrder?.customer) && (
                <label>
                  Customer -{' '}
                  {`${selectedOrder?.customer?.firstname} ${selectedOrder?.customer?.lastname}`}
                </label>
              )}
            </div>
            <div style={styles.orderaddress}>
              {isValidObject(storeConfig) && (
                <>
                  {storeConfig.street_line1 && (
                    <label>{storeConfig.street_line1}</label>
                  )}

                  <label>
                    {storeConfig.street_line2 && storeConfig.street_line2},{' '}
                    {storeConfig.city && storeConfig.city},
                    {storeConfig.country_id && storeConfig.country_id},{' '}
                    {storeConfig.postcode && storeConfig.postcode}
                  </label>
                  <label>
                    {storeConfig.telephone &&
                      ` Tel - 
                  ${storeConfig.telephone}`}
                  </label>
                </>
              )}
            </div>
          </div>
          <div className={styles.orderList}>
            <div className={styles.orderHead}>
              <ul>
                <li>
                  <div className={styles.head}>
                    <div>Product Name</div>
                    <div>Quantity</div>
                    <div>Total Price</div>
                  </div>
                </li>
                {isValidArray(orders) && (
                  <InvoiceDetails items={orders} currencyCode={currency_code} />
                )}

                {isValidArray(customOrders) && (
                  <InvoiceDetails
                    items={customOrders}
                    currencyCode={currency_code}
                  />
                )}
                {!selectedOrder && (
                  <li>
                    <div className={styles.error}>No Offline Orders</div>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className={styles.orderSubtotal}>
            <hr />
            <div className={styles.row}>
              <div className={styles.details}>
                <div className={styles.details_section}>
                  <span className={styles.details_title}>Subtotal :</span>
                  <span className={styles.details_data}>
                    {getFormattedPrice(
                      selectedOrder && parseFloat(subTotal),
                      currency_code
                    )}
                  </span>
                </div>

                <div className={styles.details_section}>
                  <span className={styles.details_title}>Tax :</span>
                  <span className={styles.details_data}>
                    {selectedOrder && selectedOrder.tax
                      ? `+ ${getFormattedPrice(
                          selectedOrder.tax,
                          currency_code
                        )}`
                      : getFormattedPrice(0, currency_code)}
                  </span>
                </div>

                <div className={styles.details_section}>
                  <span className={styles.details_title}>Discount :</span>
                  <span className={styles.details_data}>
                    {selectedOrder && selectedOrder.grandtotal_discount
                      ? `- ${getFormattedPrice(discountAmt, currency_code)}`
                      : getFormattedPrice(0, currency_code)}
                  </span>
                </div>
                <div className={styles.details_section}>
                  <span className={styles.details_title}>
                    {selectedOrder && isValidObject(selectedOrder?.coupon_code)
                      ? `Coupon (${selectedOrder?.coupon_code?.coupon_code}) :`
                      : 'Coupon :'}
                  </span>
                  <span className={styles.details_data}>
                    {couponAmt > 0
                      ? `- ${getFormattedPrice(couponAmt)}`
                      : getFormattedPrice(0)}
                  </span>
                </div>

                <div className={styles.details_section_highlighted}>
                  <span className={styles.details_title}>Grand Amount :</span>
                  <span className={styles.details_data}>
                    {getFormattedPrice(
                      selectedOrder && selectedOrder.grand_total,
                      currency_code
                    )}
                  </span>
                </div>

                <div className={styles.details_section}>
                  <span className={styles.details_title}>CashPay :</span>
                  <span className={styles.details_data}>
                    {orderPaymentData
                      ? getFormattedPrice(
                          orderPaymentData.cashAmount
                            ? orderPaymentData.cashAmount
                            : 0,
                          currency_code
                        )
                      : selectedOrder && selectedOrder.cash_received
                      ? getFormattedPrice(
                          selectedOrder.cash_received,
                          currency_code
                        )
                      : getFormattedPrice(0, currency_code)}
                  </span>
                </div>

                <div className={styles.details_section}>
                  <span className={styles.details_title}>
                    CardPay :
                    {orderPaymentData && orderPaymentData.card
                      ? `(${orderPaymentData?.card})`
                      : ``}
                  </span>
                  <span className={styles.details_data}>
                    {orderPaymentData &&
                    orderPaymentData?.cardAmount &&
                    orderPaymentData?.cardAmount > 0
                      ? getFormattedPrice(
                          orderPaymentData.cardAmount,
                          currency_code
                        )
                      : getFormattedPrice(0, currency_code)}
                  </span>
                </div>

                <div className={styles.details_section}>
                  <span className={styles.details_title}>Balance :</span>
                  <span className={styles.details_data}>
                    {selectedOrder && selectedOrder.cash_returned
                      ? getFormattedPrice(
                          parseFloat(selectedOrder.cash_returned),
                          currency_code
                        )
                      : getFormattedPrice(0, currency_code)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.orderBottom}>
            <hr />
            {isValidObject(cashier) && (
              <>
                <div className={styles.cashierData}>
                  <label>
                    {selectedOrder?.message &&
                      `Note : ${selectedOrder?.message}`}
                  </label>
                  <label>
                    {cashier?.firstname &&
                      cashier?.lastname &&
                      ` Cashier: ${cashier.firstname + ' ' + cashier.lastname}`}
                  </label>
                </div>
                <div className={styles.head}>
                  <label className={styles.address}>India</label>
                  <label>
                    {cashier?.contactno && `Tel no : ${cashier?.contactno}`}
                  </label>
                  <label>
                    {cashier?.email &&
                      `Email : ${
                        cashier.email ? cashier?.email : t`not available`
                      }`}{' '}
                  </label>
                  <hr />
                  <p className={styles.greet}>Have a nice day</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

Invoices.displayName = 'Invoices';
