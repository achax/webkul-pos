import React, { useEffect, useState } from 'react';
import ChartItem from './ChartItem';
import styles from './DayReport.module.scss';
import { db } from '~models';
import {
  isValidObject,
  getStatsTypeFormattedData,
  getOptions,
  decimalTrim
} from '~utils/Helper';
import { t } from '@lingui/macro';

export const DayReport = ({ activeTab }) => {
  const [report, setReport] = useState(false);
  let type = activeTab === 1 ? 'day' : activeTab === 2 ? 'week' : 'month';

  useEffect(() => {
    const getReportData = async () => {
      const reportsData = await db.reports.toArray();
      if (isValidObject(reportsData[0])) {
        setReport(reportsData[0]?.posReport[type]);
      }
    };
    getReportData();
  }, [activeTab, type]);

  const gross = {
    label: t`Gross Revenue `,
    report_amount: report?.grossRevenueTotal ? decimalTrim(report?.grossRevenueTotal) : 0,
    statsData: getStatsTypeFormattedData(
      report.grossRevenue,
      'Gross Revenue',
      type
    ),
  };

  const order = {
    label: t`Order`,
    report_value: report?.totalOrder ? decimalTrim(report?.totalOrder): 0,
    statsData: getStatsTypeFormattedData(report.orderData, 'Order', type),
  };

  const averageOrderValue = {
    label: t`Average Order Value`,
    report_amount: report.averageOrder ? decimalTrim(report.averageOrder) : 0,
    statsData: getStatsTypeFormattedData(
      report.averageOrderValue,
      'Order Value',
      type
    ),
  };

  const averageItemPerOrder = {
    label: t`Average Item Value`,
    report_value: report.averageItemOrder ? decimalTrim(report.averageItemOrder) : 0,
    statsData: getStatsTypeFormattedData(
      report.averageItemPerOrder,
      'Item Value',
      type
    ),
  };

  const net = {
    label: t`Net Revenue `,
    report_amount: report.netRevenueTotal ? report.netRevenueTotal : 0,
    statsData: getStatsTypeFormattedData(
      report.netRevenue,
      'Net Revenue',
      type
    ),
  };

  const discountedOffers = {
    label: t`Discounted Offers`,
    report_amount: report.totalDiscountedOffer
      ? report.totalDiscountedOffer
      : 0,
    statsData: getStatsTypeFormattedData(
      report.discountedOffers,
      t`Discounted Offers`,
      type
    ),
  };

  return (
    <>
      <div className={styles.postabcontainer}>
        <div className={styles.drawer_section}>
          <ChartItem
            data={gross}
            options={getOptions(
              `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
              'Amount'
            )}
          />
          <ChartItem
            data={order}
            options={getOptions(
              `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
              'Order'
            )}
          />
          <ChartItem
            data={averageOrderValue}
            options={getOptions(
              `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
              t`Order Value`
            )}
          />
          <ChartItem
            data={averageItemPerOrder}
            options={getOptions(
              `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
              t`Item Value`
            )}
          />

          <ChartItem
            data={net}
            options={getOptions(
              `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
              t`Net Revenue`
            )}
          />

          <ChartItem
            data={discountedOffers}
            options={getOptions(
              `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
              t`Discounted Offers`
            )}
          />
        </div>
      </div>
    </>
  );
};

// export default DayReport;
