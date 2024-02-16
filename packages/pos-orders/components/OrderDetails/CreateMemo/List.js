import React, { useState } from 'react';
import { Popup } from '@webkul/pos-ui';
import { getFormattedPrice } from '~/utils/Helper';
import styles from './CreditMemo.module.scss';
import { Trans, t } from '@lingui/macro';
const CreditMemoList = ({ memoList, orderId }) => {
  const [isPopUp, setPopUp] = useState(false);
  function popUpOpen() {
    if (memoList.length > 0) {
      setPopUp(!isPopUp);
    }
  }
  function closePopUp() {
    setPopUp(!isPopUp);
  }
  const totalQty = (items)=>{
    let sum = 0;
    items?.map((i)=> sum+=i.qty)
    return sum
  }
  const MemoListPopUp = () => {
    return (
      <React.Fragment>
        {isPopUp && (
          <Popup box="sidebar" close={closePopUp}>
            <div className={styles.CreditMemo}>
              <div className={styles.innerBox}>
                <button className={styles.close} onClick={closePopUp}>
                  <div className="icon icon-x-circle-black"></div>
                </button>
                <div>
                  <div className={styles.return_text}>
                    <Trans>Credit Memo</Trans> ({memoList.length})
                  </div>
                </div>
                <div>
                  <ul className={styles.memoListing}>
                    {memoList?.map((i, index) => (
                      <React.Fragment key={index}>
                        <div className={styles.orderID}>
                          <Trans>Order ID</Trans> #{orderId}
                        </div>
                        {[
                          {
                            lable: t`Credit Memo Id `,
                            value: `#${i?.creditmemo_increment_id}`,
                          },
                          { lable: t`Quantity `, value: totalQty(i?.item_qtys)  },
                          {
                            lable: t`Refunded Amount `,
                            value: getFormattedPrice(i.return_amount),
                          },
                        ].map((i, index) => (
                          <div className={styles.cols} key={index}>
                            <div className="lable_">{i?.lable}</div>
                            <div className="value_">{i?.value}</div>
                          </div>
                        ))}
                        <hr className="devider" />
                      </React.Fragment>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </React.Fragment>
    );
  };
  return (
    <React.Fragment>
      <MemoListPopUp />
      <div className={styles.createMemeoTxt} onClick={popUpOpen}>
        <Trans>Credit Memo </Trans>{' '}
        <span className={styles.memoCount}>{memoList.length}</span>
      </div>
    </React.Fragment>
  );
};

export default CreditMemoList;
