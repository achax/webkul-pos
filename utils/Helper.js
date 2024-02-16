import { toast } from 'react-toastify';
import { db } from '~/models';
import { getLocalStorage, STORE_CONFIG } from '~store/local-storage';
import { data } from '~utils/Reports';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import {
  AUTH_TOKEN,
  TAX_METHOD_ROW_TOTAL,
  TAX_METHOD_TOTAL_CALCULATION,
  TAX_METHOD_UNIT_BASE,
} from '~utils/Constants';
import { resetDatabase } from '~/models';
import Router from 'next/router';

/**
 * Toast Options
 */
export const toasterOptions = {
  position: 'bottom-center',
  autoClose: 2000,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  limit: 1,
};
export const toastProps = {
  theme: 'dark',
  toastStyle: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '14px',
  },
};
/**
 * Show Toast messages
 *
 * @param {{type: String, message: String}} param0
 */
export const showToast = ({ type = 'success', message }) => {
  try {
    if (message) {
      const toastId = toast[type](message, toasterOptions);
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 9393900);
    }
  } catch (e) {
    console.log(e.message);
  }
};
/**
 * string slice
 * default value len
 *
 */
export function textAdj(str, len) {
  let stringValue = str.toString();
  if (typeof len === 'boolean' && len === false) {
    return str;
  } else {
    return stringValue?.length > len ?? 35
      ? str.slice(0, len).concat('...')
      : stringValue;
  }
}
/**
 *
 * @param {Object} obj
 * @returns boolean
 */
export function isValidObject(obj) {
  return obj && Object.keys(obj).length > 0 && obj.constructor === Object;
}

/**
 * Check array is valid or not
 *
 * @param {Array} arr
 * @returns boolean
 */
export const isValidArray = (arr) => {
  return arr && Array.isArray(arr) && arr.length > 0;
};

/**
 * Get formatted Price.
 * @param {Float | String} price
 * @param {String} currency
 * @param {boolean} isNegative - default is false
 * @returns String
 */
export const getFormattedPrice = (
  price,
  currency = null,
  isNegative = false,
  isFreeTextReq = false
) => {
  if (!price) {
    if (isFreeTextReq) {
      return 'Free';
    }
    price = 0;
  }
  currency = currency || getCurrencyCode();
  price = typeof price === 'string' ? parseFloat(price) : price;
  price = isNegative ? -Math.abs(price) : price;
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency,
  });
};

/**
 * Get Currency code.
 *
 * @returns String
 */
export const getCurrencyCode = () => {
  let currency_code = getLocalStorage(STORE_CONFIG, true)?.default_display_currency_code;
  return currency_code ? currency_code : 'USD';
};

/**
 * Get the currency code symbol
 * @return currency symbol
 */

export const getCurrencySymbol = (currency_code) => {
  if (!currency_code) {
    const data = getLocalStorage(STORE_CONFIG, true);
    const locale = getFormattedLocale(data?.locale) || 'en-US';
    const currency = data?.default_display_currency_code || 'USD';

    let currency_symbol = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    })
      .formatToParts(1)
      .find((x) => x.type === 'currency').value;
    return currency_symbol;
  }
};

/**
 * For set item for addToCart
 * @param {object} data
 * @returns object
 */
export const selectedItem = (data) => {
  const selectedItem = data && {
    productId: data.entity_id
      ? data.entity_id
      : Math.floor(Date.now() + Math.random()),
    qty: data.min_sale_qty ? data.min_sale_qty : 1,
    // options: null,
    // displayOptions: null,

    options: null,
    displayOptions: null,
    price: data.price,
    max_allowed_qty: data.max_sale_qty ? data.max_sale_qty : 1000,
    min_allowed_qty: data.min_sale_qty ? data.min_sale_qty : 1,
    name: data.name,
    sku: data.sku,
    subtotal: data.price,
  };
  return selectedItem;
};

/**
 * For set item for addToCart
 * @param {object} data
 * @returns object
 */
export const selectedCustomItem = (
  data,
  taxRate,
  productTaxCalc,
  taxableProductId
) => {
  const selectedItem = data && {
    productId: data.entity_id
      ? data.entity_id
      : Math.floor(Date.now() + Math.random()),
    qty: data.quantity ? parseFloat(data?.quantity) : 1,
    price: data.price,
    max_allowed_qty: data.max_sale_qty ? data.max_sale_qty : 1000,
    min_allowed_qty: data.min_sale_qty ? data.min_sale_qty : 1,
    name: data.name,
    subtotal: data.price,
    note: data.note,
    custom_product: true,
    taxRate: taxRate,
    calculationRule: productTaxCalc,
    sku: `${data?.name}`,
    isProductTaxable: false,
    taxableProductId: taxableProductId,
  };
  return selectedItem;
};

export const setOrderInvoice = (orderData) => {
  const orderItem = {
    order_id: orderData.pos_order_id,
    date: orderData.date,
    status: orderData.status,
    customer: orderData.customer,
    item: orderData.items,
    grandtotal_discount: orderData.grandtotal_discount,
    coupon_code: isValidObject(orderData.coupon_info?.[0])
      ? orderData?.coupon_info?.[0]
      : {},
    discount: orderData?.discount ? orderData?.discount : 0,
    tax: orderData.tax,
    grandDiscountAmt: orderData?.grandtotal_discount,
    cash_received: orderData.cash_received,
    cash_returned: orderData.cash_returned,
    grand_total: orderData.grand_total,
    increment_id: orderData.increment_id,
    subTotal: orderData?.base_sub_total
      ? orderData?.base_sub_total
      : orderData?.sub_total
        ? orderData?.sub_total
        : 0,
    payment_info_data: orderData.payment_info_data,
  };

  return orderItem;
};

