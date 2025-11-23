import { formatDate } from "#frontend/shared/utils/intl";

const options: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "short",
  day: "numeric",
};

export function formatWeatherDateForUI(date: Date) {
  const language = "en-US";

  return formatDate({ date, language, options });
}

export function formatWeatherValue<T>(value: T, unit: string, separator = "") {
  return value + separator + unit;
}
