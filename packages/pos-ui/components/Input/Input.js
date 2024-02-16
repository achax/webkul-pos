import React from 'react';
// import styles from './Input.module.scss';

export const Input = React.forwardRef((props, ref) => {
  return (
    <React.Fragment>
      {props.title ? <h4>{props.title}</h4> : ''}
      <input
        type={props.type}
        name={props.name}
        placeholder={props.placeholder}
        ref={ref}
        onBlur={props.onBlur}
        className={`form_control ${props.className}`}
        onChange={props.onChange}
        value={props.value}
        autoFocus={true}
      />
      {props.errorMsg && <span className="error">{props.errorMsg}</span>}
    </React.Fragment>
  );
});

Input.displayName = 'Input';
