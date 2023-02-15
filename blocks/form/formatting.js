const supportedUnits = ['month', 'year'].join('|');
const unitSkeleton = new RegExp(`^unit/(${supportedUnits})$`);
const formatters = {};
export default function formatNumber(num, format, language = 'en-US') {
  if (!formatters[language]) {
    formatters[language] = {};
  }
  const formatterCache = formatters[language];
  let formatter;
  if (/^currency(?:\/([a-zA-Z]{3}))?$/.test(format)) {
    const [style, currency] = format.split('/');
    if (!formatterCache?.currency?.[currency]) {
      formatterCache.currency = formatterCache.currency || {};
      formatterCache.currency[currency] = new Intl.NumberFormat(language, {
        style,
        currencyDisplay: 'narrowSymbol',
        currency,
      });
    }
    formatter = formatterCache.currency[currency];
  } else if (format === 'percent') {
    if (!formatterCache.percent) {
      formatterCache.percent = new Intl.NumberFormat(language, {
        style: format,
        maximumFractionDigits: 2,
      });
    }
    formatter = formatterCache.percent;
  } else if (unitSkeleton.test(format)) {
    const [style, unit] = format.split('/');
    if (!formatterCache?.unit?.[unit]) {
      formatterCache.unit = formatterCache.unit || {};
      formatterCache.unit[unit] = new Intl.NumberFormat(language, {
        style,
        unitDisplay: 'long',
        unit,
      });
    }
    formatter = formatterCache.unit[unit];
  }
  let formatValue = num;
  if (formatter) {
    formatValue = formatter.format(num);
  }
  return formatValue;
}
