import { createMMKV } from "react-native-mmkv";
import { createJSONStorage } from "zustand/middleware";

// Single MMKV instance + adapter so a later backend swap touches only this file.
// MMKV is synchronous, so persisted stores hydrate during creation (no async
// rehydration race) and there is no AsyncStorage 6MB SQLite ceiling.
const mmkv = createMMKV();

export const appStorage = {
  getItem: (key: string) => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string) => mmkv.set(key, value),
  removeItem: (key: string): void => {
    mmkv.remove(key);
  },
};

export const createPersistStorage = <T>() =>
  createJSONStorage<T>(() => appStorage);