export function setTransactionData(orderData, totalPayable, date) {
  try {
    const transactionData = {
      posOrderId: orderData?.pos_order_id ? orderData?.pos_order_id : '',
      incrementId: orderData?.increment_id ? orderData?.increment_id : '',
      cashReceived: orderData.cash_received ? orderData?.cash_received : 0,
      cashReturned: orderData.cash_returned ? orderData.cash_returned : 0,
      currencyCode: orderData.currency_code
        ? orderData.currency_code
        : getCurrencyCode(),
      balance: orderData.cash_returned ? orderData?.cash_returned : 0,
      payment_info_data: orderData?.payment_info_data
        ? orderData?.payment_info_data
        : '',
      grand_total: totalPayable ? totalPayable : 0,
      date: getTodayDate(true),
      is_synced: 0,
    };
    return transactionData;
  } catch (err) {
    showToast({ type: 'error', message: err.message });
  }
}

/**
 * check for valid string
 * @param {String} data
 */

export const isValidString = (data) => {
  return (data !== null || data !== undefined) && data;
};

/**
 * @param number
 * @returns fixed number after two decimal points
 */
export const decimalTrim = (num , decimalPoint=2)=>{
  return (num %2 ===0 )?num : parseFloat(num).toFixed(decimalPoint)
}
/**
 * @param {dateParams} date
 * @param {withTime} boolean
 * @returns date
 */


