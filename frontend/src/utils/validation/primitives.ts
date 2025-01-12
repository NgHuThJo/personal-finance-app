export const isNumber = (data: unknown) => {
  return Number.isFinite(data) || typeof data === "bigint";
};

export const isString = (data: unknown) => {
  return typeof data === "string";
};
