import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";

// Single storage adapter so a later swap to MMKV touches only this file.
export const appStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export const createPersistStorage = <T>() =>
  createJSONStorage<T>(() => appStorage);
