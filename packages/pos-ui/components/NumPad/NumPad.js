import React from 'react';
import { Button } from '@webkul/pos-ui';
import styles from '~/styles/Checkout/Checkout.module.scss';
import { getFormattedPrice } from '~/utils/Helper';
import { t } from '@lingui/macro';
export const NumPad = (props) => {
  return (
    <>
    <div className={styles.cash_keypad}>
        <div className={styles.numeric_button_container}>
          <div className={styles.keypad_button_row}>
            <Button
              title="1"
              value="1"
              btnClass={styles.numericbutton}
              className={'btn'}
              clickHandler={props.btnEvent}
            />
            <Button
              title="2"
              value="2"
              btnClass={styles.numericbutton}
              clickHandler={props.btnEvent}
            />
            <Button
              title="3"
              value="3"
              btnClass={styles.numericbutton}
              clickHandler={props.btnEvent}
            />
          </div>
          <div className={styles.keypad_button_row}>
            <Button
              title="4"
              value="4"
              btnClass={styles.numericbutton}
              clickHandler={props.btnEvent}
            />
            <Button
              title="5"
              value="5"
              btnClass={styles.numericbutton}
              clickHandler={props.btnEvent}
            />
            <Button
              title="6"
              value="6"
              btnClass={styles.numericbutton}
              clickHandler={props.btnEvent}
            />
          </div>
          <div className={styles.keypad_button_row}>
            <Button
              title="7"
              value="7"
              btnClass={styles.numericbutton}
              clickHandler={props.btnEvent}
            />
            <Button
              title="8"
              value="8"
              btnClass={styles.numericbutton}
              clickHandler={props.btnEvent}
            />
            <Button
              title="9"
              value="9"
              btnClass={styles.numericbutton}
              clickHandler={props.btnEvent}
            />
          </div>
          <div className={styles.keypad_button_row}>
            <Button
              title="0"
              value="0"
              btnClass={styles.numericbutton}
              clickHandler={props.btnEvent}
            />
            <Button
              title="."
              value="."
              btnClass={styles.numericbutton}
              clickHandler={props.btnEvent}
            />
            <Button
              title="X"
              iconPath="/assets/icons/cancel.png"
              iconWidth="36"
              iconHeight="36"
              btnClass={styles.numericbutton}
              clickHandler={props.back}
            />
          </div>
          <div className={styles.keypad_button_row}>
            <Button
              title={t`Clear`}
              btnClass={styles.numericbutton}
              clickHandler={props.clear}
            />
            <Button
              title={getFormattedPrice(props.totalPayAmt)}
              value={props.totalPayAmt}
              btnClass={`${styles.numericbutton} ${styles.payBtn}`}
              disabled={props.totalPayAmtDisabled ? 'true' : 'false'}
              clickHandler={(e) => props.btnEvent(e, true)}
            />

            <Button
              title={t`Add`}
              btnClass={`${styles.numericbutton} ${styles.submitBtn}`}
              type="submit"
              clickHandler={props.submit}
            />
          </div>
        </div>
      </div>
    </>
  );
};
