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
    "no-shadow": "off",
    "iframe-missing-sandbox": "off",
    "consistent-type-imports": ["error", { fixStyle: "separate-type-imports" }],
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
      files: ["packages/ariakit-react-core/src/**/*.{ts,tsx}"],
      rules: {
        "forward-ref-uses-ref": "off",
      },
    },
    {
      // Disable this rule for the site because some types depend on the site
      // being built first, and linting may run before the site is built.
      files: ["site/src/lib/**/*.ts"],
      rules: {
        "no-redundant-type-constituents": "off",
      },
    },
  ],
});
