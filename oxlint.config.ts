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
      files: ["packages/ariakit-react-core/src/**/*.{ts,tsx}"],
      rules: {
        "forward-ref-uses-ref": "off",
      },
    },
    {
      files: ["site/src/lib/reference-tokenizer.ts"],
      rules: {
        "no-redundant-type-constituents": "off",
      },
    },
  ],
});
