export function formatDate(date: Date) {
  return new Intl.DateTimeFormat(navigator.language).format(date);
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat(navigator.language).format(number);
}

export function formatRelativeTimeDate(date: Date, locale?: string) {
  const now = new Date();
  const diffInSeconds = Math.floor(-(now.getTime() - date.getTime()) / 1000);

  const relativeTimeFormat = new Intl.RelativeTimeFormat(
    locale || navigator.language,
    {
      localeMatcher: "best fit",
      numeric: "auto",
      style: "long",
    },
  );

  if (Math.abs(diffInSeconds) < 60) {
    return relativeTimeFormat.format(diffInSeconds, "seconds");
  }
  if (Math.abs(diffInSeconds) < 3600) {
    return relativeTimeFormat.format(Math.round(diffInSeconds / 60), "minutes");
  }
  if (Math.abs(diffInSeconds) < 86400) {
    return relativeTimeFormat.format(Math.round(diffInSeconds / 3600), "hours");
  }

  return relativeTimeFormat.format(Math.round(diffInSeconds / 86400), "days");
}
