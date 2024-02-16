import { OrderDetails, OrderHistory, OrderHold } from '@webkul/pos-orders';
import { TabContent, TabList, Tabs, Popup } from '@webkul/pos-ui';
import React, { useState, useEffect } from 'react';
import styles from '../../styles/Orders/Orders.module.scss';
import { useSelector } from 'react-redux';
import { isValidObject } from '~utils/Helper';
import { useRouter } from 'next/router';
import {  t } from '@lingui/macro';
const Orders = () => {
  const TABS = [
    {
      id: 1,
      title: t`Order History`,
    },
    {
      id: 2,
      title: t`Order On Hold`,
    },
  ];
  const router = useRouter();
  const selectedOrderItem = useSelector(
    (state) => state.orderItem.orderItemData
  );
  const [activeTab, setActiveTab] = useState(1);
  const [isTabletScreen, setIsTabletScreen] = useState(false);
  const { tab } = router.query;
  useEffect(() => {
    setActiveTab(parseInt(tab ? tab : 1));
  }, [tab]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      if (window?.innerWidth < 1020) setIsTabletScreen(true);
      else setIsTabletScreen(false);
      // remove event listener on clean up
      return () => window.removeEventListener('resize');
    });
  });

  return (
    <div className={styles.orders}>
      <section className={styles.orders_info_section}>
        <div className={styles.orders__category_selector}>
          <nav>
            {
              <Tabs>
                {TABS.map((tab) => (
                  <TabList
                    key={tab.id}
                    id={tab.id}
                    tabName="outlet_tab_list"
                    defaultActiveTab={activeTab}
                    switchHandler={(e) => {
                      setActiveTab(e);
                    }}
                    title={tab.title}
                  />
                ))}
              </Tabs>
            }
          </nav>
        </div>
        <TabContent className={styles.tab_list}>
          {activeTab === 1 && <OrderHistory />}
          {activeTab === 2 && <OrderHold />}
        </TabContent>
      </section>
      {activeTab === 1 && isTabletScreen && isValidObject(selectedOrderItem) ? (
        <Popup box="sidebar">
          <OrderDetails
            orderItem={selectedOrderItem}
            activeTab={activeTab}
            closed={(isPopClosed) => {
              console.log(isPopClosed);
            }}
            isTabMode={true}
          />
        </Popup>
      ) : activeTab === 2 ? (
        ''
      ) : (
        <OrderDetails orderItem={selectedOrderItem} activeTab={activeTab} />
      )}
    </div>
  );
};

export default Orders;

/**
 * Generate at build time.
 *
 * @returns {JSON} props
 */
export async function getStaticProps() {
  return {
    props: {
      twoColumnLayout: true,
    },
  };
}
