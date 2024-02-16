import React, { FC } from 'react';
import { useQuery } from '@apollo/client';
import CATEGORY_QUERY from '~/API/Categories.graphql';
import { db } from '~/models';
import { showToast, resetPosApp } from '~utils/Helper';
import { Trans } from '@lingui/macro';
/**
 * ICategoryProps Interface
 */
interface ICategoryProps {
  triggerReqCompleted: Function;
  header: String | any;
}

/**
 * Categories
 * @param triggerReqCompleted outletId
 * @returns category data
 */
export const Categories: FC<ICategoryProps> = ({
  triggerReqCompleted,
  header,
}) => {
  const { data, error } = useQuery(CATEGORY_QUERY, {
    context: {
      headers: {
        'POS-TOKEN': header,
      },
    },
  });

  if (
    data &&
    data.posCategoriesList &&
    data.posCategoriesList.categories_list
  ) {
    db.categories
      .bulkPut(data.posCategoriesList.categories_list)
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
      <Trans>Categories is Loading ...</Trans>
    </div>
  );
};
