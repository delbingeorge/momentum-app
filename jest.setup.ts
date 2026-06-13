// Persisted Zustand stores read/write AsyncStorage on creation; use the
// library's official in-memory mock so store modules import cleanly.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Supabase auth keeps its session in SecureStore; stub it so importing the
// auth/api layer in a test never touches the native module.
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));