export const getFormattedDate = (
  dateParams,
  withTime = true,
  format = 'en-us'
) => {
  if (format === 'en-us') {
    const date = new Date(dateParams).toLocaleDateString(format, {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const time = getFormattedTime(dateParams);
    return `${date} ${withTime ? `: ${time}` : ''}`;
  }

  if (format === 'YYYY-DD-MM') {
    const date = `${dateParams.getFullYear()}-${dateParams.getMonth() + 1
      }-${dateParams.getDate()}`;

    return withTime
      ? date.concat(
        ` ${dateParams.getHours()}:${dateParams.getMinutes()}:${dateParams.getSeconds()}`
      )
      : date;
  }
};

/**
 * @params {String} data
 * @return {Object} object;
 */
export const convertIntoParse = (data) => {
  return isValidString(data) && isValidJson(data) && JSON.parse(data);
};

/**
 * @params {String} data
 * @returns {Boolean} valid amount;
 */

export const isValidAmount = (amount) => {
  return isValidString(amount) && amount == '0'
    ? false
    : amount == '00'
      ? false
      : amount == '.'
        ? false
        : true;
};

/**
 * @params {String} data
 * @params {Int} length
 * @returns {String} result
 */

export const getFormattedText = (data, length) => {
  return isValidString(data) && data.length > length
    ? data.slice(0, length).concat('...')
    : data;
};

/**
 *
 * @param {String} time
 * @returns {time} strTime
 */

export const getFormattedTime = (time) => {
  let date = new Date(time);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
};

/**
 * Check Valid JSON
 * @params {String} str
 * @return {Boolean} validJSON
 */

export const isValidJson = (str) => {
  if (/^\s*$/.test(str)) return false;
  str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
  str = str.replace(
    /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
    ']'
  );
  str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
  return /^[\],:{}\s]*$/.test(str);
};

/**
 * Clear the Indexed tables for resync process
 * We used generator for manage the clear table method.
 */

export async function* clearTableFromReSync() {
  yield await db.categories.clear();
  yield await db.storeConfig.clear();
  yield await db.products.clear();
  yield await db.coupons.clear();
  yield await db.customer.clear();
}

/**
 * @params {Int} price
 * @params {Int} discount
 * @params {String} type
 * @return {Int} totalValue
 */

export const calculateDiscount = (price, discount, type) => {
  let totalVal =
    type == '%'
      ? parseFloat(price) - (parseFloat(price) * parseFloat(discount)) / 100
      : parseFloat(price) - parseFloat(discount);
  return totalVal;
};

/**
 * check category is available
 * @param String str
 * @param Int val
 * @returns Boolean result;
 */

export const checkCategoryAvailable = (str, val) => {
  let category = isValidString(str) && str.split(',');
  let result = category.find((item) => item == val);
  return result ? true : false;
};

/**
 * Method for getting today date.
 * @returns {Date} date
 */

export const getTodayDate = (withTime = false) => {
  const currentDate = new Date();
  return getFormattedDate(currentDate, withTime, 'YYYY-DD-MM');
};

/**
 * @params {String} date
 * @returns {Date} date
 */

export const getDate = (date) => {
  return new Date(date).toLocaleDateString('en-US');
};

/**
 * Function for getting latest cashDrawer from the list of cashDrawers.
 * @param {Array} cashDrawer
 * @returns {Array} latestCashDrawer
 */

export const getTodayCashDrawer = (cashDrawer) => {
  if (isValidArray(cashDrawer)) {
    let todayCashDrawer = cashDrawer.find(
      (item) => getDate(item?.created_at) == getDate(new Date())
    );
    return isValidObject(todayCashDrawer) ? todayCashDrawer : null;
  }
};

export const getTodayClosedCashDrawer = (cashDrawer) => {
  if (isValidArray(cashDrawer)) {
    let todayClosedCashDrawer = cashDrawer?.find(
      (item) =>
        getDate(item?.created_at) == getDate(new Date()) &&
        getDate(item?.closed_at) == getDate(new Date()) &&
        item?.status
    );
    return isValidObject(todayClosedCashDrawer) ? todayClosedCashDrawer : null;
  }
};

/**
 *
 * @param {Int} id
 * @param {Array} cashDrawer
 * @returns {Int} index;
 */

export const getIndexofLatestCashDrawer = (id, cashDrawer) => {
  return (
    isValidArray(cashDrawer) && cashDrawer.findIndex((item) => item.id == id)
  );
};

/**
 * Day Type Array
 */

export const dayArr = [
  ['11:00 AM', 0],
  ['2:00 PM', 0],
  ['5:00 PM', 0],
  ['8:00 PM', 0],
  ['11:00 PM', 0],
  ['2:00 AM', 0],
  ['5:00 AM', 0],
  ['8:00 AM', 0],
];

/**
 * Day Type Array in standard format
 */

export const dayStandardArr = [
  ['11:00', 0],
  ['14:00', 0],
  ['17:00', 0],
  ['21:00', 0],
  ['23:00', 0],
  ['2:00', 0],
  ['5:00', 0],
  ['8:00', 0],
];

/**
 *
 * @param {Array} statsData
 * @return {Array} stats;
 */

export const getStatsTypeFormattedData = (
  statsData,
  type,
  typeofActiveTab = 'month'
) => {
  let stats = [];
  let xAxis = [];
  xAxis[0] = ['x', type];

  if (typeofActiveTab === 'day') {
    if (isValidArray(statsData)) {
      for (let i = 0; i < statsData.length - 1; i++) {
        if (dayArr?.[i]?.[0]) {
          stats[i] = [dayArr[i][0], statsData[i].values];
        }
      }
    }
  } else {
    if (isValidArray(statsData)) {
      for (let i = 0; i < statsData.length; i++) {
        stats[i] = [
          getFormattedDate(new Date(statsData[i].label), false, 'YYYY-DD-MM'),
          statsData[i].values,
        ];
      }
    }
  }

  return stats.length >= 1 ? [...xAxis, ...stats] : data;
};

/**
 * Manage hAxis and vAxis name in Chart.
 * @param {String} hAxis
 * @param {String} vAxis
 * @returns
 */

export const getOptions = (hAxis, vAxis) => {
  return {
    hAxis: {
      format: 'long',
      title: vAxis,
    },
    vAxis: {
      format: 'long',
      title: hAxis,
    },
    yAxis: {
      format: 'long',
      title: hAxis,
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true,
    },
    annotations: {
      textStyle: {
        fontName: 'Times-Roman',
        fontSize: 18,
        bold: true,
        italic: false,
        // The color of the text.
        color: '#871b47',
        // The color of the text outline.
        auraColor: '#d799ae',
        // The transparency of the text.
        opacity: 0.8,
      },
    },
    curveType: 'function',
    legend: { position: 'top' },
    scrollwheel: true,
  };
};

/**
 *
 * @param {Array} arr
 * @param {Int} rows
 * @returns {Array}
 */

export const splitArray = (arr, rows) => {
  const itemsPerRow = Math.ceil(arr.length / rows);
  return arr.reduce((acc, val, ind) => {
    const currentRow = Math.floor(ind / itemsPerRow);
    if (!acc[currentRow]) {
      acc[currentRow] = [val];
    } else {
      acc[currentRow].push(val);
    }
    return acc;
  }, []);
};

/**
 *
 * @param {Integer} grossRevenue
 * @param {Integer} returns
 * @param {Integer} allowances
 * @returns netRevenue
 */

export const getNetRevenue = (grossRevenue, discount, coupon) => {
  return parseFloat(grossRevenue) - parseFloat(discount) + parseFloat(coupon);
};

/**
 * Manage the current Time Index
 * @param {date} currentTime
 */

export const getCurrentTimeIndex = () => {
  const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
  let time;

  if (isValidArray(dayStandardArr)) {
    for (let i = 0; i < dayStandardArr.length - 1; i++) {
      for (let j = i + 1; j < dayStandardArr.length - 1; j++) {
        if (
          currentTime > parseInt(dayStandardArr[i][0]) * 60 &&
          currentTime < parseInt(dayStandardArr[j][0]) * 60
        ) {
          time = { time: dayStandardArr[i], index: i };
        }
      }
    }
  }

  return time ? time : { time: dayStandardArr[0], index: 0 };
};

/**
 * Manage the format of locale into standard format
 * @param {String} locale
 * @returns locale;
 */

export const getFormattedLocale = (locale) => {
  const splitLocale = isValidString(locale) && locale.split('_');
  if (isValidArray(splitLocale)) {
    return `${splitLocale[0]}-${splitLocale[1]}`;
  }
  return `en-US`;
};

/**
 *
 * @param {Object} data
 * @param {Object} orderData
 * @param {String} time
 * @returns {dayReport}
 */

export const getDayReport = (data, orderData, time) => {
  let dayReport = data;

  dayReport.grossRevenueTotal =
    parseFloat(dayReport?.grossRevenueTotal) +
    parseFloat(orderData?.grand_total);

  dayReport.grossRevenue[time?.index]['values'] =
    parseFloat(dayReport.grossRevenue[time?.index]['values']) +
    parseFloat(orderData?.grand_total);

  dayReport.netRevenueTotal =
    parseFloat(dayReport.netRevenueTotal) +
    getNetRevenue(
      orderData.grand_total,
      orderData?.discount,
      isValidArray(orderData?.coupon_code) &&
        orderData?.coupon_info[0]?.discount_amount
        ? orderData?.coupon_info[0]?.discount_amount
        : 0
    );

  dayReport.netRevenue[time?.index]['values'] =
    parseFloat(dayReport.netRevenue[time?.index]['values']) +
    getNetRevenue(
      orderData.grand_total,
      orderData?.discount,
      isValidArray(orderData?.coupon_code) &&
        orderData?.coupon_info[0]?.discount_amount
        ? orderData?.coupon_info[0]?.discount_amount
        : 0
    );

  dayReport.totalOrder = dayReport?.totalOrder + 1;
  dayReport.orderData[time?.index]['values'] =
    dayReport.orderData[time?.index]['values'] + 1;

  dayReport.averageItemOrder = dayReport.averageItemOrder + 1;
  dayReport.averageItemPerOrder[time?.index]['values'] =
    dayReport.averageItemPerOrder[time?.index]['values'] + 1;

  dayReport.totalDiscountedOffer =
    parseFloat(dayReport.totalDiscountedOffer) +
    parseFloat(orderData?.discount) +
    parseFloat(
      isValidArray(orderData?.coupon_code) &&
        orderData?.coupon_code[0]?.discount_amount
        ? orderData?.coupon_code[0]?.discount_amount
        : 0
    );

  dayReport.discountedOffers[time?.index]['values'] =
    dayReport.discountedOffers[time?.index]['values'] +
    parseFloat(orderData?.discount) +
    parseFloat(
      isValidArray(orderData?.coupon_code) &&
        orderData?.coupon_code[0]?.discount_amount
        ? orderData?.coupon_code[0]?.discount_amount
        : 0
    );

  dayReport.averageOrder =
    parseFloat(dayReport.grossRevenueTotal) / parseFloat(dayReport.totalOrder);

  dayReport.averageOrderValue[time?.index]['values'] =
    (parseFloat(dayReport.averageOrderValue[time?.index]['values']) +
      parseFloat(orderData?.grand_total)) /
    parseFloat(1);

  return dayReport;
};

/**
 * Manage the month report
 * @param {Object} monthReport
 * @param {Object} orderData
 */

export const getMonthReport = (data, orderData) => {
  let monthReport = data;

  monthReport.grossRevenueTotal =
    parseFloat(monthReport?.grossRevenueTotal) +
    parseFloat(orderData?.grand_total);

  monthReport.grossRevenue[monthReport.grossRevenue.length - 1]['values'] =
    parseFloat(
      monthReport.grossRevenue[monthReport.grossRevenue.length - 1]['values']
    ) + parseFloat(orderData?.grand_total);

  monthReport.netRevenueTotal =
    parseFloat(monthReport?.netRevenueTotal) +
    getNetRevenue(
      orderData.grand_total,
      orderData?.discount,
      isValidArray(orderData?.coupon_code) &&
        orderData?.coupon_info[0]?.discount_amount
        ? orderData?.coupon_info[0]?.discount_amount
        : 0
    );

  monthReport.netRevenue[monthReport.netRevenue.length - 1]['values'] =
    parseFloat(
      monthReport.netRevenue[monthReport.netRevenue.length - 1]['values']
    ) +
    getNetRevenue(
      orderData?.grand_total,
      orderData?.discount,
      isValidArray(orderData?.coupon_code) &&
        orderData?.coupon_info[0]?.discount_amount
        ? orderData?.coupon_info[0]?.discount_amount
        : 0
    );

  monthReport.totalOrder = parseFloat(monthReport?.totalOrder) + 1;

  monthReport.orderData[monthReport.orderData.length - 1]['values'] =
    parseFloat(
      monthReport.orderData[monthReport.orderData.length - 1]['values']
    ) + 1;

  monthReport.averageItemOrder = parseFloat(monthReport.averageItemOrder) + 1;
  monthReport.averageItemPerOrder[monthReport.averageItemPerOrder.length - 1][
    'values'
  ] =
    parseFloat(
      monthReport.averageItemPerOrder[
      monthReport.averageItemPerOrder.length - 1
      ]['values']
    ) + 1;

  monthReport.totalDiscountedOffer =
    parseFloat(monthReport.totalDiscountedOffer) +
    parseFloat(orderData?.discount) +
    parseFloat(
      isValidArray(orderData?.coupon_code) &&
        orderData?.coupon_code[0]?.discount_amount
        ? orderData?.coupon_code[0]?.discount_amount
        : 0
    );

  monthReport.discountedOffers[monthReport.discountedOffers.length - 1][
    'values'
  ] =
    parseFloat(
      monthReport.discountedOffers[monthReport.discountedOffers.length - 1][
      'values'
      ]
    ) +
    (parseFloat(orderData?.discount) +
      parseFloat(
        isValidArray(orderData?.coupon_code) &&
          orderData?.coupon_code[0]?.discount_amount
          ? orderData?.coupon_code[0]?.discount_amount
          : 0
      ));

  monthReport.averageOrder =
    parseFloat(monthReport.averageOrder) +
    parseFloat(monthReport.grossRevenueTotal) /
    parseFloat(monthReport.totalOrder);

  monthReport.averageOrderValue[monthReport.averageOrderValue.length - 1][
    'values'
  ] = parseFloat(
    monthReport.averageOrderValue[monthReport.averageOrderValue.length - 1][
    'values'
    ] +
    parseFloat(orderData?.grand_total) / parseFloat(monthReport.totalOrder)
  );

  return monthReport;
};

/**
 * Manage the week Report
 * @param {Object} data
 * @param {Object} orderData
 * @returns weekReport
 */

export const getWeekReport = (data, orderData) => {
  let weekReport = data;

  weekReport.grossRevenueTotal =
    parseFloat(weekReport?.grossRevenueTotal) +
    parseFloat(orderData?.grand_total);

  weekReport.grossRevenue[weekReport.grossRevenue.length - 1]['values'] =
    parseFloat(
      weekReport.grossRevenue[weekReport.grossRevenue.length - 1]['values']
    ) + parseFloat(orderData?.grand_total);

  weekReport.netRevenueTotal =
    parseFloat(weekReport?.netRevenueTotal) +
    getNetRevenue(
      weekReport.grand_total,
      orderData?.discount,
      isValidArray(orderData?.coupon_code) &&
        orderData?.coupon_info[0]?.discount_amount
        ? orderData?.coupon_info[0]?.discount_amount
        : 0
    );

  weekReport.netRevenue[weekReport.netRevenue.length - 1]['values'] =
    parseFloat(
      weekReport.netRevenue[weekReport.netRevenue.length - 1]['values']
    ) +
    getNetRevenue(
      orderData?.grand_total,
      orderData?.discount,
      isValidArray(orderData?.coupon_code) &&
        orderData?.coupon_info[0]?.discount_amount
        ? orderData?.coupon_info[0]?.discount_amount
        : 0
    );

  weekReport.totalOrder = parseFloat(weekReport?.totalOrder) + 1;

  weekReport.orderData[weekReport.orderData.length - 1]['values'] =
    parseFloat(
      weekReport.orderData[weekReport.orderData.length - 1]['values']
    ) + 1;

  weekReport.averageItemOrder = parseFloat(weekReport.averageItemOrder) + 1;
  weekReport.averageItemPerOrder[weekReport.averageItemPerOrder.length - 1][
    'values'
  ] =
    parseFloat(
      weekReport.averageItemPerOrder[weekReport.averageItemPerOrder.length - 1][
      'values'
      ]
    ) + 1;

  weekReport.totalDiscountedOffer =
    parseFloat(weekReport.totalDiscountedOffer) +
    (parseFloat(orderData?.discount) +
      parseFloat(
        isValidArray(orderData?.coupon_code) &&
          orderData?.coupon_code[0]?.discount_amount
          ? orderData?.coupon_code[0]?.discount_amount
          : 0
      ));

  weekReport.discountedOffers[weekReport.discountedOffers.length - 1][
    'values'
  ] =
    parseFloat(
      weekReport.discountedOffers[weekReport.discountedOffers.length - 1][
      'values'
      ]
    ) +
    (parseFloat(orderData?.discount) +
      parseFloat(
        isValidArray(orderData?.coupon_code) &&
          orderData?.coupon_code[0]?.discount_amount
          ? orderData?.coupon_code[0]?.discount_amount
          : 0
      ));

  weekReport.averageOrder =
    parseFloat(weekReport.averageOrder) +
    parseFloat(weekReport.grossRevenueTotal) /
    parseFloat(weekReport.totalOrder);

  weekReport.averageOrderValue[weekReport.averageOrderValue.length - 1][
    'values'
  ] = parseFloat(
    weekReport.averageOrderValue[weekReport.averageOrderValue.length - 1][
    'values'
    ] +
    parseFloat(orderData?.grand_total) / parseFloat(weekReport.totalOrder)
  );

  return weekReport;
};

/**
 * Manage the week Report for New Day
 * @param {Object} data
 * @param {Object} orderData
 * @returns weekReport
 */

export const getWeekReportOfNewDay = (data, orderData) => {
  const weekReport = data;

  weekReport.grossRevenueTotal = orderData?.grand_total;

  weekReport.grossRevenue = [
    ...weekReport.grossRevenue,
    [
      {
        label: getTodayDate(),
        values: orderData?.grand_total,
        __typename: 'PosReportData',
      },
    ],
  ];

  weekReport.netRevenueTotal = getNetRevenue(
    orderData?.grand_total,
    orderData?.discount,
    isValidArray(orderData?.coupon_code) &&
      orderData?.coupon_info[0]?.discount_amount
      ? orderData?.coupon_info[0]?.discount_amount
      : 0
  );

  weekReport.netRevenue[weekReport.netRevenue.length - 1]['values'] = [
    ...weekReport.netRevenue,
    [
      {
        label: getTodayDate(),
        values: getNetRevenue(
          weekReport.grand_total,
          orderData?.discount,
          isValidArray(orderData?.coupon_code) &&
            orderData?.coupon_info[0]?.discount_amount
            ? orderData?.coupon_info[0]?.discount_amount
            : 0
        ),
        __typename: 'PosReportData',
      },
    ],
  ];

  weekReport.totalOrder = 1;

  weekReport.orderData = [
    ...weekReport.orderData,
    [
      {
        label: getTodayDate(),
        values: weekReport.totalOrder,
        __typename: 'PosReportData',
      },
    ],
  ];

  weekReport.averageItemOrder = parseFloat(weekReport.averageItemOrder) + 1;

  weekReport.averageItemPerOrder = [
    ...weekReport.averageItemPerOrder,
    [
      {
        label: getTodayDate(),
        values: weekReport.averageItemOrder,
        __typename: 'PosReportData',
      },
    ],
  ];

  weekReport.totalDiscountedOffer =
    parseFloat(orderData?.discount) +
    parseFloat(
      isValidArray(orderData?.coupon_code) &&
        orderData?.coupon_code[0]?.discount_amount
        ? orderData?.coupon_code[0]?.discount_amount
        : 0
    );

  weekReport.discountedOffers = [
    ...weekReport.discountedOffers,
    [
      {
        label: getTodayDate(),
        values: weekReport.totalDiscountedOffer,
        __typename: 'PosReportData',
      },
    ],
  ];

  weekReport.averageOrder =
    parseFloat(weekReport.grossRevenue) / parseFloat(weekReport.totalOrder);

  weekReport.averageOrderValue = [
    ...weekReport.averageOrderValue,
    [
      {
        label: getTodayDate(),
        values: weekReport.averageOrder,
        __typename: 'PosReportData',
      },
    ],
  ];

  return weekReport;
};

/**
 * Manage the month report for new day.
 * @param {Object} monthReport
 * @param {Object} orderData
 * @param Object*} weekReport
 */

export const getMonthReportOfNewDay = (day, orderData, weekReport) => {
  const monthReport = day;

  monthReport.grossRevenueTotal = weekReport?.grossRevenueTotal;

  monthReport.grossRevenue = [
    ...monthReport.grossRevenue,
    [
      {
        label: getTodayDate(),
        values: orderData?.grand_total,
        __typename: 'PosReportData',
      },
    ],
  ];

  monthReport.netRevenueTotal = weekReport.netRevenueTotal;

  monthReport.netRevenue[monthReport.netRevenue.length - 1]['values'] = [
    ...monthReport.netRevenue,
    [
      {
        label: getTodayDate(),
        values: monthReport.netRevenueTotal,
        __typename: 'PosReportData',
      },
    ],
  ];

  monthReport.totalOrder = weekReport?.totalOrder;
  monthReport.orderData = [
    ...monthReport.orderData,
    [
      {
        label: getTodayDate(),
        values: monthReport.totalOrder,
        __typename: 'PosReportData',
      },
    ],
  ];

  monthReport.averageItemOrder = parseFloat(monthReport.averageItemOrder) + 1;

  monthReport.averageItemPerOrder = [
    ...monthReport.averageItemPerOrder,
    [
      {
        label: getTodayDate(),
        values: monthReport.averageItemOrder,
        __typename: 'PosReportData',
      },
    ],
  ];

  monthReport.totalDiscountedOffer = weekReport?.totalDiscountedOffer;
  monthReport.discountedOffers = [
    ...monthReport.discountedOffers,
    [
      {
        label: getTodayDate(),
        values: monthReport.totalDiscountedOffer,
        __typename: 'PosReportData',
      },
    ],
  ];

  monthReport.averageOrder = weekReport?.averageOrder;

  monthReport.averageOrderValue = [
    ...monthReport.averageOrderValue,
    [
      {
        label: getTodayDate(),
        values: monthReport.averageOrder,
        __typename: 'PosReportData',
      },
    ],
  ];

  return monthReport;
};

/**
 *
 * @param {String} data
 * @returns {Number}
 */

export const getConvertToNumber = (data) => {
  return isValidString(data) ? parseFloat(data) : parseFloat(0);
};

/**
 * @param {Object} item
 * @returns formattedOrderList
 */
export const getFormattedOrderList = (item) => {
  let orderData = {
    date: getFormattedDate(new Date(), true, 'YYYY-DD-MM'),
    items:
      isValidArray(item?.items) &&
      item?.items.map((item) => ({
        discount: item?.discount,
        discount_type: item?.discount_type,
        displayOption: item?.displayOption,
        name: item?.name,
        pos_custom_option: item?.pos_custom_option,
        price: item?.price,
        product_type: item?.product_type,
        qty: item?.qty,
        sku: item?.sku,
        selectedProductSku: item?.selectedProductSku,
        product_option: isValidArray(
          item?.product_option?.extension_attributes?.custom_options
        )
          ? {
            extension_attributes: {
              custom_options:
                isValidArray(
                  item?.product_option?.extension_attributes?.custom_options
                ) &&
                item?.product_option?.extension_attributes?.custom_options?.map(
                  ({ __typename, ...item }) => {
                    return item;
                  }
                ),
            },
          }
          : null,
      })),

    message: isValidString(item?.message) ? item?.message : '',
    billing_address: {
      use_for_shipping: true,
      same_as_shipping: true,
    },

    customer: {
      id: item?.customer && item?.customer?.id,
      firstname: item?.customer && item?.customer?.firstname,
      lastname: item?.customer && item?.customer.lastname,
      phone_no: item?.customer && item?.customer?.phone_no,
    },
    cashier_name: item?.cashier_name,
    pos_order_id: item?.pos_order_id,
    payment_code: 'poscash',
    payment_label: 'Pos Cash Payment',
    cash_received: item?.cash_received,
    cash_returned: item?.cash_returned,
    base_cash_received: item?.cash_received,
    base_cash_returned: item?.cash_returned,
    cashdrawer_id: '1',
    synchronized: 1,
    is_new_customer: 0,
    currency_code: getCurrencyCode(),
    is_split_payment: '0',
    coupon_info: item?.coupon_info,
    payment_info_data: item?.payment_info_data,
    discount: item?.discount,
    grand_total: item?.grand_total,
    grandtotal_discount: item?.grandtotal_discount,
    state: 'Complete',
    status: 'Complete',
    increment_id: null,
  };

  return orderData;
};

/**
 * @param {Object} item
 * @return {Object} formatted holdOrderData
 */

export const getHoldOrder = (item) => {
  const holdData = {
    date: item?.date,
    items: item?.items,
    note: item?.note,
    currency_code: 'null',
    grand_total: item?.grand_total,
    base_grand_total: item?.base_grand_total,
    cashier_id: item?.cashier_id,
    outlet_id: item?.outlet_id,
    synchronized: 1,
  };

  return holdData;
};

/**
 *
 * @param {Object} item
 * @param {Object} orderList
 * @returns cashDrawer
 */

export const getFormattedCashDrawer = (item, orderList) => {
  const cashDrawer = {
    date: item?.date,
    // transactions: item?.transactions,
    transactions: getSyncedTransactions(item?.transactions, orderList)
      ? getSyncedTransactions(item?.transactions, orderList)
      : [],
    initial_amount: item?.initial_amount,
    base_initial_amount: item?.base_initial_amount,
    remaining_amount: item?.remaining_amount,
    base_remaining_amount: item?.base_remaining_amount,
    currency_code: item?.currency_code,
    created_at: item?.date,
    is_synced: 1,
    closed_at:
      item?.date &&
        item?.date == getFormattedDate(new Date(), false, 'YYYY-DD-MM')
        ? ''
        : item?.closed_at,
    note: item?.note !== null ? item?.note : '',
    status:
      item?.date &&
        item?.date != getFormattedDate(new Date(), false, 'YYYY-DD-MM')
        ? true
        : false,
  };
  return cashDrawer;
};

/**
 *
 * @param {String} key
 * @returns
 */
export const getAppCookie = (key) => {
  let data = getCookie(key);

  if (data) {
    return data;
  }
};
/**
 * ecvent throttling 
 * @params 
 *
 */
export const EventThrottling =(callback, delay)=> {
  let lastCallTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCallTime >= delay) {
      callback(...args);
      lastCallTime = now;
    }
  };
}
/**
 *
 * @param {key} key
 * @param {String} data
 */

