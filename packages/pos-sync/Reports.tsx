import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import POS_REPORTS from '~/API/PosReports.graphql';
import { db } from '~/models';
import { showToast, resetPosApp } from '~utils/Helper';
import { Trans } from '@lingui/macro';
/**
 * ICashDrawerProps Interface
 */
interface IReportProps {
  triggerReqCompleted: Function;
  header: String | any;
}

/**
 * Coupons
 * @param triggerReqCompleted outletId
 * @returns coupon data
 */
export const Reports: FC<IReportProps> = ({ triggerReqCompleted, header }) => {
  const { data, error } = useQuery(POS_REPORTS, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });

  if (data) {
    db.reports
      .add(data)
      .then(() => {
        triggerReqCompleted();
      })
      .catch((error) => console.log(error));
  }
  if (error) {
    showToast({
      type: 'error',
      message: JSON.parse(JSON.stringify(error)).message,
    });
    resetPosApp();
  }

  return (
    <div className="pos_sync_tab">
      <Trans>Reports is Loading ...</Trans>
    </div>
  );
};
