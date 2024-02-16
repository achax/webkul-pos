import React, { useEffect, useState } from 'react';
import styles from './Navbar.module.scss';
import Image from 'next/image';
import MenuList from './MenuList';
import { useSelector } from 'react-redux';
import { db } from '~/models';
import { isValidObject } from '~utils/Helper';
import { t } from '@lingui/macro';

export const Navbar = () => {
  const user = useSelector((state) => state.cashier);
  const storeConfig = useSelector((state) => state.storeConfig?.config);
  const [userDetails, setUserDetails] = useState({
    name: '',
    image: '',
  });
  const sideMenuData = [
    {
      name: t`Home`,
      icon: '/assets/icons/home.svg',
      iconclass: 'icon-home-2',
      slug: 'home',
      highlightedIcon: '/assets/icons/homeHighlighted.svg',
      link: '/',
    },
    {
      name: t`Customer`,
      icon: '/assets/icons/user.svg',
      iconclass: 'icon-customer',
      slug: 'customer',
      highlightedIcon: '/assets/icons/userHighlighted.svg',
      link: '/customer',
    },
    {
      name: t`Cashier`,
      icon: '/assets/icons/dollar-circle-white.svg',
      iconclass: 'icon-creditmemo',
      slug: 'cashier',
      highlightedIcon: '/assets/icons/dollar-circle-orange.svg',

      link: '/cashier',
    },
    {
      name: t`Orders`,
      icon: '/assets/icons/shopping-bag.svg',
      iconclass: 'icon-take-away',
      slug: 'orders',
      highlightedIcon: '/assets/icons/shopping-bag-highlighted.svg',
      link: '/orders',
    },
    {
      name: t`Reports`,
      icon: '/assets/icons/report.svg',
      iconclass: 'icon-reports',
      slug: 'reports',
      highlightedIcon: '/assets/icons/reportHighlighted.svg',
      link: '/reports',
    },

    {
      name: t`Refresh`,
      icon: '/assets/icons/refreshIcon.png',
      iconclass: ' icon-reset-cart',
      link: '/',
      highlightedIcon: '/assets/icons/refreshIcon.png',
    },
  ];
  const defaultImg = '/assets/images/login-user.png';
  const [imageSrc, setImageSrc] = useState(defaultImg);
  const [imgLoader, setImgLoader] = useState(true);
  /*
   * manage the user name and user profile image
   */
  useEffect(() => {
    if (user.cashier && user.cashier.id !== null) {
      handleUserDetails(
        `${user.cashier.firstname} ${user.cashier.lastname}`,
        user.cashier.filename
      );
    } else {
      const fetchCashierDetails = async () => {
        const fetchUserDetails = await db.cashier.toArray();
        if (fetchUserDetails[0]) {
          handleUserDetails(
            `${fetchUserDetails?.[0]?.firstname} ${fetchUserDetails?.[0]?.lastname}`,
            fetchUserDetails?.[0]?.filename
          );
        }
      };
      fetchCashierDetails();
    }
  }, [user]);
  const handleUserDetails = (userName, userImage) => {
    setUserDetails({
      name: `${userName}`,
      image: `${userImage}`,
    });
  };
  useEffect(() => {
    if (
      isValidObject(storeConfig) &&
      storeConfig?.base_media_url &&
      userDetails?.image
    ) {
      setImageSrc(`${storeConfig.base_media_url}${userDetails.image}`);
    }
  }, [storeConfig, userDetails]);
  return (
    <aside className={styles.navbar}>
      {sideMenuData && <MenuList sideMenuData={sideMenuData} />}

      <div className={styles.user_info}>
        {imgLoader && <div className={styles.img_loader}></div>}

        {isValidObject(storeConfig) &&
          storeConfig?.base_media_url &&
          userDetails?.image && (
            <Image
              alt="login_user"
              src={imageSrc}
              width="50"
              height="50"
              onLoadingComplete={() => setImgLoader(false)}
              onError={() => setImageSrc(defaultImg)}
              className="rounded_full"
            />
          )}
        {userDetails?.name}
      </div>
    </aside>
  );
};
