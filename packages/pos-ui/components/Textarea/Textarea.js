import React from 'react';
import styles from './Textarea.module.scss';

export const Textarea = React.forwardRef((props, ref) => {
  return (
    <React.Fragment>
      <textarea
        name={props.name}
        value={props.value}
        placeholder={props.placeholder}
        rows={props.rows}
        cols={props.cols}
        className={`${styles.textarea} ${props.className}`}
        ref={ref}
        onChange={props.onChange}
      >
        {props.body}
      </textarea>
    </React.Fragment>
  );
});

Textarea.displayName = 'Textarea';
