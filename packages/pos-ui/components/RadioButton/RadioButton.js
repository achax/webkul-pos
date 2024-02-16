import React from 'react';

export const RadioButton = ({ type, label, value, onChange, options }) => {
  return (
    <>
      <label>{label}</label>
      <hr />
      {options.map((option, index) => (
        <>
          <input type={type} checked={value} onChange={onChange} key={index} />
          {option.label}
        </>
      ))}
    </>
  );
};
