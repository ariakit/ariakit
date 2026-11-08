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
  // Declaring `react` only in an override would enable just the rules that the
  // override names, silently disabling every other React rule, including
  // `react/jsx-key` and `react/no-children-prop`.
  plugins: ["typescript", "react", "import"],
  jsPlugins: [
    {
      name: "comment-reflow",
      specifier: "oxlint-plugin-comment-reflow",
    },
    "oxlint-tailwindcss",
  ],
  settings: {
    tailwindcss: {
      // Mirrors tailwindCSS.experimental.configFile in .vscode/settings.json.
      entryPoint: [
        { files: "templates/react/**", use: "templates/react/src/style.css" },
        { files: "**", use: "app/src/styles/global.css" },
      ],
      // The cva extractor reads `class` and object variants of Clava recipes,
      // but not string, function, or `{ class }` variant values. Recipes also
      // add classes in `refine` through `addClass`.
      calleeExtractors: { cv: "cva" },
      callees: ["addClass"],
    },
  },
  options: {
    // Type-aware rules resolve `astro:content` through the gitignored
    // `app/.astro`, so the `lint` and `lint-fix` scripts and the pre-commit
    // hook sync it first. Without it, `--fix` can rewrite source silently.
    // https://github.com/ariakit/ariakit/issues/7262
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
    "comment-reflow/reflow": [
      "error",
      { printWidth: 80, trailingComments: "always" },
    ],
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
    "exhaustive-deps": [
      "error",
      {
        additionalHooks:
          "(useSafeLayoutEffect|useUpdateEffect|useUpdateLayoutEffect)",
      },
    ],
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
      // React Compiler rules assume components re-run, while some other React
      // rules enforce JSX semantics that Solid doesn't share.
      // https://github.com/ariakit/ariakit/issues/7250
      files: ["**/*.solid.*", "packages/ariakit-solid*/**"],
      rules: disabledReactRules,
    },
    {
      // A .server module runs only on the server. A value import from a module
      // that the browser can load, such as an example or its shared data, would
      // bundle it, and Shiki with it. Type imports leave no code.
      files: ["**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                regex: "\\.server(\\.tsx?)?$",
                allowTypeImports: true,
                message:
                  "Import only types from a .server module. Pass its results as props from the server file instead.",
              },
            ],
          },
        ],
      },
    },
    {
      // These modules never reach the browser, so they can use .server values:
      // other .server modules, tests and their helpers, and the app pages.
      files: [
        "**/*.server.{ts,tsx}",
        "**/*.test*.{ts,tsx}",
        "**/test.{ts,tsx}",
        "**/test-*.{ts,tsx}",
        "**/tests/**",
        "**/perf*-chrome.{ts,tsx}",
        "**/test-utils/**",
        "app/src/pages/**",
      ],
      rules: {
        "no-restricted-imports": "off",
      },
    },
    {
      files: [
        "app/**",
        "nextjs/**",
        "packages/ariakit-ui/src/**",
        "templates/react/**",
      ],
      rules: {
        "tailwindcss/enforce-canonical": "error",
        "tailwindcss/no-deprecated-classes": "error",
      },
    },
    {
      // These sandboxes load @ariakit/tailwind without Ariakit UI and cover the
      // arbitrary value syntax of its utilities, which the rules would rewrite.
      files: ["app/src/sandbox/ariakit-tailwind*/**"],
      rules: {
        "tailwindcss/enforce-canonical": "off",
        "tailwindcss/no-deprecated-classes": "off",
      },
    },
  ],
});
