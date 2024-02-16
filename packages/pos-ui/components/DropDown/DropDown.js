import React from 'react';
// import { Trans } from '@lingui/macro';

export const DropDown = React.forwardRef(
  (
    {
      onChange,
      onBlur,
      name,
      id,
      options,
      label,
      className = '',
      type = '',
      errorMsg,
    },
    ref
  ) => (
    <React.Fragment>
      <label htmlFor={id}>{label}</label>
      <select
        className={`form_control ${className}`}
        name={name}
        ref={ref}
        id={id}
        onChange={onChange}
        onBlur={onBlur}
      >
        {type == 'config' ? (
          // <option value="">Select</option>
          ''
        ) : type == 'simple' ? (
          <option value="">Select</option>
        ) : (
          ''
        )}
        {/* <option value="0">Please Select</option> */}
        {options.map((option, index) => (
          <option
            key={index}
            value={option.value ? option.value : option.value_index}
          >
            {option.label}
          </option>
        ))}
      </select>

      {errorMsg && <span className="error">{errorMsg}</span>}
    </React.Fragment>
  )
);
DropDown.displayName = 'DropDown';