export const setAppCookie = (key, data) => {
  if (data) {
    setCookie(key, data);
  }
};

/**
 * Getting the Tax Rate associate with the Store
 * @param {Array} taxRateList
 * @param {Array} storeData
 * @returns {Object} storeTaxRate
 */

export const getStoreTaxRate = (taxRateList, storeData) => {
  if (isValidArray(taxRateList) && isValidArray(storeData)) {
    const taxRateOnCountry = taxRateList?.filter(
      (item) =>
        item?.tax_country_id == storeData[0]?.country_id &&
        item?.tax_region_id == storeData[0]?.region_id
    );

    let taxRateOnPostCode = [];

    if (isValidArray(taxRateOnCountry)) {
      for (let i = 0; i < taxRateOnCountry.length; i++) {
        if (taxRateOnCountry[i]?.tax_postcode == '*') {
          taxRateOnPostCode.push({ ...taxRateOnCountry[i], priority: 0 });
        } else if (
          !taxRateOnCountry[i]?.tax_postcode.includes('-') &&
          taxRateOnCountry[i]?.tax_postcode != '*'
        ) {
          let isPostCodeExit =
            parseFloat(taxRateOnCountry[i]?.tax_postcode) ==
              parseFloat(storeData[0]?.postcode)
              ? true
              : false;

          isPostCodeExit &&
            taxRateOnPostCode.push({ ...taxRateOnCountry[i], priority: 1 });
        } else {
          let postCode = taxRateOnCountry[i]?.tax_postcode
            ? taxRateOnCountry[i]?.tax_postcode.split('-')
            : false;

          let isPostCodeExit =
            isValidArray(postCode) &&
              parseFloat(postCode[0]) <= parseFloat(storeData[0]?.postcode) &&
              parseFloat(postCode[1]) >= parseFloat(storeData[0]?.postcode)
              ? true
              : false;

          isPostCodeExit &&
            taxRateOnPostCode.push({ ...taxRateOnCountry[i], priority: 3 });
        }
      }
    }

    const requiredTaxRate =
      isValidArray(taxRateOnPostCode) &&
      taxRateOnPostCode.reduce(function (prev, current) {
        return prev.priority > current.priority ? prev : current;
      });

    return requiredTaxRate;
  }
};

