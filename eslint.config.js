import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
// @ts-expect-error
import react from "eslint-plugin-react/configs/recommended.js";
import vitest from "eslint-plugin-vitest";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules",
      "**/cjs",
      "**/esm",
      "**/coverage",
      "**/public",
      "**/.cache",
      "**/.next",
      "**/.pages",
    ],
  },
  {
    files: ["**/*test.{ts,tsx}"],
    plugins: { vitest },
    ...vitest.configs.env,
    rules: {
      "vitest/consistent-test-it": [
        "error",
        { fn: "test", withinDescribe: "test" },
      ],
    },
  },
  // react,
  // {
  //   settings: {
  //     react: {
  //       version: "detect",
  //     },
  //   },
  // },
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./website/tsconfig.json"],
      },
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    rules: {
      // "react/no-children-prop": "off",
      // "react/react-in-jsx-scope": "off",
      // "react/prop-types": "off",
      // "react/display-name": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-exports": "error",
      "sort-imports": ["error", { ignoreDeclarationSort: true }],
      // "import/no-duplicates": "error",
      // "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      // "import/order": [
      //   "error",
      //   {
      //     alphabetize: { order: "asc" },
      //     pathGroups: [
      //       {
      //         pattern: "react",
      //         group: "builtin",
      //         position: "before",
      //       },
      //     ],
      //     pathGroupsExcludedImportTypes: ["react"],
      //   },
      // ],
    },
  },
);
