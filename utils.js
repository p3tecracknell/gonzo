"use strict";

const currencyDefinitions = {
  GBP: {
    majorCurrencyUnit: amount => amount === 1 ? `pound` : `pounds`,
    minorCurrencyUnit: () => `pence`
  },
  EUR: {
    majorCurrencyUnit: amount => amount === 1 ? `euro` : `euros`,
    minorCurrencyUnit: amount => amount === 1 ? `cent` : `cents`
  },
  USD: {
    majorCurrencyUnit: amount => amount === 1 ? `dollar` : `dollars`,
    minorCurrencyUnit: amount => amount === 1 ? `cent` : `cents`
  }
};

const currencyToWords = (amount, currency) => {
  currency = currency || 'GBP';

  const amountParts = (amount / 100).toFixed(2).toString().split('.');

  const majorUnits = +amountParts[0];
  const minorUnits = +amountParts[1];

  const responseParts = [];
  const currencyDefinition = currencyDefinitions[currency];
  if (majorUnits !== 0 || minorUnits === 0) responseParts.push(`${majorUnits} ${currencyDefinition.majorCurrencyUnit(majorUnits)}`);
  if (minorUnits !== 0 || majorUnits === 0) responseParts.push(`${minorUnits} ${currencyDefinition.minorCurrencyUnit(minorUnits)}`);

  return responseParts.join(` and `);
};

module.exports.currencyToWords = currencyToWords;