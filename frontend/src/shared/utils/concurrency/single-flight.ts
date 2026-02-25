export function createInFlight<
  F extends (...args: unknown[]) => Promise<unknown>,
>(fn: F): (...args: Parameters<F>) => ReturnType<F> {
  let inFlightPromise: ReturnType<F> | null = null;

  return (...params) =>
    (inFlightPromise ??= fn(...params).finally(() => {
      inFlightPromise = null;
    }) as ReturnType<F>);
}
