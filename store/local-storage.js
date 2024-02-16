import { isValidObject, isValidArray } from '~/utils/Helper';

export const CART_DATA = 'cart_data';
export const CASHIER_LOGIN_STORE_KEY = 'STORE_KEY';
/**
 * Default local storage key for store data
 */
export const STORE_CONFIG = 'STORE_CONFIG';

/**
 * Set Local Storage
 *
 * @param {String} Key
 * @param {String|array|Object|int} Data
 *
 * @return void
 */
export function setLocalStorage(key, data) {
  if (typeof window !== 'undefined') {
    if (isValidArray(data) || isValidObject(data)) {
      data = JSON.stringify(data);
    }
    localStorage.setItem(key, data);
  }
}

/**
 * Get Data from Local Storage.
 *
 * @param {String} key
 * @param {boolean} needParsedData - To Parse Stringfy Data
 * @returns String | array | null | Object
 */
export function getLocalStorage(key, needParsedData = false) {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(key);
    if (!data || typeof data === 'undefined') return null;
    if (needParsedData) return JSON.parse(data);
    return data;
  }
}

/**
 * ! To remove the local storage
 * @param {String} storageKey
 */
export function removeFromLocalStorage(storageKey) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(storageKey);
  }
}

/**
 * ! To Remove cart related storage.
 */
export function resetCartStorage() {
  removeFromLocalStorage(CART_DATA);
}
