import React from 'react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { PageLayout, ClientPortal } from '@webkul/pos-ui';
import { useSelector } from 'react-redux';
import useShortcuts from '~hooks/shortcuts';
import { toastProps } from '~utils/Helper';
export const Layout = (props) => {
  const { redirectionAction } = useShortcuts();
  const storeConfig = useSelector((state) => state.storeConfig.config);
  const title = storeConfig?.application_name || 'Point of Sale';
  const description = `${title} ${storeConfig?.application_short_name}`;
  const twoColumnLayout = props.children.props.twoColumnLayout;

  React.useEffect(() => {
    if (window) {
      document.addEventListener('keyup', redirectionAction);
    }
    return () => {
      document.removeEventListener('keyup', redirectionAction);
    };
  }, [redirectionAction]);

  return (
    <React.Fragment>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <div className="page-wrapper">
        <PageLayout twoColumnLayout={twoColumnLayout}>
          {props.children}
        </PageLayout>
      </div>
      <ClientPortal selector="#alerts">
        <ToastContainer {...toastProps} />
      </ClientPortal>
    </React.Fragment>
  );
};
