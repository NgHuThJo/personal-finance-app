class NumberFormatter {
  formatNumber({
    number,
    locale,
    options,
  }: {
    number: number | bigint | Intl.StringNumericLiteral;
    locale?: Intl.LocalesArgument;
    options?: Intl.NumberFormatOptions;
  }) {
    return new Intl.NumberFormat(locale ?? navigator.language, options).format(
      number,
    );
  }

  getDollarOptions(): Intl.NumberFormatOptions {
    return {
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
    };
  }

  getPercentOptions(): Intl.NumberFormatOptions {
    return {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
  }
}

export const numberFormatter = new NumberFormatter();
