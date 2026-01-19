import { Logger } from "#frontend/shared/app/logging";

export function getLocalStorageItem(key: string) {
  const item = localStorage.getItem(key);

  if (item === null) {
    Logger.error(`Key ${key} does not exist in localStorage`);
    return;
  }

  return item;
}

export function setLocalStorageItem(key: string, value: string) {
  localStorage.setItem(key, value);
  Logger.debug(`Key ${key} mapped to value ${value}`);
}
