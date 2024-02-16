import React from 'react';
import styles from './Popup.module.scss';

export const Popup = (props) => {
  const popUpRef = React.useRef();
  React.useEffect(() => {
    const popAction = function (e) {
      const targetNode = popUpRef.current;
      if (
        !targetNode.contains(e.target) &&
        Object.hasOwnProperty.call(props, 'close')
      ) {
        props?.close();
      }
    };
    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', popAction);
    }
    return () => {
      document.removeEventListener('mousedown', popAction);
    };
  }, [props]);
  return (
    <div
      className={
        props.box === 'discount'
          ? styles.discountbox
          : props.box === 'invoice'
          ? styles.invoicebox
          : props.box === 'sidebar'
          ? styles.sidebar
          : // ? styles.listBox
          props.box === 'pop'
          ? styles.pop_box
          : props.box === 'category'
          ? styles.category
          : props.box === 'customer'
          ? styles.customer
          : styles.popupbox
      }
    >
      <div
        id="popCantainer"
        ref={popUpRef}
        className={`${props?.className ?? styles.box} 
        
        `}
      >
        {props.children}
      </div>
    </div>
  );
};

// export default Popup;
