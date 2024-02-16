import React, { useState } from 'react';
import styles from '~/styles/Checkout/Checkout.module.scss';
import { NumPad } from '@webkul/pos-ui';
import { checkoutActions } from '~/store/checkout';
import { useDispatch } from 'react-redux';
import { showToast, isValidAmount, decimalCounter } from '~/utils/Helper';
import { t } from '@lingui/macro';
export const OtherPay = ({ activeTab, totalPayAmt }) => {
  const dispatch = useDispatch();
  const [isKey, setKey] = useState(false);
  const [calAmount, setCalAmount] = useState('');
  const [cardAmount, setCardCalAmount] = useState('');
  /**
   * handle number click
   * @param {e} event
   */
  const handleNumberClick = (e, isClear = false) => {
    let patterns = /^[0-9]+$/;
    try {
      if (activeTab === 1) {
        if (
          (calAmount.indexOf('.') == '-1' || calAmount.indexOf('.') > '-1') &&
          (calAmount.indexOf('.') == '-1' ||
            e.currentTarget.innerText.trim() != '.')
        ) {
          const value = e?.currentTarget?.value;
          // checking the validity of entered amount
          let amount = isClear
            ? `${value}`
            : `${calAmount}`.concat(value).trim();
          if (isClear) {
            setCalAmount(amount);
            submitHandler();
          } else {
            if (!isValidAmount(amount.charAt(0))) {
              showToast({ type: 'warning', message: t`Enter payable amount` });
            } else {
              if (calAmount === 0) {
                setCalAmount(value.trim());
              } else {
                if (patterns.test(value.trim())) {
                  if (parseFloat(calAmount) === parseFloat(totalPayAmt)) {
                    handleClear();
                  }
                }
                if (
                  !(calAmount.length > 10) &&
                  !(decimalCounter(calAmount) > 1)
                ) {
                  setCalAmount(calAmount + value.trim());
                }
              }
            }
          }
        }
      } else {
        if (
          (cardAmount.indexOf('.') == '-1' || cardAmount.indexOf('.') > '-1') &&
          (cardAmount.indexOf('.') == '-1' ||
            e.currentTarget.innerText.trim() != '.')
        ) {
          const value = e?.currentTarget?.value;
          // checking the validity of entered amount
          let amount = isClear
            ? `${value}`
            : `${cardAmount}`.concat(value).trim();
          if (isClear) {
            setCardCalAmount(amount);
          } else {
            if (!isValidAmount(amount.charAt(0))) {
              showToast({ type: 'warning', message: t`Enter payable amount` });
            } else {
              if (cardAmount === 0) {
                setCardCalAmount(value.trim());
              } else {
                if (patterns.test(value.trim())) {
                  if (cardAmount == totalPayAmt) {
                    handleClear();
                  }
                }
                if (
                  !(cardAmount.length > 10) &&
                  !(decimalCounter(cardAmount) > 1)
                ) {
                  setCardCalAmount(cardAmount + value.trim());
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * Clear calAmount data
   */

  const handleClear = React.useCallback(() => {
    if (activeTab === 1) {
      setCalAmount('');
    } else {
      setCardCalAmount('');
    }
  }, [activeTab]);
  /**
   * handle back button for removing single number from back
   */
  const handleBack = () => {
    if (activeTab === 1) {
      calAmount > 0
        ? setCalAmount(calAmount.slice(0, -1))
        : showToast({
          message: t`Value Empty!!`,
          type: 'error',
        });
    } else {
      cardAmount > 0
        ? setCardCalAmount(calAmount.slice(0, -1))
        : showToast({
          message: t`Value Empty!!`,
          type: 'error',
        });
    }
  };

  /**
   * submit handler to dispatch reducers and set Cart/Cash data
   */

  const submitHandler = React.useCallback(() => {
    if (
      activeTab === 1 &&
      calAmount === 0 &&
      activeTab === 2 &&
      cardAmount === 0
    ) {
      showToast({ message: t`Value Empty!!`, type: 'error' });
    } else {
      activeTab === 1
        ? dispatch(checkoutActions.setCash(calAmount))
        : dispatch(checkoutActions.setCard(cardAmount));
      // handleClear();
    }
  }, [activeTab, dispatch, calAmount, cardAmount]);

  React.useEffect(() => {
    const isActive = function (e) {
      var cardInput = document.querySelector('#cardNumber');
      const isCardActive = cardInput
        ? Boolean(e.target.parentElement.id === cardInput.id)
        : false;
      var isCantainerAct = document.getElementById('popCantainer');
      if (isCantainerAct || isCardActive) {
        setKey(false);
      } else {
        setKey(true);
      }
    };
    if (typeof window !== 'undefined') {
      document.addEventListener('mouseover', isActive);
    }
    const calcHandler = function (e) {
      let keyEvent_ = e.key;
      let patterns = /^[0-9]+$/;
      if (activeTab === 1) {
        if (patterns.test(keyEvent_)) {
          if (parseFloat(calAmount) === parseFloat(totalPayAmt)) {
            handleClear();
          }
          if (calAmount === '' && keyEvent_ === '0') {
            showToast({
              message: t`Invalid input `,
              type: 'warning',
            });
          } else {
            if (!(calAmount.length > 10) && !(decimalCounter(calAmount) > 1)) {
              setCalAmount(calAmount + keyEvent_);
            }
          }
        }
        if (keyEvent_ === 'Backspace') {
          if (calAmount !== '') {
            setCalAmount(calAmount.slice(0, -1));
          }
        }
        if (keyEvent_ === '.') {
          if (!calAmount.includes('.')) {
            setCalAmount(calAmount + keyEvent_);
          }
        }
        if (keyEvent_ === 'Enter') {
          submitHandler();
        }
        if (keyEvent_ === 'Delete') {
          handleClear();
        }
      } else {
        if (patterns.test(keyEvent_)) {
          if (parseFloat(cardAmount) == parseFloat(totalPayAmt)) {
            handleClear();
          }
          if (cardAmount === '' && keyEvent_ === '0') {
            showToast({
              message: t`Invalid input `,
              type: 'warning',
            });
          } else {
            if (
              !(cardAmount.length > 10) &&
              !(decimalCounter(cardAmount) > 1)
            ) {
              setCardCalAmount(cardAmount + keyEvent_);
            }
          }
        }
        if (keyEvent_ === 'Backspace') {
          if (cardAmount !== '') {
            setCardCalAmount(cardAmount.slice(0, -1));
          }
        }
        if (keyEvent_ === '.') {
          if (!cardAmount.includes('.')) {
            setCardCalAmount(cardAmount + keyEvent_);
          }
        }
        if (keyEvent_ === 'Enter') {
          submitHandler();
        }
        if (keyEvent_ === 'Delete') {
          handleClear();
        }
      }
      e.preventDefault();
    };

    if (isKey) {
      if (window) {
        try {
          window.addEventListener('keydown', calcHandler);
        } catch (err) {
          console.error(err);
        }
      }
    }
    return () => {
      window.removeEventListener('keydown', calcHandler);
      document.removeEventListener('mouseover', isActive);
    };
  }, [
    calAmount,
    handleClear,
    activeTab,
    totalPayAmt,
    cardAmount,
    submitHandler,
    isKey,
  ]);

  React.useEffect(() => {
    if (activeTab === 1) {
      if (calAmount == totalPayAmt) {
        submitHandler();
      }
    } else {
      if (cardAmount == totalPayAmt) {
        submitHandler();
      }
    }
  }, [calAmount, activeTab, cardAmount, submitHandler, totalPayAmt]);
  return (
    <React.Fragment>
      <div className={styles.dialPaid}>
        <div className={styles.dialInput}>
          {activeTab === 1
            ? calAmount
              ? calAmount
              : 0
            : cardAmount
              ? cardAmount
              : 0}
        </div>
        <NumPad
          btnEvent={handleNumberClick}
          back={handleBack}
          clear={handleClear}
          submit={submitHandler}
          totalPayAmt={totalPayAmt}
          totalPayAmtDisabled={calAmount == totalPayAmt}
        />
      </div>
    </React.Fragment>
  );
};
