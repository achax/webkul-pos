import { useEffect, useState } from 'react';
import { db } from '~/models';
import {
  isValidArray,
  getStoreTaxRate,
  getStoreTaxRule,
  isValidObject,
} from '~utils/Helper';

export function usePosTax() {
  const [taxDetails, setTaxDetails] = useState({
    taxRate: {},
    taxRule: {},
  });

  const [taxRate, setTaxRate] = useState(0);
  const [ruleProductTaxClass, setRuleProductTaxClass] = useState('');
  const [ruleCustomerTaxClass, setRuleCustomerTaxClass] = useState('');

  const [storeProductTaxClass, setStoreProductTaxClass] = useState('');
  const [storeCustomerTaxClass, setStoreCustomerTaxClass] = useState();
  const [taxTitle, setTaxTitle] = useState('');

  /**
   * Tax Calculation of Product {Unit-Prices: 0, Row-Total:1, Total:2}
   * Tax Calculation of Customer {AfterDiscount: 1, beforeDiscount:0}
   */

  const [productCalculationMethod, setProductCalculationMethod] = useState();
  const [customerCalculationMethod, setCustomerCalculationMethod] = useState();

  useEffect(() => {
    const getAppliedTax = async () => {
      const taxRateList = await db.taxRateList.toArray();
      const taxRuleList = await db.taxRuleList.toArray();
      const storeData = await db.storeConfig.toArray();

      if (
        isValidArray(taxRateList) &&
        isValidArray(taxRuleList) &&
        isValidArray(storeData)
      ) {
        const storeTaxRate = getStoreTaxRate(taxRateList, storeData);
        const storeTaxRule = getStoreTaxRule(taxRuleList, storeTaxRate);

        setTaxRate(storeTaxRate?.rate);
        setTaxTitle(storeTaxRate?.title ? storeTaxRate?.title : '');
        setRuleProductTaxClass(storeTaxRule?.product_tax_classes?.[0]);
        setRuleCustomerTaxClass(storeTaxRule?.customer_tax_classes?.[0]);
        setTaxDetails({
          taxRate: isValidObject(storeTaxRate) ? storeTaxRate : false,
          taxRule: isValidObject(storeTaxRule) ? storeTaxRule : false,
        });
      }
    };

    const getStoreTaxClass = async () => {
      const store = await db.storeConfig.toArray();
      if (isValidObject(store[0])) {
        setStoreCustomerTaxClass(store[0]?.default_customer_tax_class);
        setStoreProductTaxClass(store[0]?.default_product_tax_class);
      }
    };

    const getTaxCalculationMethod = async () => {
      const store = await db.storeConfig.toArray();
      if (isValidObject(store[0])) {
        setProductCalculationMethod(store[0]?.tax_method);
        setCustomerCalculationMethod(store[0]?.apply_after_discount);
      }
    };

    getTaxCalculationMethod();
    getAppliedTax();
    getStoreTaxClass();
  }, []);

  return {
    taxDetails,
    taxRate,
    ruleProductTaxClass,
    ruleCustomerTaxClass,
    productCalculationMethod,
    customerCalculationMethod,
    storeProductTaxClass,
    taxTitle,
    storeCustomerTaxClass,
  };
}
