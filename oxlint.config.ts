import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "import"],
  options: {
    typeAware: true,
  },
  ignorePatterns: ["website", "**/*.astro"],
  categories: {
    correctness: "error",
    suspicious: "warn",
    pedantic: "off",
  },
  rules: {
    // Type-only exports are incorrectly reported as missing.
    // https://github.com/oxc-project/oxc/issues/13258
    "import/namespace": "off",
    "no-unsafe-type-assertion": "off",
    "no-unassigned-import": "off",
    "no-shadow": "off",
    "no-underscore-dangle": "off",
    "consistent-return": "off",
    "no-unnecessary-type-arguments": "off",
    "consistent-type-imports": ["error", { fixStyle: "separate-type-imports" }],
    "consistent-type-specifier-style": ["error", "prefer-top-level"],
    "no-unused-vars": [
      "error",
      {
        ignoreRestSiblings: true,
        caughtErrors: "none",
        args: "none",
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
      },
    ],
  },
  overrides: [
    {
      files: ["*.d.ts"],
      rules: {
        "consistent-type-imports": "off",
      },
    },
    {
      // Disable this rule for the app because some types depend on the app
      // being built first, and linting may run before the app is built.
      files: ["app/src/lib/**/*.ts"],
      rules: {
        "no-redundant-type-constituents": "off",
      },
    },
    {
      files: [
        "**/*.react.*",
        "{examples,nextjs,packages/ariakit-react*,packages/ariakit-test,templates/react}/**/*.{js,jsx,ts,tsx}",
      ],
      excludeFiles: ["**/*.solid.*"],
      plugins: ["typescript", "react", "import"],
      rules: {
        "react/exhaustive-effect-dependencies": "warn",
        "react/hooks": "warn",
        "react/iframe-missing-sandbox": "off",
        "react/immutability": "error",
        "react/memo-dependencies": "warn",
        "react/purity": "error",
        "react/react-in-jsx-scope": "off",
        "react/refs": "error",
        "react/set-state-in-effect": "error",
        "react/use-memo": "error",
      },
    },
    {
      // We have our own `forwardRef` implementation that doesn't need the
      // `ref` parameter, which leads to false positives.
      files: ["packages/ariakit-react-components/src/**/*.{ts,tsx}"],
      plugins: ["typescript", "react", "import"],
      rules: {
        "react/forward-ref-uses-ref": "off",
      },
    },
  ],
});
