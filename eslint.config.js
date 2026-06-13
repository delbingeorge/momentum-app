const expoConfig = require("eslint-config-expo/flat");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "ios/**",
      "android/**",
      ".expo/**",
      "dist/**",
      "supabase/functions/**",
      "babel.config.js",
      "metro.config.js",
      "*.config.js",
    ],
  },
  ...expoConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Coding standards §4: any banned, no non-null assertions, no enum
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: "Use union types instead of enum (coding standards §4).",
        },
      ],
      // Coding standards §13: no stray console.log; error/warn allowed for logging
      "no-console": ["error", { allow: ["warn", "error"] }],
      // Coding standards §1.3 / §5: named exports only
      "import/no-default-export": "error",
      // React Compiler rules from eslint-config-expo misfire on Reanimated
      // shared-value mutation (scale.value =), external-store hydration, and
      // Date.now() timer seeds. Not part of the coding standards; disabled to
      // keep gate signal clean. rules-of-hooks + exhaustive-deps stay on.
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      // Web/HTML rule: React Native text nodes are not HTML, apostrophes render
      // fine and need no entity escaping.
      "react/no-unescaped-entities": "off",
    },
  },
  {
    // Expo Router routes require default exports by framework contract, and
    // navigation render-props (tabBarIcon) legitimately trip display-name.
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "import/no-default-export": "off",
      "react/display-name": "off",
    },
  },
  {
    // Coding standards §4: non-null assertions allowed in tests. Jest mock
    // factories are hoisted above imports, so require() is required there.
    files: ["**/*.test.{ts,tsx}", "jest.setup.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
