import { useEffect, useState } from 'react';
import { getAppCookie, setAppCookie } from '~utils/Helper';
import { AUTH_TOKEN } from '~utils/Constants';

export function useAccessToken() {
  const [accessToken, setAccessToken] = useState();

  const setAuthToken = (token) => {
    setAppCookie(AUTH_TOKEN, token);
    setAccessToken(token);
  };

  const getAuthToken = () => {
    const authToken = getAppCookie(AUTH_TOKEN);
    if (authToken) {
      setAccessToken(authToken);
      return authToken;
    }
  };

  useEffect(() => {
    const authTok = getAppCookie(AUTH_TOKEN);
    if (authTok) {
      setAccessToken(authTok);
    }
  }, []);

  return {
    accessToken,
    setAuthToken,
    getAuthToken,
  };
}