/**
 * Getting the associated Tax Rule of the Store
 * @param {Array} taxRuleList
 * @param {Object} taxRate
 * @returns {Object} TaxRule
 */

export const getStoreTaxRule = (taxRuleList, taxRate) => {
  if (isValidArray(taxRuleList)) {
    let isTaxRuleExists = taxRuleList.find((item) => {
      return item?.tax_rates.includes(taxRate?.tax_calculation_rate_id);
    });

    return isTaxRuleExists ? isTaxRuleExists : false;
  }
};

/**
 * Getting the Product Sub Total on basis of tax rate.
 * @param {Integer} productTaxCalc
 * @param {Integer} taxableProductId
 * @param {Float} value
 * @param {Number} rate
 * @param {Object} item
 * @returns {Float} subTotal
 */
export const getProductSubTotal = (
  productTaxCalc,
  taxableProductId,
  storeProductTaxClass,
  productId,
  value,
  rate
) => {
  return productTaxCalc == TAX_METHOD_UNIT_BASE &&
    taxableProductId == storeProductTaxClass &&
    taxableProductId == storeProductTaxClass
    ? parseFloat(value) + (parseFloat(rate) / 100) * parseFloat(value)
    : value;
};

/**
 * Getting the Applied Tax Value
 * @param {Float} value
 * @param {Number} rate
 * @returns
 */

