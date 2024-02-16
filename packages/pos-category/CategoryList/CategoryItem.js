import React, { useState, useEffect } from 'react';
import styles from './CategoryList.module.scss';

/**
 * Get Cateory Items
 * @param item
 * @returns
 */
const CategoryItem = ({ item }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState();

  /**
   * set Category Data in Category state
   */
  useEffect(() => {
    setCategoryData(item);
  }, [item]);

  /**
   * set selected category child data
   */
  const fetchChildData = () => {
    setSelectedCategory(item);
  };

  return (
    <>
      {
        <>
          {!selectedCategory ? (
            <li>
              <a
                className={`${styles.top_nav_link} ${
                  selectedCategory &&
                  selectedCategory.category_Id == item.category_Id
                    ? styles.li_selected
                    : ''
                } `}
                onClick={() => fetchChildData(item.category_id)}
              >
                {item.name}
              </a>
            </li>
          ) : (
            <CategoryItem item={item} />
          )}
        </>
      }
    </>
  );
};

export default CategoryItem;
