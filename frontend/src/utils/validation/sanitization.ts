export const sanitizeData = <T>(
  data: T[],
  filterFn: (item: unknown) => boolean,
) => data.filter(filterFn);
