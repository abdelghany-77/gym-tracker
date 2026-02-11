import { useState, useEffect, useCallback } from "react";

/**
 * useLocalStorage hook
 * Syncs state with localStorage and handles complex objects.
 * Provides backup and restore functionality.
 *
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value if key doesn't exist
 * @returns {[any, Function, { backup: Function, restore: Function }]}
 */
export function useLocalStorage(key, initialValue) {
  // 1. Initialize state from localStorage or initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 2. Update localStorage when state changes
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  // 3. Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing new storage value", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  // 4. Backup function: downloads the specific key or ALL localStorage if no key is specific (utility)
  // For this hook instance, we backup the current key's value.
  const backup = useCallback(() => {
    try {
      const dataStr = JSON.stringify(storedValue, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `backup-${key}-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Backup failed:", error);
    }
  }, [storedValue, key]);

  // 5. Restore function: reads a JSON file and updates state
  const restore = useCallback(
    (file) => {
      return new Promise((resolve, reject) => {
        if (!file) {
          reject("No file provided");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target.result);
            setValue(json);
            resolve(json);
          } catch (error) {
            console.error("Restore failed: Invalid JSON", error);
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    },
    [setValue],
  );

  return [storedValue, setValue, { backup, restore }];
}

/**
 * Utility to export ALL localStorage data
 */
export function exportAllData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `gym-tracker-full-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Utility to import ALL localStorage data
 */
export function importAllData(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file provided");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        Object.entries(data).forEach(([key, value]) => {
          // If value looks like a stringified JSON (which it is in localStorage), keep it.
          // The backup `exportAllData` reads raw strings.
          localStorage.setItem(key, value);
        });
        // Dispatch storage event to notify hooks
        window.dispatchEvent(new Event("storage"));
        resolve(data);
        // Reload to ensure all states update
        window.location.reload();
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
}
