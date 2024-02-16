import React, { useState } from 'react';
import styles from '~/styles/Checkout/Checkout.module.scss';
import { Popup, Button, Textarea } from '@webkul/pos-ui';
import { Trans, t } from '@lingui/macro';
import { useDispatch } from 'react-redux';
import { showToast, isValidObject } from '~/utils/Helper';
import { orderActions } from '~/store/order';
import { useSelector } from 'react-redux';

export const OrderNote = ({ isNote, change }) => {
  const [orderNotePopup, setOrderNotePopup] = useState(isNote);
  const dispatch = useDispatch();
  const message = useSelector(
    (state) =>
      isValidObject(state?.order?.orderData) && state.order.orderData.message
  );

  const [note, setNote] = useState(message);

  /**
   * manage note submit and dispatch reducers and update Note on Order data
   * @param {data}
   */
  const handleSubmit = () => {
    if (note) {
      dispatch(orderActions.updateNote(note));
      showToast({ message: t`Order Note Added !!`, type: 'success' });
    }
    handleClose();
  };

  /**
   * Popup Close button
   */
  const handleClose = () => {
    setOrderNotePopup(!orderNotePopup);
    change(orderNotePopup);
  };

  const handleChange = (e) => {
    e.target.value && setNote(e.target.value);
  };

  return (
    <>
      {orderNotePopup && (
        <Popup close={handleClose}>
          <form className={styles.popup_form}>
            <div className={styles.newproduct_form}>
              <label className="mb-10">
                <Trans>Add Order Note </Trans>
              </label>
              <div className={styles.customer_name}>
                <h4>
                  <Trans>Enter Message</Trans>
                </h4>
                <Textarea
                  value={note}
                  name="message"
                  rows="4"
                  cols="50"
                  placeholder={t`Enter Note`}
                  className="form-control ordernote"
                  onChange={(e) => handleChange(e)}
                />
              </div>
              <div className="mt-15 ">
                <div className="popup_action ">
                  <Button
                    title={t`Cancel`}
                    btnClass={'button-cancel'}
                    clickHandler={handleClose}
                  />
                  <Button
                    title={t`Add`}
                    btnClass={'button-proceed '}
                    clickHandler={handleSubmit}
                  />
                </div>
              </div>
            </div>
          </form>
        </Popup>
      )}
    </>
  );
};
