import { highlight } from "@ariakit/ui/utils/highlight.server";
import { getFileIcon } from "../file-icons.ts";

const source = `{
  "name": "pricing-page",
  "version": "1.4.0",
  "private": true,
  "description": "A pricing page with three plans, a monthly or yearly switch, and a table that compares the features of each plan side by side.",
  "keywords": ["pricing", "plans", "billing", "comparison table", "subscription", "checkout"],
  "scripts": {
    "dev": "astro dev --host",
    "build": "astro check && astro build",
    "test": "vitest run --coverage --reporter=verbose --exclude \\"**/fixtures/**\\"",
    "lint": "oxlint --deny-warnings src && prettier --check \\"src/**/*.{ts,tsx,astro,css,json,md}\\""
  },
  "dependencies": {
    "@ariakit/react": "^0.4.0",
    "astro": "^7.4.0"
  }
}`;

export function load() {
  // The description is the long line that the text explains.
  return {
    code: highlight(source, "json", { lines: [5] }),
    icon: getFileIcon("package.json"),
  };
}
