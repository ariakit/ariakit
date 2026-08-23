import { defineConfig } from "oxlint";

const disabledReactRules = {
  "react/capitalized-calls": "off",
  "react/error-boundaries": "off",
  "react/exhaustive-deps": "off",
  "react/exhaustive-effect-dependencies": "off",
  "react/globals": "off",
  "react/hooks": "off",
  "react/immutability": "off",
  "react/incompatible-library": "off",
  "react/jsx-key": "off",
  "react/memo-dependencies": "off",
  "react/no-children-prop": "off",
  "react/no-namespace": "off",
  "react/no-unstable-nested-components": "off",
  "react/preserve-manual-memoization": "off",
  "react/purity": "off",
  "react/refs": "off",
  "react/set-state-in-effect": "off",
  "react/set-state-in-render": "off",
  "react/static-components": "off",
  "react/style-prop-object": "off",
  "react/use-memo": "off",
  "react/void-use-memo": "off",
} as const;

export default defineConfig({
  // Declaring `react` only in an override would enable just the rules that
  // the override names, silently disabling every other React rule, including
  // `react/jsx-key` and `react/no-children-prop`.
  plugins: ["typescript", "react", "import"],
  options: {
    typeAware: true,
    // A suppression that stops matching is how lint coverage disappears
    // unnoticed, so treat an unused directive as an error rather than as
    // cleanup.
    reportUnusedDisableDirectives: "error",
    // Roughly a quarter of the enabled rules are warnings, which would
    // otherwise never fail CI.
    denyWarnings: true,
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
    "react-in-jsx-scope": "off",
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
      // Astro generates these types into the gitignored `app/.astro`, so CI
      // lints without them and `astro:content` resolves `CollectionEntry` to
      // `any`, which widens every union built from it.
      files: ["app/src/lib/**/*.ts"],
      rules: {
        "no-redundant-type-constituents": "off",
      },
    },
    {
      // Same missing types, but here they make a narrowing assertion look
      // unnecessary. This cannot be a directive because the assertion is
      // needed once the types exist, so the directive would then be unused.
      files: ["app/src/lib/reference-tokenizer.test.ts"],
      rules: {
        "no-unnecessary-type-assertion": "off",
      },
    },
    {
      // React Compiler rules assume components re-run, while some other React
      // rules enforce JSX semantics that Solid doesn't share.
      // https://github.com/ariakit/ariakit/issues/7250
      files: ["**/*.solid.*", "packages/ariakit-solid*/**"],
      rules: disabledReactRules,
    },
  ],
});
