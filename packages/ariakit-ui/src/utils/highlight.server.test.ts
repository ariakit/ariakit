import { expect, test } from "vitest";
import { highlight } from "./highlight.server.ts";

function getLineClasses(html: string) {
  return [...html.matchAll(/<span class="(line[^"]*)">/g)].map(
    (match) => match[1],
  );
}

test("marks lines by their one-based numbers", () => {
  const { html, text } = highlight("one\ntwo\nthree", "text", {
    lines: [1, 3, 4],
  });
  expect(text).toBe("one\ntwo\nthree");
  expect(getLineClasses(html)).toEqual([
    "line highlighted",
    "line",
    "line highlighted",
  ]);
});

test("marks text across lines, and only the chosen occurrences", () => {
  const { html } = highlight("one two\nthree two", "text", {
    words: ["two\nthr", ["two", 1]],
  });
  // The first mark ends on the next line, so each line gets its part. The
  // second word marks only its second occurrence.
  expect(html).toBe(
    [
      '<span class="line"><span>one </span><span><span class="highlighted-word">two</span></span></span>',
      '<span class="line"><span><span class="highlighted-word">thr</span></span><span>ee </span><span><span class="highlighted-word">two</span></span></span>',
    ].join("\n"),
  );
});

test("merges marks that overlap, and skips text that's not there", () => {
  const { html } = highlight("ab cd", "text", {
    words: ["ab", "b c", ["zz", 0]],
  });
  expect(html).toBe(
    '<span class="line"><span><span class="highlighted-word">ab c</span></span><span>d</span></span>',
  );
});

test("marks inside a token, or wraps the tokens of a longer mark", () => {
  const light = "--shiki-light:#24292E;--shiki-dark:#E1E4E8";
  const keyword = "--shiki-light:#D73A49;--shiki-dark:#F97583";
  const constant = "--shiki-light:#005CC5;--shiki-dark:#79B8FF";
  // A mark in one token goes inside that token, so it can take its color.
  expect(highlight("let a = 1;", "ts", { words: ["a"] }).html).toContain(
    `<span style="${light}"> </span><span style="${light}"><span class="highlighted-word">a</span></span><span style="${light}"> </span>`,
  );
  // A mark across tokens wraps them in a span with no color of its own.
  expect(highlight("let a = 1;", "ts", { words: ["a = 1"] }).html).toContain(
    `<span class="highlighted-word"><span style="${light}">a </span><span style="${keyword}">=</span><span style="${constant}"> 1</span></span>`,
  );
});

test("keeps entities and markup in the code as written", () => {
  const code = 'const html = "<b>&copy;</b>";\n\nconst tab = "\t";';
  const { html, text } = highlight(code, "ts");
  expect(text).toBe(code);
  expect(html).toContain("&#x3C;b>&#x26;copy;&#x3C;/b>");
  expect(html).not.toContain("<b>");
  // Empty lines keep their place, so line numbers stay right.
  expect(getLineClasses(html)).toEqual(["line", "line", "line"]);
});

test("gives each token a light and a dark color", () => {
  const { html } = highlight("pnpm add @ariakit/react", "bash");
  expect(html).toMatch(
    /^<span class="line"><span style="--shiki-light:#[\dA-F]{6};--shiki-dark:#[\dA-F]{6}">pnpm<\/span>/,
  );
  expect(html).not.toContain(" color:");
});