export const getAppliedTaxValue = (value, rate) => {
  return value && rate ? (parseFloat(rate) / 100) * parseFloat(value) : value;
};

/**
 *
 * @param {Array} transactions
 * @param {Array} orderList
 * @returns update incrementId transactions
 */

export const getSyncedTransactions = (transactions, orderList) => {
  if (isValidArray(transactions)) {
    for (let i = 0; i <= transactions.length - 1; i++) {
      let data = orderList?.find(
        (item) => item?.pos_order_id == transactions[i]?.posOrderId
      );

      if (isValidObject(data)) transactions[i].incrementId = data?.increment_id;
    }
  }

  return transactions;
};

/**
 * Deleting the Cashier Access Token Cookie
 */

export const deleteAccessTokenCookie = () => {
  deleteCookie(AUTH_TOKEN);
};

/**
 * Reset the Pos-App.
 */

export const resetPosApp = () => {
  deleteAccessTokenCookie();
  resetDatabase();
  Router.replace('/login')
};

/**
 * Manage the discount value of the CartItems
 */

export const getDiscountValue = (discountType = '%', discountVal, price) => {
  if (discountType == '%') {
    let discount = (parseFloat(discountVal) / 100) * price;
    return discount;
  } else {
    let discount = parseFloat(discountVal);
    return discount;
  }
};

