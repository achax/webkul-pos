import { ApolloProvider } from '@apollo/client';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useApollo } from '~/lib/apollo-client';
import { store } from '~/store';
import { Layout } from '@webkul/pos-ui';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { en } from 'make-plural/plurals';
import { useRouter } from 'next/router';
import '~/styles/globals.scss';
import 'react-toastify/dist/ReactToastify.css';
import { db, useCheckDbStatus } from '~/models';
import { isValidArray } from '~/utils/Helper';

function MyApp({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState);
  const isdatabase = useCheckDbStatus();
  const router = useRouter();
  const { asPath } = router;
  const locale = 'en';
  useEffect(() => {
    async function load(locale) {
      const { messages } = await import(`../locale/${locale}/messages.po`);
      i18n.load(locale, messages);
      i18n.activate(locale);
      i18n.loadLocaleData(locale, { plurals: en });
    }

    load(locale);
  }, [locale]);
  /**
   * Manage the route the app to login page when
   * IndexedDB get cleared.
   */
  useEffect(() => {
    if (isdatabase) {
      const getStore = async () => {
        const cashier = await db.cashier.toArray();
        if (!isValidArray(cashier) && asPath !== '/login')
          router.push('/login');
      };
      getStore();
    }
  }, [router, isdatabase, asPath]);
  return (
    <React.StrictMode>
      <I18nProvider i18n={i18n}>
        <ApolloProvider client={apolloClient}>
          <Provider store={store}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Provider>
        </ApolloProvider>
      </I18nProvider>
    </React.StrictMode>
  );
}
export default MyApp;
