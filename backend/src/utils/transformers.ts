export const convertToString = (value: unknown) => {
  if (value !== null && typeof value === "object" && "toString" in value) {
    return value.toString();
  }

  return String(value);
};

export const convertDateToISOString = (date: Date | string) =>
  new Date(date).toISOString();
