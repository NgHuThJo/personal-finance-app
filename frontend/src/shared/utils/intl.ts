export function formatDate({
  date,
  language,
  options,
}: {
  date: Date;
  language?: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  return new Intl.DateTimeFormat(
    language ?? navigator.language,
    options,
  ).format(date);
}

export function getDayFromDate({
  date,
  language,
  options,
}: {
  date: Date;
  language?: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  return new Intl.DateTimeFormat(
    language ?? navigator.language,
    options ?? {
      weekday: "short",
    },
  ).format(date);
}

export function getHourFromDate({
  date,
  language,
  options,
}: {
  date: Date;
  language?: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  return new Intl.DateTimeFormat(
    language ?? navigator.language,
    options ?? {
      hour: "numeric",
      hour12: true,
    },
  ).format(date);
}
