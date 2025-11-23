export function isZero(value: any) {
  const convertedValue = +value;

  if (!convertedValue) {
    return true;
  }

  return false;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
