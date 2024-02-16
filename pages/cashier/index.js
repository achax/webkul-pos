import { useState } from 'react';
import { CloseCounter, SaleHistory, TodayCash } from '~/packages/pos-cashier';
import { Tabs, TabContent, TabList } from '@webkul/pos-ui';
import styles from '~/styles/Cashier/Cashier.module.scss';
import { TABS } from '~/utils/TABS';

const Cashier = () => {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className={styles.cashier}>
      <section className={styles.cashier__cashier_section}>
        <div className={styles.cashier__category_selector}>
          <nav>
            {
              <Tabs>
                {TABS.map((tab) => (
                  <TabList
                    key={tab.id}
                    id={tab.id}
                    tabName="outlet_tab_list"
                    defaultActiveTab={activeTab}
                    switchHandler={() => {
                      setActiveTab(tab.id);
                    }}
                    title={tab.title}
                  />
                ))}
              </Tabs>
            }
          </nav>
        </div>
        <TabContent className={styles.tab_list}>
          {activeTab === 1 && <CloseCounter />}
          {activeTab === 2 && <TodayCash />}
          {activeTab === 3 && <SaleHistory />}
        </TabContent>
      </section>
    </div>
  );
};

export default Cashier;

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
