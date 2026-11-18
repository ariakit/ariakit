/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { unified } from "@astrojs/markdown-remark";
import { expect, test } from "vitest";
import type { RemarkCodeFencesOptions } from "./remark-code-fence.server.ts";
import { remarkCodeFences } from "./remark-code-fence.server.ts";

// Compiles the MDX through the processor that the app uses for content.
async function compile(
  content: string,
  filePath = "/app/guide.mdx",
  options: RemarkCodeFencesOptions = {},
) {
  const processor = unified({
    remarkPlugins: [[remarkCodeFences, options]],
  });
  const renderer = await processor.createMdxRenderer?.({}, { optimize: false });
  if (!renderer) throw new Error("The processor renders no MDX");
  const { code } = await renderer.process(content, filePath, {});
  return code;
}

function count(code: string, text: string) {
  return code.split(text).length - 1;
}

test("renders a fence as a code fence island with highlighted code", async () => {
  const code = await compile(`
Text

\`\`\`counter.tsx {1} "count"
const count = 1;
\`\`\`
`);
  expect(code).toContain(
    'import {CodeFence} from "#app/components/code-fence.react.tsx";',
  );
  expect(code).toContain('"client:visible": true');
  expect(code).toContain(
    '"client:component-path": "#app/components/code-fence.react.tsx"',
  );
  expect(code).toContain('kind: "code"');
  expect(code).toContain('"title": "counter.tsx"');
  expect(code).toContain('"text": "const count = 1;"');
  expect(code).toContain('class=\\"line highlighted\\"');
  expect(code).toContain('class=\\"highlighted-word\\"');
  expect(code).not.toContain("_components.pre");
});

test("joins adjacent tab fences until another node", async () => {
  const code = await compile(`
\`\`\`toggle.tsx tab
export function Toggle() {}
\`\`\`

\`\`\`toggle.css tab
.toggle {}
\`\`\`

\`\`\`text
plain
\`\`\`

\`\`\`toggle.tsx tab
export function Toggle() {}
\`\`\`
`);
  expect(count(code, 'kind: "tabs"')).toBe(2);
  expect(count(code, 'kind: "code"')).toBe(1);
  expect(count(code, '"title": "toggle.tsx"')).toBe(2);
  expect(count(code, '"title": "toggle.css"')).toBe(1);
});

test("renders an install fence with a tab for each package manager", async () => {
  const code = await compile(`
\`\`\`sh install
npm install @ariakit/react
\`\`\`
`);
  expect(code).toContain('kind: "install"');
  for (const command of [
    "npm install @ariakit/react",
    "pnpm add @ariakit/react",
    "yarn add @ariakit/react",
    "bun add @ariakit/react",
  ]) {
    expect(code).toContain(`"text": "${command}"`);
  }
});

test("highlights markdown and diff fences", async () => {
  const code = await compile(`
\`\`\`md
# Title
\`\`\`

\`\`\`diff
- old
+ new
\`\`\`
`);
  expect(count(code, "--shiki-light")).toBeGreaterThan(2);
});

test("leaves plain Markdown files alone", async () => {
  const code = await compile("```tsx\nconst a = 1;\n```", "/app/readme.md");
  expect(code).not.toContain("CodeFence");
});

test("stops the build with the file and line of each mistake", async () => {
  await expect(
    compile(`
Text

\`\`\`tsx showLineNumbers
const a = 1;
\`\`\`

\`\`\`a.tsx tab
a
\`\`\`
\`\`\`a.tsx tab
b
\`\`\`
`),
  ).rejects.toThrow(
    [
      "Fix these code fences:",
      "/app/guide.mdx:4: showLineNumbers isn't an option. Write lineNumbers.",
      "/app/guide.mdx:11: The tab group has two a.tsx tabs. Write text between the fences to start a new group, or rename one.",
    ].join("\n"),
  );
});

test("reports a tab group with different maxLines", async () => {
  await expect(
    compile(`
\`\`\`a.tsx tab maxLines=2
a
\`\`\`
\`\`\`b.tsx tab maxLines=3
b
\`\`\`
`),
  ).rejects.toThrow(/guide\.mdx:2: The tabs of a group set different maxLines/);
});

