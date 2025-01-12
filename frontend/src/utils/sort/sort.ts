import { isNumber, isString } from "#frontend/utils/validation/primitives";
import { sanitizeData } from "#frontend/utils/validation/sanitization";

export function sortNumbers({
  data,
  order = "asc",
}: {
  data: number[];
  order?: "asc" | "desc";
}) {
  if (!Array.isArray(data)) {
    throw new TypeError("Data must be array of numbers");
  }

  const sanitizedData = sanitizeData(data, (item) => isNumber(item));

  if (sanitizedData.length < data.length) {
    console.warn("Bad data found and filtered");
  }

  return [...sanitizedData].sort((a, b) => (order === "asc" ? a - b : b - a));
}

export function sortDates({
  data,
  order = "asc",
}: {
  data: Date[];
  order?: "asc" | "desc";
}) {
  if (!Array.isArray(data)) {
    throw new TypeError("Data must be array of Date objects");
  }

  const sanitizedData = sanitizeData(
    data,
    (item) => item instanceof Date && isNumber(Number(item)),
  );

  if (sanitizedData.length < data.length) {
    console.warn("Bad data found and filtered");
  }

  return [...sanitizedData].sort((a, b) =>
    order === "asc" ? a.getTime() - b.getTime() : b.getTime() - a.getTime(),
  );
}

export function sortStrings({
  data,
  order = "asc",
}: {
  data: string[];
  order?: "asc" | "desc";
}) {
  if (!Array.isArray(data)) {
    throw new TypeError("Data must be array of strings");
  }

  const sanitizedData = sanitizeData(
    data,
    (item) => isString(item) && item.trim().length > 0,
  );

  if (sanitizedData.length < data.length) {
    console.warn("Bad data found and filtered");
  }

  return [...sanitizedData].sort((a, b) =>
    order === "asc" ? a.localeCompare(b) : b.localeCompare(a),
  );
}
