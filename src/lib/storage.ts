/**
 * Safe local storage utility with in-memory fallback.
 * Prevents SecurityError, SSR window access crashes, or QuotaExceededError.
 */

const memoryStore: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    if (isLocalStorageAvailable()) {
      try {
        return window.localStorage.getItem(key);
      } catch (err) {
        console.warn(`Failed to read key "${key}" from localStorage:`, err);
      }
    }
    return memoryStore[key] ?? null;
  },

  setItem(key: string, value: string): void {
    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (err) {
        console.warn(`Failed to write key "${key}" to localStorage:`, err);
      }
    }
    memoryStore[key] = value;
  },

  removeItem(key: string): void {
    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {
        console.warn(`Failed to remove key "${key}" from localStorage:`, err);
      }
    }
    delete memoryStore[key];
  },
};
