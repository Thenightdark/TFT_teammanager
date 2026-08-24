export const storageKeys = {
  champions: "tft-helper:selectedChampions",
  items: "tft-helper:selectedItems",
  set: "tft-helper:selectedSet",
  gridSize: "tft-helper:championGridSize",
  showNames: "tft-helper:showChampionNames",
  augments: "tft-helper:selectedAugments",
  displayMode: "tft-helper:displayMode",
  favoriteComps: "tft-helper:favoriteComps",
  compNotes: "tft-helper:compNotes",
} as const;

export function readSavedJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function readSavedString(key: string, fallback: string): string {
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

export function saveJson(key: string, value: unknown) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage can be unavailable in restricted environments. */ }
}

export function saveString(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* Storage can be unavailable in restricted environments. */ }
}

export function clearSavedData() {
  try { Object.values(storageKeys).forEach((key) => window.localStorage.removeItem(key)); } catch { /* Nothing else to clear. */ }
}
