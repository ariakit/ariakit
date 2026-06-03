/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";
import { decode } from "html-entities";
import { expect, test } from "vitest";
import {
  satteriAdmonitionsPlugin,
  satteriAsTagNamePlugin,
  satteriAutolinkHeadingsPlugin,
  satteriCodeBlockHastPlugin,
  satteriCodeBlockMdastPlugin,
  satteriHeadingIdsPlugin,
} from "./markdown-plugins.ts";

function createMarkdownRenderer() {
  return createSatteriMarkdownProcessor({
    syntaxHighlight: false,
    mdastPlugins: [satteriCodeBlockMdastPlugin()],
    hastPlugins: [
      satteriCodeBlockHastPlugin(),
      satteriHeadingIdsPlugin(),
      satteriAutolinkHeadingsPlugin(),
      satteriAdmonitionsPlugin(),
      satteriAsTagNamePlugin({
        tags: ["h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol"],
      }),
    ],
  });
}

async function renderMarkdown(markdown: string) {
  const renderer = await createMarkdownRenderer();
  return renderer.render(markdown);
}

test("adds heading links and preserves tag names", async () => {
  const result = await renderMarkdown("## Hello *world*");

  expect(result.code).toContain('id="hello-world"');
  expect(result.code).toContain('as="h2"');
  expect(result.code).toContain(
    '<a href="#hello-world">Hello <em>world</em></a>',
  );
  expect(result.metadata.headings).toEqual([
    { depth: 2, slug: "hello-world", text: "Hello world" },
  ]);
});

test("does not leak heading ids across renders", async () => {
  const renderer = await createMarkdownRenderer();

  const first = await renderer.render("## Heading");
  const second = await renderer.render("## Heading");

  expect(first.code).toContain('id="heading"');
  expect(second.code).toContain('id="heading"');
  expect(second.code).not.toContain('id="heading-1"');
});

test("preserves code fence metadata", async () => {
  const result = await renderMarkdown(`
\`\`\`jsx {0-2} "label"0
<ComboboxGroup label="Continents" />
\`\`\`
`);

  const metastring = result.code.match(/metastring="([^"]+)"/)?.[1];

  expect(metastring).toBeTruthy();
  expect(decode(metastring)).toBe('{0-2} "label"0');
});

test("pairs previous code blocks with the following code block", async () => {
  const result = await renderMarkdown(`
Before:

\`\`\`test.jsx {0-2} previousCode
<ComboboxGroup label="Continents" />
\`\`\`

After:

\`\`\`jsx {0-2}
<ComboboxGroup label="Countries" />
\`\`\`
`);

  const previousCode = result.code.match(/previousCode="([^"]+)"/)?.[1];
  const metastring = result.code.match(/metastring="([^"]+)"/)?.[1];

  expect(result.code).not.toContain("<p>Before:");
  expect(result.code).not.toContain("<p>After:");
  expect(result.code).not.toContain("Continents");
  expect(previousCode).toBeTruthy();
  expect(atob(previousCode!)).toBe('<ComboboxGroup label="Continents" />');
  expect(decode(metastring)).toBe("{0-2}");
});

test("does not leak previous code across renders", async () => {
  const renderer = await createMarkdownRenderer();

  await renderer.render(`
\`\`\`jsx previousCode
<Button>Before</Button>
\`\`\`
`);
  const result = await renderer.render(`
\`\`\`jsx
<Button>After</Button>
\`\`\`
`);

  expect(result.code).not.toContain("previousCode=");
});

test("transforms GitHub-style admonitions", async () => {
  const result = await renderMarkdown(`
> [!CAUTION] Be careful
>
> This is a caution admonition with a title.
`);

  expect(result.code).toContain(
    '<admonition type="caution" title="Be careful">',
  );
  expect(result.code).toContain(
    "<p>This is a caution admonition with a title.</p>",
  );
});
