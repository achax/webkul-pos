import { Button, Popup } from '@webkul/pos-ui';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import styles from './OrderDetails.module.scss';
import OrderItem from './OrderItem';
import CreateMemo from './CreateMemo';
import CREATE_MEMO from '~/API/mutation/CreateCreditMemo.graphql';
import {
  getFormattedPrice,
  isValidString,
  isValidObject,
  isValidArray,
  showToast,
  getCurrencySymbol,
} from '~/utils/Helper';
import { Invoices } from '@webkul/pos-invoice';
import ReactToPrint from 'react-to-print';
import { orderItemActions } from '~/store/orderItem';
import { useDispatch } from 'react-redux';
import CustomOrderItem from './CustomOrderItem';
import { FormProvider, useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { useAccessToken } from '~hooks/access-token';
import Image from 'next/image';
import { db } from '~/models';
import { useOfflineMode /* usePosSync */ } from '~/hooks';
import CreditMemoList from './CreateMemo/List';
import { Trans, t } from '@lingui/macro';
/**
 * Order Details
 * @param {orderItem, activeTab}
 * @returns OrderDetails
 */
export const OrderDetails = ({ orderItem, closed, isTabMode }) => {
  const [isPrintPopup, setIsPrintPopup] = useState(false);
  const dispatch = useDispatch();
  const currency = getCurrencySymbol(orderItem?.currency_code);
  const { accessToken } = useAccessToken();
  let componentRef = useRef();
  const { increment_id: incrementID = '' } = orderItem || {};
  const [memoList, setMemoList] = useState([]);

  const methods = useForm({ mode: 'onChange' });

  const [placeCreateMemo, { data, loading }] = useMutation(CREATE_MEMO, {
    context: {
      headers: {
        'POS-TOKEN': accessToken,
      },
    },
  });
  const {
    getValues,
    trigger,
    formState: { errors },
  } = methods;

  const handleReturnOrder = (status = false) => {
    setCreateMemo(status);
  };
  React.useEffect(() => {
    try {
      let memoRes = data?.data?.saveCreditMemo || {};
      if (isValidObject(memoRes)) {
        const data_ = memoRes;
        delete data_['status'];
        delete data_['message'];
        if (isValidObject(data_)) {
          (async () => {
            await db.createMemo.add(data_);
          })();
        }
      }
    } catch (err) {
      console.log(err);
    }
  }, [data]);

  useEffect(() => {
    try {
      const saveCreditMemo = data?.saveCreditMemo || {};
      if (isValidObject(saveCreditMemo)) {
        handleReturnOrder(false);
        showToast({
          message:
            saveCreditMemo.message || t`Credit memo created successfully.`,
          type: saveCreditMemo.status ? 'success' : 'error',
        });
        db.creditMemo.put(saveCreditMemo);
      }
    } catch (err) {
      console.error(err);
    }
  }, [data]);

  useEffect(() => {
    try {
      const getMemoList = async () => {
        const creditMemoList = await db.creditMemo
          .where('order_id')
          .equals(incrementID)
          .toArray();
        setMemoList(creditMemoList);
      };

      if (incrementID) getMemoList();
    } catch (err) {
      console.log(err);
    }
  }, [incrementID, data]);

  const isOrderRefundable = useMemo(() => {
    const totalOrderedQty = orderItem?.item
      ?.filter((i) => i.qty)
      ?.reduce((acc, current) => {
        return acc + current?.qty || 0;
      }, 0);
    let refundedQty = 0;
    memoList.forEach((memo) => {
      memo?.item_qtys?.forEach((item) => {
        if (item.type !== 'configurable') {
          refundedQty += item.qty;
        }
      });
    });
    return totalOrderedQty === refundedQty ? false : true;
  }, [memoList, orderItem]);
  const { offlineModeEnable } = useOfflineMode();

  const [createMemo, setCreateMemo] = useState(false);
  useEffect(() => {
    setCreateMemo(false);
  }, [incrementID]);

  // const { syncingPosApp, loading } = usePosSync();
  // const selectedOrder = useSelector((state) => state.orderItem?.orderItemData);

  const handleCreateMemo = () => {
    trigger();
    if (Object.values(errors).length < 1) {
      const { memo = {} } = getValues();
      const itemQtys = [];
      for (let key in memo) {
        if (memo[key].return && key) {
          itemQtys.push({
            item_id: `${key}`,
            qty: memo[key].qty,
            back_to_stock: memo[key].back_to_stock
          });
        }
      }
      if (isValidArray(itemQtys)) {
        placeCreateMemo({
          variables: {
            creditMemoData: {
              order_id: orderItem?.magento_order_id,
              item_qtys: itemQtys,
            },
          },
        });
      } else {
        showToast({
          type: 'error',
          message: t`Please select at least one item.`,
        });
      }
    }
  };

  const orderData =
    orderItem &&
    isValidArray(orderItem.item) &&
    orderItem.item.filter((item) => item?.name);

  const paymentData = orderItem && JSON.parse(orderItem.payment_info_data);

  const customOrderData =
    orderItem &&
    isValidArray(orderItem.item) &&
    orderItem.item.filter((item) => item?.pos_custom_option?.name);

  const handleClose = () => {
    setIsPrintPopup(!isPrintPopup);
    closed && closed(isPrintPopup);
  };

  const handlePrint = () => {
    setIsPrintPopup(!isPrintPopup);
  };

  const handleClosePopUp = () => {
    try {
      dispatch(orderItemActions.clearOrderItem(null));
    } catch (error) {
      console.error(error);
    }
  };

  const couponData = orderItem && orderItem?.coupon_code;
  const currencyCode = orderItem && orderItem?.currency_code;
  const subTotal = orderItem?.subTotal ? orderItem?.subTotal : 0;

  const couponVal = isValidObject(orderItem) && orderItem?.discount;
  const discountVal = isValidObject(orderItem) && orderItem?.grandDiscountAmt;

  const isReturnAvailable = (orderItemId, orderedQty) => {
    if (!isOrderRefundable) return false;
    let refundedQty = 0;
    memoList.forEach((memo) => {
      memo?.item_qtys?.forEach((item) => {
        if (item.item_id === orderItemId) refundedQty += item.qty;
      });
    });
    // console.warn({ refundedQty, orderedQty, orderItemId });
    if (refundedQty < orderedQty) return true;
    return false;
  };

  return (
    <>
      {loading && (
        <Popup box="category">
          <div className={styles.loader}>
            <h1>
              <Trans>Return in Process !!</Trans>
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
      <section className={isTabMode ? styles.section_tab : styles.section}>
        <div className={styles.section__main_container}>
          {orderItem && (
            <div className={styles.section__main_container__container}>
              <div
                className={styles.section__main_container__container__orderid}
              >
                <h4>
                  <div
                    className={
                      orderItem &&
                        isValidString(orderItem?.status) &&
                        offlineModeEnable == 2
                        ? styles.status_circle_warning
                        : orderItem?.status?.toLowerCase() == 'complete'
                          ? styles.status_circle_success
                          : styles.status_circle_fail
                    }
                  >
                    {' '}
                  </div>
                  Order ID #{orderItem && orderItem.increment_id}
                </h4>
                {memoList?.length > 0 && (
                  <CreditMemoList
                    memoList={memoList}
                    orderId={orderItem.increment_id}
                  />
                )}
              </div>
              <div className={styles.section__main_container__container__span}>
                <span>{orderItem && orderItem.date}</span>
                {/* <span
                  className={
                    orderItem &&
                    isValidString(orderItem?.status) &&
                    orderItem?.status.toLowerCase() == 'complete'
                      ? styles.status_success
                      : styles.status_fail
                  }
                >
                  {orderItem && isValidString(orderItem.status) && 'Complete'}
                </span> */}
              </div>
            </div>
          )}

          <ul>
            {!createMemo && isValidArray(orderData)
              ? orderData.map((item) => (
                <OrderItem
                  item={item}
                  key={item?.sku}
                  currencyCode={currencyCode}
                />
              ))
              : ''}

            {createMemo && (
              <FormProvider {...methods}>
                <form>
                  {isValidArray(orderData) &&
                    orderData
                      .filter((item) =>
                        isReturnAvailable(item.orderItemId, item.qty)
                      )
                      ?.map((item) => (
                        <CreateMemo
                          item={item}
                          key={item?.sku}
                          currencyCode={currencyCode}
                        />
                      ))}
                </form>
              </FormProvider>
            )}

            {isValidArray(customOrderData)
              ? customOrderData.map((item, index) => {
                return (
                  <CustomOrderItem
                    item={item}
                    key={index}
                    currencyCode={currencyCode}
                  />
                );
              })
              : ''}
            {!isValidArray(customOrderData) && !isValidArray(orderData) ? (
              <h1 className={styles.msg}>
                <Trans>No Order Selected !!</Trans>
              </h1>
            ) : (
              ''
            )}
          </ul>
        </div>
        {orderItem && <hr />}
        {orderItem && (
          <table>
            <tbody>
              <tr>
                <td>
                  <Trans>Subtotal</Trans>
                </td>
                <td>
                  {orderItem
                    ? getFormattedPrice(subTotal, currencyCode)
                    : getFormattedPrice(0, currencyCode)}
                </td>
              </tr>
              <tr>
                <td>
                  <Trans>Tax</Trans>
                </td>
                <td>
                  {orderItem && orderItem.tax
                    ? `+ ${getFormattedPrice(
                      orderItem.tax,
                      orderItem?.currency_code
                    )}`
                    : getFormattedPrice(0, orderItem?.currency_code)}
                </td>
              </tr>
              <tr>
                <td>
                  <Trans>Discount</Trans>{' '}
                </td>
                <td>
                  {orderItem && orderItem.grandtotal_discount
                    ? `- ${getFormattedPrice(
                      discountVal,
                      orderItem?.currency_code
                    )}`
                    : getFormattedPrice(0, orderItem?.currency_code)}
                </td>
              </tr>
              <tr>
                <td>
                  <Trans> Coupon</Trans>
                  <span className={styles.coupon}>
                    {couponData &&
                      `${couponData?.coupon_code
                        ? `(${couponData?.coupon_code})`
                        : ``
                      } `}

                    {couponData &&
                      couponData?.simple_action &&
                      `: ${couponData?.simple_action === 'by_percent'
                        ? `(-${couponData?.discount_amount}% Off)`
                        : `(-${currency}${couponData?.discount_amount})`
                      }`}
                  </span>
                </td>
                <td>
                  {couponData && couponVal > 0
                    ? `- ${getFormattedPrice(
                      couponVal,
                      orderItem?.currency_code
                    )}`
                    : getFormattedPrice(0, orderItem?.currency_code)}
                </td>
              </tr>
              <tr>
                <td className={styles.grand_total}>Payable Amount</td>
                <td className={styles.grand_total}>
                  {orderItem && orderItem.grand_total
                    ? getFormattedPrice(
                      orderItem.grand_total,
                      orderItem?.currency_code
                    )
                    : getFormattedPrice(0, orderItem?.currency_code)}
                </td>
              </tr>
              {orderItem && paymentData != null ? (
                <tr>
                  <td>
                    <Trans>Cash</Trans>
                  </td>
                  <td>
                    {paymentData.cashAmount
                      ? getFormattedPrice(
                        paymentData.cashAmount,
                        orderItem?.currency_code
                      )
                      : getFormattedPrice(0, orderItem?.currency_code)}
                  </td>
                </tr>
              ) : (
                ''
              )}
              {orderItem && paymentData != null ? (
                <tr>
                  <td>
                    <Trans>Card</Trans>
                  </td>
                  <td>
                    {paymentData.cardAmount
                      ? getFormattedPrice(
                        paymentData.cardAmount,
                        orderItem?.currency_code
                      )
                      : getFormattedPrice(0, orderItem?.currency_code)}
                  </td>
                </tr>
              ) : (
                ''
              )}
              <tr>
                <td>
                  <Trans>Balance</Trans>
                </td>
                <td>
                  {orderItem && orderItem.cash_returned
                    ? getFormattedPrice(parseFloat(orderItem.cash_returned))
                    : getFormattedPrice(0, orderItem?.currency_code)}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {!createMemo && orderItem && (
          <div className={styles.section__cart_action_btn}>
            <div className="grid">
              <Button
                title={t`Print Invoice`}
                buttonType="success"
                iconBefore
                hasIcon
                iconClass="icon-printer m-auto"
                clickHandler={handlePrint}
                disabled={orderItem && orderItem.order_id ? 'false' : 'true'}
              />
            </div>
            <div className="grid">
              {orderItem.synchronized &&
                offlineModeEnable === '1' &&
                isOrderRefundable ? (
                <Button
                  title={t`Order Return`}
                  buttonType="primary"
                  iconBefore
                  hasIcon
                  iconClass="icon-return m-auto"
                  clickHandler={() => {
                    handleReturnOrder(true);
                  }}
                />
              ) : (
                <Button
                  title={t`Close`}
                  buttonType="primary"
                  iconBefore
                  hasIcon
                  iconClass="icon-cancel m-auto"
                  clickHandler={handleClosePopUp}
                />
              )}
            </div>
          </div>
        )}
        {createMemo && orderItem && (
          <div className={styles.section__cart_action_btn}>
            <div className="grid">
              <Button
                title={t`Create`}
                buttonType="success"
                iconBefore
                hasIcon
                iconClass="icon-check m-auto"
                clickHandler={handleCreateMemo}
              />
            </div>
            <div className="grid">
              <Button
                title={t`Close`}
                buttonType="primary"
                iconBefore
                hasIcon
                iconClass="icon-cancel m-auto"
                clickHandler={() => {
                  handleReturnOrder(false);
                }}
              />
            </div>
          </div>
        )}
      </section>

      {isPrintPopup && (
        <Popup box="invoice" close={handleClose}>
          <div className="invoiceactions">
            <ReactToPrint
              trigger={() => <span className="icon icon-printer1"></span>}
              content={() => componentRef.current}
              onAfterPrint={() => setIsPrintPopup(!isPrintPopup)}
            />
            <span
              className="icon icon-x-circle-red"
              onClick={handleClose}
            ></span>
          </div>
          <Invoices ref={componentRef} data={orderItem} />
        </Popup>
      )}
    </>
  );
};
