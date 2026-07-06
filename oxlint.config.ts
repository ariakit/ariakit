import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "react", "import"],
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
    "no-unsafe-type-assertion": "off",
    "no-unassigned-import": "off",
    "react-in-jsx-scope": "off",
    "react/exhaustive-deps": "error",
    "react/react-compiler": "error",
    "no-shadow": "off",
    "no-underscore-dangle": "off",
    "iframe-missing-sandbox": "off",
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
      // We have our own `forwardRef` implementation that doesn't need the `ref`
      // parameter, which leads to false positives.
      files: ["packages/ariakit-react-components/src/**/*.{ts,tsx}"],
      rules: {
        "forward-ref-uses-ref": "off",
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
  ],
});
