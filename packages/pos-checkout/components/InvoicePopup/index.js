import React, { useState, useRef } from 'react';
import { Popup } from '@webkul/pos-ui';
import { useSelector } from 'react-redux';
import { Invoices } from '@webkul/pos-invoice';
import ReactToPrint from 'react-to-print';

export const InvoicePopup = ({ handleClose }) => {
  const componentRef = useRef();
  const selectedOrder = useSelector((state) => state.orderItem?.orderItemData);

  return (
    <>
      <Popup box="invoice">
        <div className="invoiceactions">
          <ReactToPrint
            trigger={() => <span className="icon icon-printer1"></span>}
            content={() => componentRef.current}
          />
          {/* <span className="icon icon-printer1"></span> */}
          <span className="icon icon-x-circle-red" onClick={handleClose}></span>
        </div>
        <Invoices ref={componentRef} data={selectedOrder} />
      </Popup>
    </>
  );
};
