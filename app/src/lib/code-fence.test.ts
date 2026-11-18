/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { expect, test } from "vitest";
import { getInstallCommands, parseCodeFence } from "./code-fence.ts";

const code = `const [open, setOpen] = useState(false);
const store = useDisclosureStore({ open, setOpen });
const isOpen = useStoreState(store, "open");`;

// The options of a fence without info string options.
const defaults = {
  language: "text",
  lines: [],
  words: [],
  lineNumbers: false,
  wrap: false,
  prompt: false,
  tab: false,
  install: false,
};

function getErrors(info: string, source = code) {
  const [lang, ...meta] = info.split(" ");
  return parseCodeFence({ lang, meta: meta.join(" "), code: source }).errors;
}

test("reads a file name as the title and its extension as the language", () => {
  expect(parseCodeFence({ lang: "details.tsx", code })).toEqual({
    options: { ...defaults, title: "details.tsx", language: "tsx" },
    errors: [],
  });
  expect(parseCodeFence({ lang: "src/readme.md", code }).options).toEqual({
    ...defaults,
    title: "src/readme.md",
    language: "md",
  });
  expect(parseCodeFence({ lang: "pnpm-workspace.yaml", code }).options).toEqual(
    { ...defaults, title: "pnpm-workspace.yaml" },
  );
  const languages = {
    "vite.config.mts": "ts",
    "scripts/setup.sh": "sh",
    "fix.diff": "diff",
  };
  for (const [lang, language] of Object.entries(languages)) {
    expect(parseCodeFence({ lang, code }).options.language).toBe(language);
  }
});

