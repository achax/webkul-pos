import React, { useState } from 'react';
import styles from '../../styles/Report/Report.module.scss';
import {
  Tabs,
  TabList,
  TabContent,
} from '../../packages/pos-ui/components/TabComponent';
import { DayReport } from '../../packages/pos-ui/components/ReportTabs';
import { t } from '@lingui/macro';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(1);

  const TABS = [
    {
      id: 1,
      title: t`Day`,
    },
    {
      id: 2,
      title: t`Week`,
    },
    {
      id: 3,
      title: t`Month`,
    },
  ];
  return (
    <div className={styles.reports}>
      <section className={styles.reports_section}>
        <div className={styles.reports__category_selector}>
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
        <TabContent className={styles.tab_container}>
          <DayReport activeTab={activeTab} />
        </TabContent>
      </section>
    </div>
  );
};

export default Reports;

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
