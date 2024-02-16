import React from 'react';
import { Chart } from 'react-google-charts';
// import { options } from '../../../../utils/Reports';
import styles from './DayReport.module.scss';
import { getFormattedPrice, isValidArray } from '~utils/Helper';

const ChartItem = ({ data, options }) => {

  return (
    <div className={styles.gross_report}>
      <div className={styles.report_head}>
        <div>
          <label>{data.label}</label>
          <span className={styles.report_amount}>
          {data?.report_amount ? getFormattedPrice(data?.report_amount  || 0) : data?.report_value || 0}
          </span>
        </div>
      </div>
      <div className={styles.charts}>
        <Chart
          chartType="LineChart"
          width="100%"
          height="200px"
          data={isValidArray(data.statsData) ? data.statsData : []}
          options={options}
        />
      </div>
    </div>
  );
};

export default ChartItem;
