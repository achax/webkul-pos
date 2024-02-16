import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { refreshDatabase } from '~/models';
import { useRouter } from 'next/router';
import { configActions } from '~/store/config';

const Reset = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(configActions.reset());
    refreshDatabase();
    router.replace('/sync');
  });

  return <div></div>;
};

export default Reset;
