import { q } from "@ariakit/test";
import { HeadingLevel } from "@ariakit/ui/components/heading.ariakit.react";
import { createElement } from "react";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { HeadingExamples } from "./pages/heading.react.tsx";

// The gallery shell renders the examples in a level-two context, so every box
// title is an h2. Mount them the same way, so the levels match the browser.
function HeadingExamplesInShellLevel() {
  return createElement(
    HeadingLevel,
    { level: 2 },
    createElement(HeadingExamples),
  );
}

mountExamples(HeadingExamplesInShellLevel);

test("nests the semantic ladder one level per HeadingLevel", () => {
  const box = q.within(q.article("Semantic levels"));
  expect(box.heading("Level three", { level: 3 })).toBeInTheDocument();
  expect(box.heading("Level four", { level: 4 })).toBeInTheDocument();
  expect(box.heading("Level five", { level: 5 })).toBeInTheDocument();
  expect(box.heading("Level six", { level: 6 })).toBeInTheDocument();
});

test("keeps the element of a heading given another size step", () => {
  const box = q.within(q.article("Visual level"));
  expect(box.heading("An h4 at the h2 size", { level: 4 })).toBeInTheDocument();
});

test("renders a permalink inside its heading", () => {
  const heading = q.within(q.article("Permalink")).heading("Anchored heading");
  expect(q.within(heading).link("Anchored heading")).toHaveAttribute(
    "href",
    "#permalink",
  );
});
