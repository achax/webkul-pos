import React, { useState } from 'react';
import styles from '~/styles/Setting/Setting.module.scss';
import {
  Tabs,
  TabList,
  TabContent,
} from '~/packages/pos-ui/components/TabComponent';
import { AccountTabs, CashierTabs } from '@webkul/pos-setting';
import {  t } from '@lingui/macro';
const Setting = () => {
  const TABS = [
    {
      id: 1,
      title: t`Account Settings`,
    },
    {
      id: 2,
      title: t`Cashier Settings`,
    },
  ];
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className={styles.setting}>
      <section className={styles.setting__section}>
        <div className={styles.setting__category_selector}>
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
        <TabContent>
          {activeTab === 1 && <AccountTabs />}
          {activeTab === 2 && <CashierTabs />}
        </TabContent>
      </section>
    </div>
  );
};

export default Setting;

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
