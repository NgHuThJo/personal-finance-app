export function getPersistedValue(key: string) {
  const serializedValue = localStorage.getItem(key);

  try {
    if (serializedValue === null) {
      throw new Error(`No persisted value with key "${key}" found`);
    }

    return JSON.parse(serializedValue);
  } catch (error) {
    console.error((error as Error).message);

    return null;
  }
}
