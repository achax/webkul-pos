import React, { useState, useEffect } from 'react';
import styles from '~/styles/Checkout/Checkout.module.scss';
import { Popup, Button } from '@webkul/pos-ui';
import { useDispatch, useSelector } from 'react-redux';
import { operationsActions } from '~/store/operations';
import { t } from '@lingui/macro';

export const ConfirmBox = ({
  isConfirmPopup = '',
  title,
  message,
  change,
  onSuccess = '',
  close = true,
}) => {
  const dispatch = useDispatch();
  const [isClose, setIsClose] = useState(isConfirmPopup);
  const [isProceed, setIsProceed] = useState(false);
  const confirm = useSelector((state) => state.operations?.operations);
  useEffect(() => {
    if (confirm && confirm?.confirmStatus) {
      handleCancel();
    }
  }, [confirm, handleCancel]);

  useEffect(() => {
    onSuccess(isProceed);
  }, [isProceed, onSuccess]);

  /**
   * manage skip popup and clear all the cart and checkout states
   * @param {data}
   */

  const handleCancel = React.useCallback(() => {
    setIsClose(!isClose);
    // confirm?.confirmStatus && dispatch(operationsActions.setConfirmStatus({ status: false }));
    change(isClose);
  }, [change, isClose]);

  /**
   * manage print invoice
   */
  const handleProceed = () => {
    setIsProceed(!isProceed);
    dispatch(operationsActions.setConfirmStatus({ status: false }));
  };

  return (
    <>
      {isClose && (
        <Popup close={close ? handleCancel : close}>
          <form className={styles.popup_form}>
            <div className={styles.holdcart_form}>
              <label>{title}</label>
              <hr />
              <div className={styles.holdcart}>
                <h3 className="message">{message}</h3>
              </div>
              <div className="popup_action">
                <Button
                  title={t`Cancel`}
                  btnClass="button-cancel"
                  clickHandler={handleCancel}
                />
                <Button
                  title={t`Proceed`}
                  btnClass="button-proceed"
                  clickHandler={handleProceed}
                />
              </div>
            </div>
          </form>
        </Popup>
      )}
    </>
  );
};
