import { useMutation } from '@apollo/client';
import React, { useEffect } from 'react';
import CASHIER_LOGIN from '../API/mutation/CashierLogin.graphql';
import { db, useCheckDbStatus, openConnection } from '../models';
import { Button, Input } from '@webkul/pos-ui';
import { setLocalStorage, CASHIER_LOGIN_STORE_KEY } from '~store/local-storage';
import styles from '../styles/Login.module.scss';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { showToast, isValidObject } from '@utils/Helper';
import { Trans, t } from '@lingui/macro';
import { useAccessToken } from '~/hooks';
const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    reValidateMode: 'onBlur',
  });
  const router = useRouter();
  const { accessToken, setAuthToken } = useAccessToken();
  const isDatabase = useCheckDbStatus();
  const [login, { loading }] = useMutation(CASHIER_LOGIN, {
    onError: () => {},
  });

  const submitForm = (data) => {
    try {
      login({
        variables: data,
      })
        .then((res) => {
          if (res?.data && res?.data.cashierLogin) {
            let cashierData =
              data && isValidObject(res?.data.cashierLogin)
                ? res?.data.cashierLogin 
                : {};
            if (isValidObject(cashierData)) {
              if (!accessToken) {
                setAuthToken(cashierData?.token);
                setLocalStorage(CASHIER_LOGIN_STORE_KEY ,res?.data.cashierLogin.store_code )
              }
              // remove the token key from the cashier data
              delete cashierData?.token;
              openConnection();
              addCashierToDB(cashierData);
            }
          }
        })
        .catch((err) => {
          err && showToast({ message: t`Invalid Login`, type: 'error' });
        });
    } catch (error) {
      showToast({ message: t`Invalid Credentials`, type: 'error' });
    }
  };

  async function addCashierToDB(data) {
    try {
      await db.cashier.put(data);
      router.replace('/sync');
    } catch (error) {
      console.log(error.message);
    }
  }
  useEffect(() => {
    const navigateToSync = async () => {
      if (isDatabase) {
        const cashier = await db.cashier.toArray();
        if (isValidObject(cashier[0])) {
          router.push('/sync');
        }
      }
    };
    navigateToSync();
  });
  return (
    <div className={styles.login}>
      <div className={styles.login__main}>
        <h2 className={styles.login__main_heading}>
          <b>
            <Trans>Point Of Sale (POS) System</Trans>
          </b>
        </h2>
        <div className={styles.login__container}>
          <h2>
            <b>
              <Trans>LOGIN TO YOUR ACCOUNT</Trans>
            </b>
          </h2>
          <form onSubmit={handleSubmit(submitForm)}>
            <div>
              <label>
                <Trans>Username</Trans> <span>*</span>
              </label>
              <Input
                type="text"
                {...register('userName', {
                  required: t`Username is required !!`,
                })}
              />
              {errors.userName && (
                <p className="error">{errors.userName.message}</p>
              )}
            </div>
            <div>
              <label>
                <Trans>Password</Trans> <span>*</span>
              </label>
              <Input
                type="password"
                {...register('password', {
                  required: t`Password is required !!`,
                })}
              />
              {errors.password && (
                <p className="error">{errors.password.message}</p>
              )}
            </div>
            <Button
              title={t`Login`}
              type="submit"
              isLoading={loading}
              className={styles.login__container__login_submit}
              buttonType="primary"
            />
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;
