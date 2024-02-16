import React from 'react';
import styles from './Button.module.scss';

/**
 * Button components
 * @param {object} props
 * @returns
 */
const BtnLoader = () => {
  return (
    <React.Fragment>
      <svg
        width={24}
        height={18}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style
          dangerouslySetInnerHTML={{
            __html:
              '.spinner_b2T7{animation:spinner_xe7Q .8s linear infinite ; color:white;}.spinner_YRVV{animation-delay:-.65s}.spinner_c9oY{animation-delay:-.5s}@keyframes spinner_xe7Q{93.75%,100%{r:3px}46.875%{r:.2px}}\n  ',
          }}
        />
        <circle fill="#fff" className="spinner_b2T7 " cx={4} cy={12} r={3} />
        <circle
          fill="#fff"
          className="spinner_b2T7 spinner_YRVV"
          cx={12}
          cy={12}
          r={3}
        />
        <circle
          fill="#fff"
          className="spinner_b2T7 spinner_c9oY"
          cx={20}
          cy={12}
          r={3}
        />
      </svg>
    </React.Fragment>
  );
};
export const Button = (props) => {
  return (
    <div className={`actions ${props.className || ''}`}>
      <button
        className={`${styles.btn} ${styles[props.buttonType || 'primary']} ${
          props.btnClass || ''
        } ${props.btnSmall ? styles.btn__small : ''} ${
          props.isLoading ? styles.btn__loading : ''
        } ${props.disabled === 'true' ? styles.btndisabled : ''} `}
        type={props.type || 'button'}
        onClick={props.clickHandler}
        value={props.value}
        disabled={
          props.disabled === 'true' || props?.loading === true ? true : ''
        }
      >
        {props?.loading === true ? (
          <span className={styles.btn__loader}>
            <BtnLoader />
          </span>
        ) : (
          <React.Fragment>
            {!props.showLoading && props.hasIcon && props.iconBefore && (
              <span
                className={`${styles.icon} ${props.iconClass || ''}`}
              ></span>
            )}
            <span>{props.title}</span>
            {!props.showLoading && props.hasIcon && !props.iconBefore && (
              <span
                className={`${styles.icon} ${props.iconClass || ''}`}
              ></span>
            )}
          </React.Fragment>
        )}
      </button>
    </div>
  );
};
