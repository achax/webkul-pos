import { useMemo } from 'react';
import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client';
import { concatPagination } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { showToast } from '~/utils/Helper';

/**
 * Polyfill Global Variables in Server
 */
if (typeof window === 'undefined') {
  global.URL = require('url').URL;
}

let apolloClient;

// handling  graohQl and Network error globally

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message /* , locations, path */ }) => {
      showToast({ message: message, type: 'error' });
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

function createApolloClient() {
  const uri = process.env.MAGENTO_URL + 'graphql';

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    // credentials: 'include',

    // add form array for using errorLink and  HttpLink both together.
    link: from([
      errorLink,
      new HttpLink({
        uri,
        // credentials: 'include', // Additional fetch() options like `credentials` or `headers`
      }),
    ]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            allPosts: concatPagination(),
          },
        },
      },
    }),
  });
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}

/**
 * * For SSR use..
 */
export const client = initializeApollo();
