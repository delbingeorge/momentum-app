// Persisted Zustand stores read/write MMKV on creation; back it with an
// in-memory Map so store modules import cleanly without the native module.
jest.mock("react-native-mmkv", () => {
  const store = new Map<string, string>();
  return {
    createMMKV: jest.fn(() => ({
      getString: (key: string) => store.get(key),
      set: (key: string, value: string) => store.set(key, value),
      remove: (key: string) => store.delete(key),
      clearAll: () => store.clear(),
    })),
  };
});

// Supabase auth keeps its session in SecureStore; stub it so importing the
// auth/api layer in a test never touches the native module.
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));
