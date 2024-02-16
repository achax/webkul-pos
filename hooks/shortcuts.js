import React from 'react';
import { useRouter } from 'next/router';

/**
 * Home ——————— (ctrl+shft+1)
 * Order History ———— (ctrl+shft+2)
 * Hold Order History ——- (ctrl+shft+3)
 * Cash Drawer ————– (ctrl+shft+4)
 * Refresh Product List —– (ctrl+shft+5)
 * Put on Fullscreen ——– (F11)
 * Choose customer ———- (alt+c)
 */

export default function useShortcuts(invoke = null) {
  const router = useRouter();

  const redirect = React.useCallback(
    (option) => {
      router.push(option);
    },
    [router]
  );
  const redirectionAction = (evt) => {
    let keyEvent_ = evt.key;
    if (evt.shiftKey && evt.ctrlKey && keyEvent_ === '!') {
      redirect('/');
    }
    if (evt.shiftKey && evt.ctrlKey && keyEvent_ === '@') {
      redirect({
        pathname: '/orders',
        query: { tab: 1 },
      });
    }
    if (evt.shiftKey && evt.ctrlKey && keyEvent_ === '#') {
      redirect({
        pathname: '/orders',
        query: { tab: 2 },
      });
    }
    if (evt.shiftKey && evt.ctrlKey && keyEvent_ === '$') {
      redirect({
        pathname: '/cashier',
      });
    }
    if (evt.altKey && keyEvent_.toLowerCase() === 'c') {
      redirect({
        pathname: '/customer',
      });
    }
    if (evt.shiftKey && evt.ctrlKey && keyEvent_ === '%') {
      typeof invoke === 'function' && invoke();
    }
  };

  return {
    invoke,
    redirectionAction,
  };
}