/**
 * Manage the subTotal After Tax.
 */

export const getSubTotalAfterTax = (calculationRule, taxRate, price) => {
  let tax =
    calculationRule == TAX_METHOD_UNIT_BASE
      ? (parseFloat(taxRate) / 100) * parseFloat(price)
      : 0;
  return parseFloat(price) + parseFloat(tax);
};

/**
 * Manage the Tax of the OrderItem.
 */

export const getTax = (calculationRule, taxRate, price) => {
  return calculationRule === TAX_METHOD_UNIT_BASE
    ? (parseFloat(taxRate) / 100) * parseFloat(price)
    : 0;
};

/**
 * Manage the Product Item after discount,tax.
 * @param {Object} couponCode
 * @param {Object} item
 * @param {Boolean} isProductTaxable
 * @returns
 */

export const getProductItemAmount = (couponCode, item, isProductTaxable) => {
  let couponAmt = 0;
  let tax = 0;
  let totalAmt = 0;
  if (isValidObject(couponCode)) {
    couponAmt = getCartCouponAmt(couponCode, item);
  }

  if (isProductTaxable) {
    tax =
      item?.calculationRule == TAX_METHOD_ROW_TOTAL
        ? parseFloat(
          (parseFloat(item?.taxRate) / 100) * parseFloat(item?.subtotal)
        )
        : parseFloat(
          (parseFloat(item?.taxRate) / 100) *
          parseFloat(item?.subtotal - couponAmt)
        );
  }

  let AmtAfterCoupon = parseFloat(item?.subtotal) - parseFloat(couponAmt);
  totalAmt = parseFloat(AmtAfterCoupon) + parseFloat(tax);
  return totalAmt;
};

