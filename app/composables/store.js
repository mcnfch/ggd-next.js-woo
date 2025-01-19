import { LRUCache } from 'lru-cache';
import { hash as ohash } from 'ohash';
import { getProductsQuery } from '~/gql/queries/getProducts';
import { getCategoriesQuery } from '~/gql/queries/getCategories';
import { getSearchProductsQuery } from '~/gql/queries/getSearchProducts';
import { getProductQuery } from '~/gql/queries/getProduct';
import { addToCartMutation } from '~/gql/mutations/addToCart';
import { updateItemQuantitiesMutation } from '~/gql/mutations/updateItemQuantities';
import { checkoutMutation } from '~/gql/mutations/checkout';

const promiseCache = new LRUCache({
  max: 500,
  ttl: 2000 * 60 * 60,
});

async function _fetchGraphQL(query, variables = {}) {
  const { $graphql } = useNuxtApp();
  
  try {
    const session = localStorage.getItem('woocommerce-session');

    if (!session) {
      const response = await $graphql.default.rawRequest(query, variables);
      const newSession = response.headers.get('woocommerce-session');
      if (newSession) {
        localStorage.setItem('woocommerce-session', `Session ${newSession}`);
      }
      return response.data;
    }

    return await $graphql.default.request(query, variables, { 'woocommerce-session': session });
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  }
}

export function fetchGraphQL(query, variables) {
  const hash = ohash([query, variables]);
  const state = useState(hash, () => null);
  const cacheEntry = promiseCache.get(hash);

  if (cacheEntry) {
    const isStale = Date.now() - cacheEntry.timestamp >= 2000 * 60 * 60;

    if (!isStale) {
      _fetchGraphQL(query, variables)
        .then(res => {
          if (JSON.stringify(res) !== JSON.stringify(cacheEntry.data)) {
            state.value = res;
            promiseCache.set(hash, { data: Promise.resolve(res), timestamp: Date.now() });
          }
        })
        .catch(e => {
          console.error('Error while revalidating:', e);
          // Don't throw here as this is just a background refresh
        });

      return cacheEntry.data;
    }
  }

  const fetchPromise = _fetchGraphQL(query, variables)
    .then(res => {
      if (!res) {
        throw new Error('No data returned from GraphQL request');
      }
      state.value = res;
      promiseCache.set(hash, { data: Promise.resolve(res), timestamp: Date.now() });
      return res;
    })
    .catch(e => {
      console.error('Error fetching data:', e);
      promiseCache.delete(hash);
      throw e;
    });

  promiseCache.set(hash, { data: fetchPromise, timestamp: Date.now() });
  return fetchPromise;
}

//Query functions

export function listProducts(variables) {
  return fetchGraphQL(getProductsQuery, variables);
}

export function listCategories() {
  return fetchGraphQL(getCategoriesQuery);
}

export function searchProducts(search) {
  return fetchGraphQL(getSearchProductsQuery, { search });
}

export async function getProduct(slug) {
  if (!slug) {
    throw new Error('Product slug is required');
  }
  return fetchGraphQL(getProductQuery, { slug });
}

//Mutation functions

async function fetchGraphQLMutation(query, variables = {}) {
  const { $graphql } = useNuxtApp();
  try {
    const session = localStorage.getItem('woocommerce-session');
    return await $graphql.default.request(query, variables, { 'woocommerce-session': session });
  } catch (error) {
    console.error('GraphQL mutation failed:', error);
    throw error;
  }
}

export function addToCart(input) {
  return fetchGraphQLMutation(addToCartMutation, input);
}

export function updateItemQuantities(input) {
  return fetchGraphQLMutation(updateItemQuantitiesMutation, { input });
}

export function checkout(input) {
  return fetchGraphQLMutation(checkoutMutation, { input });
}
