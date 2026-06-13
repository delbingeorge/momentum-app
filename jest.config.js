// jest-expo handles the RN/Expo transform; we extend transformIgnorePatterns
// with the native modules this app pulls in and map the @/* path alias.
const nativeModules = [
  "(jest-)?react-native",
  "@react-native(-community)?",
  "expo(nent)?",
  "@expo(nent)?/.*",
  "@expo-google-fonts/.*",
  "@react-native-google-signin",
  "nativewind",
  "react-native-css-interop",
  "react-native-reanimated",
  "react-native-worklets",
  "react-native-gesture-handler",
  "react-native-actions-sheet",
  "react-native-purchases",
  "react-native-svg",
  "@rn-primitives",
  "@hugeicons",
  "@supabase",
].join("|");

module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css)$": "<rootDir>/__mocks__/style-mock.js",
  },
  transformIgnorePatterns: [`node_modules/(?!(${nativeModules}))`],
  clearMocks: true,
};
