import { ProductList } from '@webkul/pos-products';
import { CategoryList } from '@webkul/pos-category';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { InitialAmountPopup } from '@webkul/pos-ui';
import { PosCart } from '@webkul/pos-cart';
import styles from '~/styles/Home/Home.module.scss';
import { cartProduct } from '~/utils/carts';
import { showToast, getTodayCashDrawer, isValidObject } from '~/utils/Helper';
import { Loader } from '@webkul/pos-ui';
import { db } from '~/models';
import { cashierActions } from '~store/cashier';
import { useDispatch } from 'react-redux';
import { client } from '~/lib/apollo-client';
import STORE_CONFIG_QUERY from '~/API/StoreConfig.graphql';
import { useFetchProduct } from '@webkul/pos-products';
// import { useAccessToken } from '~/hooks';

const Home = () => {
  const router = useRouter();
  const search = useSelector((state) => state.search.search.name);
  const storeConfig = useSelector((state) => state.storeConfig.config);
  const { loadDefaultProducts } = useFetchProduct();
  // const { accessToken } = useAccessToken();

  /**
   * get categoryId and search query of filtered product list case.
   */

  const dispatch = useDispatch();

  const [isInitialAmt, setIsInitialAmt] = useState(false);
  // let cashDrawer;

  useEffect(() => {
    if (!storeConfig || !storeConfig.synced) {
      router.replace('/sync');
    }
  }, [storeConfig, router]);

  useEffect(() => {
    async function loadCashDrawer() {
      try {
        const cashDrawer = await db.cashDrawer.toArray();
        let todayCashDrawer = getTodayCashDrawer(cashDrawer);

        if (!todayCashDrawer) {
          setIsInitialAmt(true);
        }
      } catch (err) {
        showToast({ type: 'error', message: err.message });
      }
    }
    loadCashDrawer();
  }, [dispatch]);

  /**
   * Syncing the Cashier with cashier store.
   */
  useEffect(() => {
    const getCashier = async () => {
      const cashier = await db.cashier.toArray();
      if (isValidObject(cashier[0])) {
        dispatch(cashierActions.loggedIn(cashier[0]));
      }
    };
    getCashier();
  }, [dispatch]);

  /**
   * reset the product list when user visit the homepage
   * after visit other pages,
   */
  useEffect(() => {
    if (!search) {
      loadDefaultProducts();
    }
  }, [loadDefaultProducts, search]);

  return (
    <React.Fragment>
      {storeConfig && storeConfig.synced ? (
        <>
          <div className={styles.home}>
            <section className={styles.home__product_section}>
              <CategoryList />
              <ProductList />
            </section>
            <PosCart cartProduct={cartProduct} />
          </div>
          {isInitialAmt && (
            <InitialAmountPopup
              initialPopup={isInitialAmt}
              change={setIsInitialAmt}
              inner={true}
            />
          )}
        </>
      ) : (
        <Loader />
      )}
    </React.Fragment>
  );
};

export default Home;

/**
 * Generate Manifest JSON
 * @param {*} config
 * @returns
 */
const generateManifest = (config) => {
  return {
    name: config.application_name || 'POS',
    short_name: config.application_short_name || 'POS',
    start_url: process.env.APP_URL,
    display: 'standalone',
    orientation: 'natural',
    background_color: config.bg_color,
    theme_color: config.theme_color,
    description: `${config.application_short_name || 'POS'} ${config.application_name || 'POS'
      }`,
    icons: [
      {
        src: `${config.base_media_url}pos/icon/${config.application_icon_48}`,
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: `${config.base_media_url}pos/icon/${config.application_icon_72}`,
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: `${config.base_media_url}pos/icon/${config.application_icon_96}`,
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: `${config.base_media_url}pos/icon/${config.application_icon_144}`,
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: `${config.base_media_url}pos/icon/${config.application_icon_168}`,
        sizes: '168x168',
        type: 'image/png',
      },
      {
        src: `${config.base_media_url}pos/icon/${config.application_icon_192}`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `${config.base_media_url}pos/icon/${config.application_icon_384}`,
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: `${config.base_media_url}pos/icon/${config.application_icon_512}`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
};

/**s
 * Generate at build time.
 *
 * @returns {JSON} props
 */
export async function getStaticProps() {
  const fs = require('fs');
  const { data } = await client.query({ query: STORE_CONFIG_QUERY });
  const manifestData = generateManifest(data.storeConfig || {});
  fs.writeFileSync('public/manifest.json', JSON.stringify(manifestData));
  return {
    props: {
      twoColumnLayout: true,
    },
  };
}
