import { defineConfig } from "oxlint";

// Type-aware rules are deliberately NOT enabled here through
// `options.typeAware`. This file is read by every oxlint invocation, including
// the ones that write to disk: the `lint-fix` script, the `lint-staged`
// pre-commit hook, and the editor's fix-on-save action. Type-aware rules answer
// questions about types, so when a workspace is not installed TypeScript
// degrades the unresolved types to `any` and those answers become wrong.
// Several of the rules are auto-fixable, so a writing run would then rewrite
// correct source into incorrect source, on disk, with no diagnostic and a zero
// exit code. See https://github.com/ariakit/ariakit/issues/6928.
//
// Type-aware rules are enabled per command with `--type-aware` instead, and
// only on commands that cannot write. Both `lint` and `lint-fix` in
// `package.json` run such a pass, and in `lint-fix` it runs after everything
// that writes. CI runs `lint`. Those two scripts are now the only places
// type-aware diagnostics come from: the editor and the pre-commit hook no
// longer report them, and nothing auto-fixes them any more, so a type-aware
// violation has to be fixed by hand. `lint.test.ts` fails if this regresses.
export default defineConfig({
  plugins: ["typescript", "react", "import"],
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
      // Disable this rule for the app because some types depend on the app
      // being built first, and linting may run before the app is built.
      files: ["app/src/lib/**/*.ts"],
      rules: {
        "no-redundant-type-constituents": "off",
      },
    },
  ],
});