test("reads a language word", () => {
  for (const lang of ["tsx", "sh", "diff", "markdown", "md", "text"]) {
    expect(parseCodeFence({ lang, code }).options.language).toBe(lang);
  }
  expect(parseCodeFence({ code }).options).toEqual(defaults);
  expect(getErrors("tsxx")[0]).toMatch(/^tsxx isn't a supported language/);
});

test("reads every option of the meta", () => {
  const meta = `{1,3-3} "open"0,2 'say "hi"' title="Prompt for your agent" maxLines=10 wrap lineNumbers`;
  const source = `${code}\nsay "hi"`;
  expect(parseCodeFence({ lang: "tsx", meta, code: source })).toEqual({
    options: {
      ...defaults,
      language: "tsx",
      title: "Prompt for your agent",
      lines: [1, 3],
      words: [["open", 0, 2], 'say "hi"'],
      maxLines: 10,
      wrap: true,
      lineNumbers: true,
    },
    errors: [],
  });
});

test("reads the flags of tabs, install, and prompts", () => {
  expect(
    parseCodeFence({ lang: "toggle.css", meta: "tab", code }).options,
  ).toEqual({ ...defaults, title: "toggle.css", language: "css", tab: true });
  expect(
    parseCodeFence({ lang: "sh", meta: "prompt", code: "npm run dev" }),
  ).toEqual({
    options: { ...defaults, language: "sh", prompt: true },
    errors: [],
  });
  expect(
    parseCodeFence({ lang: "sh", meta: "install", code: "npm i ariakit" }),
  ).toEqual({
    options: { ...defaults, language: "sh", install: true },
    errors: [],
  });
});

test("reports mistakes in line ranges and word marks", () => {
  expect(getErrors("tsx {4}")).toEqual([
    "Line 4 in {4} doesn't exist. Lines count from 1, and the code has 3.",
  ]);
  expect(getErrors("tsx {0}")[0]).toMatch(/^Line 0 in \{0\}/);
  expect(getErrors("tsx {3-1}")[0]).toMatch(/^Can't read the line range/);
  expect(getErrors("tsx {1")).toEqual(["{1 has no }."]);
  // The bounds are checked before the range expands, so a typo fails fast.
  expect(getErrors("tsx {1-3000000000}")).toEqual([
    "Line 3000000000 in {1-3000000000} doesn't exist. Lines count from 1, and the code has 3.",
  ]);
  expect(getErrors(`tsx "open"0-3000000000`)[0]).toMatch(
    /marks occurrence 3000000000, but the code has 3/,
  );
  expect(getErrors(`tsx "open"3`)).toEqual([
    `"open"3 marks occurrence 3, but the code has 3. Occurrences count from 0, so 0 is the first.`,
  ]);
  expect(getErrors(`tsx "close"`)).toEqual([`"close" isn't in the code.`]);
  expect(getErrors(`tsx ""`)).toEqual([`The word mark "" has no text.`]);
  expect(getErrors(`tsx "open`)).toEqual([`"open has no ".`]);
  expect(getErrors("tsx /open/")[0]).toBe(
    `/open/ uses slashes. Mark text with quotes, such as "open".`,
  );
});

test("reports names from other tools and rejected options with a fix", () => {
  expect(getErrors("tsx showLineNumbers")).toEqual([
    "showLineNumbers isn't an option. Write lineNumbers.",
  ]);
  expect(getErrors("tsx filename=a.tsx")[0]).toMatch(/Put the file name first/);
  expect(getErrors("tsx noCopy")).toEqual([
    "noCopy isn't an option. Every block has a copy button.",
  ]);
  expect(getErrors("sh npm2yarn")).toEqual([
    "npm2yarn isn't an option. Write install.",
  ]);
  expect(getErrors("tsx previousCode")).toEqual([
    "previousCode isn't supported yet.",
  ]);
  expect(getErrors("tsx lineNumber")).toEqual([
    'lineNumber isn\'t an option. The options are lineNumbers, wrap, prompt, tab, install, maxLines=N, title="…", line ranges such as {1,3-5}, and quoted text such as "count".',
  ]);
  expect(getErrors("tsx toString")[0]).toMatch(
    /^toString isn't an option\. The options are/,
  );
  expect(getErrors("tsx counter.tsx")[0]).toBe(
    'counter.tsx looks like a file name. Put it first, such as ```counter.tsx, or write title="counter.tsx".',
  );
});

test("reports options that conflict or repeat", () => {
  expect(getErrors("tsx lineNumbers=5")).toEqual([
    "lineNumbers takes no value. Write lineNumbers alone.",
  ]);
  expect(getErrors("tsx wrap wrap")).toEqual(["wrap appears twice."]);
  expect(getErrors("tsx maxLines=0")[0]).toMatch(/whole number above 0/);
  expect(getErrors(`a.tsx title="b"`)[0]).toMatch(/sets a second title/);
  expect(getErrors(`sh title="sh" title="x"`)).toEqual([
    "title appears twice.",
  ]);
  expect(getErrors("sh prompt lineNumbers")).toEqual([
    "prompt and lineNumbers both use the space before each line. Pick one.",
  ]);
  expect(getErrors("tsx tab")[0]).toMatch(/^A tab fence needs a title/);
});

test("reports install fences that can't convert", () => {
  const install = "npm install @ariakit/react";
  expect(getErrors("sh install", install)).toEqual([]);
  expect(getErrors("tsx install", install)).toEqual([
    "install needs a shell fence, such as ```sh install.",
  ]);
  expect(getErrors("sh install prompt", install)[0]).toMatch(
    /^install takes no other options/,
  );
  expect(getErrors("sh install", "npm run dev")[0]).toMatch(
    /^install needs one npm install command/,
  );
});

test("converts one npm install command for each package manager", () => {
  expect(getInstallCommands("npm install @ariakit/react react@19\n")).toEqual([
    { packageManager: "npm", command: "npm install @ariakit/react react@19" },
    { packageManager: "pnpm", command: "pnpm add @ariakit/react react@19" },
    { packageManager: "yarn", command: "yarn add @ariakit/react react@19" },
    { packageManager: "bun", command: "bun add @ariakit/react react@19" },
  ]);
  expect(getInstallCommands("npm i --save-dev vitest")).toEqual([
    { packageManager: "npm", command: "npm install -D vitest" },
    { packageManager: "pnpm", command: "pnpm add -D vitest" },
    { packageManager: "yarn", command: "yarn add -D vitest" },
    { packageManager: "bun", command: "bun add -d vitest" },
  ]);
  expect(getInstallCommands("npm install")).toBeNull();
  expect(getInstallCommands("npm install --global vitest")).toBeNull();
  expect(getInstallCommands("npm install a && npm test")).toBeNull();
  expect(getInstallCommands("npm install a\nnpm install b")).toBeNull();
  expect(getInstallCommands("pnpm add a")).toBeNull();
});
