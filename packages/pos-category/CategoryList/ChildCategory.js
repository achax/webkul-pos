import React, { useState } from 'react';
import styles from './CategoryList.module.scss';

const ChildCategory = ({ name, childrenCat, fetchChild }) => {
  const [showChildCat, setShowChildCat] = useState(false);

  return (
    <>
      <div className={styles.child_category}>
        <div
          className="m-1 text-base icon-hover-effect "
          onClick={() => fetchChild(childrenCat)}
        >
          {name}
        </div>
        <span
          className={` icon-right-angle pointer ${
            showChildCat ? `down transition` : ``
          }`}
          onClick={() => {
            setShowChildCat(!showChildCat);
          }}
        ></span>
      </div>

      <div className={styles.child_category_section}>
        {childrenCat?.children_data &&
          showChildCat &&
          childrenCat?.children_data?.length > 0 &&
          childrenCat?.children_data.map((item, index) => {
            return (
              <h4
                key={index}
                onClick={() => {
                  fetchChild(item);
                }}
              >
                {'*'} {item.name}
              </h4>
            );
          })}
      </div>
    </>
  );
};

export default ChildCategory;
