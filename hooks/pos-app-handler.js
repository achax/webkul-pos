import { useEffect, useState } from 'react';
import { db } from '~/models';
import { isValidArray } from '~/utils/Helper';

export function usePosDetail() {
  const [appName, setAppName] = useState();

  useEffect(() => {
    const getStoreDetails = async () => {
      const storeDetails = await db.storeConfig.toArray();
      if (isValidArray(storeDetails)) {
        setAppName(
          storeDetails[0]?.application_name
            ? storeDetails[0]?.application_name
            : 'Pos-App'
        );
      }
    };
    getStoreDetails();
  }, []);

  return {
    appName,
  };
}
