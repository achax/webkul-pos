import React, { useEffect, useState } from 'react';
import { PlaceHolder, Popup } from '@webkul/pos-ui';
import { db } from '~models';
import { Trans } from '@lingui/macro';
import { useDispatch } from 'react-redux';
import { searchActions } from '~/store/search';
import styles from './CategoryList.module.scss';
import ChildCategory from './ChildCategory';
/**
 * Get category list
 * @returns
 */
export const CategoryList = () => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState();
  const [isCategorySelect, setIsCategorySelect] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [childCategory, setChildCategory] = useState([]);
  const [isChildCatSelected, setIsChildCatSelected] = useState(false);
  const [dropDownCategory, setDropDownCategory] = useState(false);
  const [more, setMore] = useState(true);
  const [categoryCount, setCategoryCount] = useState(0);

  /**
   * Get category data from DB
   */
  useEffect(() => {
    async function getCategory() {
      const allCategory = await db.categories.toArray();

      if (
        allCategory.length > 0 &&
        allCategory[0]?.children_data !== null &&
        allCategory[0]?.children_data !== undefined
      ) {
        setCategories(allCategory[0].children_data);
        setCategoryCount(allCategory[0].children_data.length - 5);
      }
    }
    if (!categories) getCategory();
  }, [categories, categoryCount]);

  const handleClosePopup = React.useCallback(() => {
    setDropDownCategory(false);
  }, []);
  /**
   * fetch child data from filterByCategory
   * @param {category_id} as props
   */
  const fetchChildData = (item) => {
    dispatch(searchActions.filterByCategory(item.category_id));
    setSelectedCategory(item);
    setChildCategory(item.children_data);
    setIsCategorySelect(true);
    setMore(false);
    setDropDownCategory(false);
  };

  /**
   * handle back arrow and filter by category
   */
  const handleBackArrow = () => {
    if (!childCategory && !isChildCatSelected) {
      let data =
        categories &&
        categories?.find(
          (item) => item?.category_id === selectedCategory?.parent_id
        );

      dispatch(searchActions.filterByCategory(data.category_id));
      setSelectedCategory(data);
      setChildCategory(data.children_data);
      setIsCategorySelect(true);
      setMore(false);
      setIsChildCatSelected(false);
      setDropDownCategory(false);
    } else {
      dispatch(searchActions.filterByCategory(null));
      setIsCategorySelect(false);
      setSelectedCategory([]);
      setIsChildCatSelected(false);
      setChildCategory([]);
      setMore(true);
    }
  };

  return (
    <React.Fragment>
      {categories === null && (
        <PlaceHolder
          customPlaceHolderClass={styles.category_selector}
          count={12}
          grid={true}
          imageWidth="100px"
          imageHeight="100px"
          hasDescription={false}
          hasMeta={false}
        />
      )}

      {categories && categories?.length !== 0 ? (
        <nav className={styles.category_selector}>
          {
            <ul
              className={` ${styles.top_nav_ul} ${
                !isCategorySelect ? styles.parent : styles.child
              } `}
            >
              {!isCategorySelect && categories && categories.length > 0
                ? categories.map((categoryItem, index) =>
                    index < 5 ? (
                      <li key={index}>
                        <a
                          className={styles.top_nav_link}
                          onClick={() => fetchChildData(categoryItem)}
                        >
                          {categoryItem.name}
                        </a>
                      </li>
                    ) : (
                      ''
                    )
                  )
                : selectedCategory && (
                    <>
                      <span
                        className="icon-arrow icon-chevron-left"
                        onClick={handleBackArrow}
                      ></span>
                      <li>
                        <a
                          className={`${styles.top_nav_link} ${
                            selectedCategory &&
                            selectedCategory.category_Id ==
                              selectedCategory.category_Id
                              ? styles.li_selected
                              : ''
                          } `}
                        >
                          {selectedCategory.name}
                        </a>
                      </li>

                      <span className={styles.arrow_right}>
                        <span className=" icon-arrow-right icon-chevron-right1"></span>
                      </span>

                      {childCategory &&
                        childCategory.map((categoryItem, index) => (
                          <li key={index}>
                            <a
                              className={styles.top_nav_link}
                              onClick={() => fetchChildData(categoryItem)}
                            >
                              {categoryItem.name}
                            </a>
                          </li>
                        ))}
                    </>
                  )}
              {more && categoryCount > 0 && (
                <li
                  className={styles.right_nav}
                  onClick={() => setDropDownCategory(!dropDownCategory)}
                >
                  <a className={styles.right_nav_link}>
                    <label>
                      More <span className={styles.badge}>{categoryCount}</span>
                    </label>
                  </a>
                </li>
              )}
            </ul>
          }
          {dropDownCategory && (
            <Popup close={handleClosePopup} box="category">
              <div className={styles.categories_container}>
                <div className={styles.heading_section}>
                  <h1 className="m-1">
                    <Trans> Select Category from below list </Trans>
                  </h1>
                  <span
                    className="icon  icon-cancel-dark pointer py-15"
                    onClick={() => setDropDownCategory(false)}
                  ></span>
                </div>

                <div className={styles.categories_container_list}>
                  {categories
                    ? categories.map((categoryItem, index) =>
                        index > 4 ? (
                          <div
                            className={
                              styles.categories_container_item + ' listing__'
                            }
                            key={index}
                          >
                            {categoryItem?.children_data &&
                              categoryItem?.children_data.length <= 0 && (
                                <>
                                  <a
                                    // className={styles.top_nav_link}
                                    onClick={() => fetchChildData(categoryItem)}
                                  >
                                    {categoryItem.name}
                                  </a>
                                </>
                              )}

                            {categoryItem?.children_data &&
                              categoryItem?.children_data.length > 0 && (
                                <>
                                  <ChildCategory
                                    name={categoryItem?.name}
                                    childrenCat={categoryItem}
                                    fetchChild={(item) => {
                                      fetchChildData(item);
                                      if (!item?.children_data) {
                                        setIsChildCatSelected(true);
                                      }
                                    }}
                                  />
                                </>
                              )}
                          </div>
                        ) : (
                          ''
                        )
                      )
                    : ''}
                </div>
              </div>
            </Popup>
          )}
        </nav>
      ) : (
        ''
      )}
    </React.Fragment>
  );
};
