import React, { Fragment } from 'react';
import styles from './Tabs.module.scss';

/**
 * Tab
 *
 * @param {Object} props - children: TabList(s)
 * @returns
 */
export const Tabs = (props) => {
  return (
    <div className={`${styles.tabs} ${props.className || ''}`}>
      {props.children}
    </div>
  );
};

/**
 * Tab Lists - Tab Items
 *
 * @param {*} param0
 * id: Id of that tab ||
 * className - className to manage css for the same from your component ||
 * tabName - As this is input it needs a name attribute - it should be same for all tab list in a tab group ||
 * title - Title of that tab list
 * defaultActiveTab - to set selected on load
 * switchHandler - to Manage the switch tab
 * @returns
 */
export const TabList = ({
  id,
  className,
  tabName,
  title,
  defaultActiveTab = false,
  switchHandler,
}) => {
  var isChecked = Boolean(defaultActiveTab === id);
  return (
    <div className={styles.tab__list} id={`#${id}`}>
      <input
        type="radio"
        defaultChecked={isChecked}
        onChange={() => {
          switchHandler(id);
        }}
        id={id}
        className={`${styles.tabs} ${className || ''}`}
        name={tabName}
      />
      <label className="text-bold" htmlFor={id}>
        <span className={`${isChecked ? styles.activeTab : ''}`}>{title}</span>
      </label>
      {isChecked ? (
        <div className={`${styles.ease} ${styles.Activeline}`}></div>
      ) : (
        ''
      )}
    </div>
  );
};

/**
 * Tab Content - Content respective to selected tab.
 *
 * @param {*} param0
 *
 * tabListId - Id of respective TabList ||
 * className - className to manage css for the same from your component ||
 * children - innerHtml
 * activeTab - State of currently Active TabList
 * @returns
 */
export const TabContent = ({ tabListId, className, children, activeTab }) => {
  if (activeTab === tabListId) {
    return (
      <Fragment>
        <section className={`${className || ''} ${styles.tab__content}`}>
          {children}
        </section>
      </Fragment>
    );
  } else {
    return null;
  }
};