/**
 * Manage the Coupon Amt of the Cart
 * @param {Object} couponCode
 * @param {Object} item
 * @returns
 */
export const decimalCounter = (num) => {
  const numStr = num.toString();
  return numStr.includes('.') ? numStr.split('.')[1].length : 0;
};
export const getCartCouponAmt = (couponCode, item) => {
  let couponAmt =
    couponCode?.simple_action === 'by_percent'
      ? parseFloat(
        (parseFloat(couponCode?.discount_amount) / 100) *
        parseFloat(item?.subtotal)
      )
      : parseFloat(couponCode?.discount_amount);
  return couponAmt > 0 ? parseFloat(couponAmt) : 0;
};

/**
 * Manage the Custom Cart Discount.
 * @param {String} discountType
 * @param {Float} discountAmt
 * @param {Float} subTotal
 * @returns
 */

export const getCustomCartDiscount = (discountType, discountAmt, subTotal) => {
  let discountVal = 0;
  if (discountType === '%') {
    discountVal = parseFloat(
      (parseFloat(discountAmt) / 100) * parseFloat(subTotal)
    );
  } else {
    discountVal = parseFloat(parseFloat(discountAmt));
  }
  return discountVal;
};

/**
 * Manage the CartTax Amount
 * @param {Object} item
 * @param {Object} couponAmt
 */

export const getCartTax = (item, coupons, isProductTaxable) => {
  let couponAmt = getCartCouponAmt(coupons, item);

  if (isValidObject(item)) {
    let tax =
      isProductTaxable && item?.calculationRule == TAX_METHOD_ROW_TOTAL
        ? parseFloat(
          (parseFloat(item?.taxRate) / 100) * parseFloat(item?.subtotal)
        )
        : item?.calculationRule == TAX_METHOD_TOTAL_CALCULATION &&
        isProductTaxable &&
        parseFloat(
          (parseFloat(item?.taxRate) / 100) *
          parseFloat(item?.subtotal - couponAmt)
        );

    return tax > 0 ? tax : 0;
  }
};
