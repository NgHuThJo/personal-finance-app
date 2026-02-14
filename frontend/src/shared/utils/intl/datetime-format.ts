class DateTimeFormatter {
  formatDate({
    date,
    locale,
    options,
  }: {
    date: number | Date;
    locale?: Intl.LocalesArgument;
    options?: Intl.DateTimeFormatOptions;
  }) {
    return new Intl.DateTimeFormat(
      locale ?? navigator.language,
      options,
    ).format(date);
  }

  getDayOptions(): Intl.DateTimeFormatOptions {
    return {
      weekday: "short",
    };
  }

  getHourOptions(): Intl.DateTimeFormatOptions {
    return {
      hour: "numeric",
      hour12: true,
    };
  }
}

export const dateTimeFormatter = new DateTimeFormatter();