test("puts body text in Prose and top-level fences in popouts", async () => {
  // A popout band holds the parts: a Prose, a popout with the first fence, and
  // a Prose with the list, whose fence stays in the text column.
  const code = await compile(
    `
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";

## Usage

Press <Kbd>K</Kbd>.

\`\`\`tsx
const a = 1;
\`\`\`

- A list with a fence

  \`\`\`tsx
  const b = 2;
  \`\`\`
`,
    "/app/guide.mdx",
    { isBodyContent: () => true },
  );
  expect(code).toContain(
    'import {Prose as CodeFenceProse} from "@ariakit/ui/components/prose.ariakit.react";',
  );
  expect(code).toContain(
    'import {ShellPopout as CodeFencePopout} from "@ariakit/ui/components/shell.ariakit.react";',
  );
  const parts = code.match(
    /_jsxs?\((CodeFenceProse|CodeFencePopout|CodeFence)\b/g,
  );
  expect(parts).toEqual([
    "_jsxs(CodeFencePopout",
    "_jsxs(CodeFenceProse",
    "_jsx(CodeFencePopout",
    "_jsx(CodeFence",
    "_jsx(CodeFenceProse",
    "_jsx(CodeFence",
  ]);
});

test("puts body content without fences in one Prose", async () => {
  const code = await compile("## Usage\n\nText", "/app/guide.mdx", {
    isBodyContent: () => true,
  });
  const parts = code.match(/_jsxs?\((CodeFenceProse|CodeFencePopout)\b/g);
  expect(parts).toEqual(["_jsx(CodeFencePopout", "_jsxs(CodeFenceProse"]);
  expect(code).not.toContain("code-fence.react.tsx");
});

test("imports its components under names that the file doesn't declare", async () => {
  const code = await compile(
    `
import { CodeFence } from "./code-fence.tsx";
import CodeFenceProse from "./prose.tsx";
export const { popout: [CodeFencePopout] } = { popout: ["popout"] };

Text

\`\`\`tsx
const a = 1;
\`\`\`
`,
    "/app/guide.mdx",
    { isBodyContent: () => true },
  );
  expect(code).toContain(
    'import {CodeFence as CodeFence2} from "#app/components/code-fence.react.tsx";',
  );
  expect(code).toContain(
    'import {Prose as CodeFenceProse2} from "@ariakit/ui/components/prose.ariakit.react";',
  );
  expect(code).toContain(
    'import {ShellPopout as CodeFencePopout2} from "@ariakit/ui/components/shell.ariakit.react";',
  );
  // The island and both wrappers render the imported components, not the
  // bindings of the file.
  const parts = code.match(/_jsxs?\((CodeFence\w*)\b/g);
  expect(parts).toEqual([
    "_jsxs(CodeFencePopout2",
    "_jsx(CodeFenceProse2",
    "_jsx(CodeFencePopout2",
    "_jsx(CodeFence2",
  ]);
  expect(code).toContain('"client:component-export": "CodeFence"');
});

test("names untitled code that scrolls", async () => {
  const code = await compile(`
\`\`\`css
.a {}
\`\`\`

\`\`\`text wrap
A long prompt
\`\`\`

\`\`\`a.css
.b {}
\`\`\`
`);
  // Only the first block has a scroll area that no title names.
  expect(code.match(/"label": "[^"]*"/g)).toEqual(['"label": "CSS code"']);
});

test("keeps the import name beside a named default export", async () => {
  // MDX compiles the default export to a function expression, whose name binds
  // only inside the function, so the import name stays free.
  const code = await compile(`
export default function CodeFence({ children }) {
  return children;
}

\`\`\`tsx
const a = 1;
\`\`\`
`);
  expect(code).toContain(
    'import {CodeFence} from "#app/components/code-fence.react.tsx";',
  );
  expect(code).toContain("const MDXLayout = function CodeFence(");
});
