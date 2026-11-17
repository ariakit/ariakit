import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the code with a title that has an id of its own", () => {
  expect(q.region("config.ts")).toBeInTheDocument();
  expect(q.button("Copy config.ts")).toBeInTheDocument();
});

test("doesn't name the code with another element as the title", () => {
  // Only the block with a title part is a region.
  expect(q.region.all()).toHaveLength(1);
  expect(q.region.maybe("store.json")).not.toBeInTheDocument();
  for (const element of document.querySelectorAll("[aria-labelledby]")) {
    const ids = element.getAttribute("aria-labelledby")?.split(" ") ?? [];
    for (const id of ids) {
      expect(document.getElementById(id)).toBeInTheDocument();
    }
  }
  expect(q.button("Copy store.json")).toBeInTheDocument();
});

test("names a wrapped file tab panel, not its code, which has no role", () => {
  const panel = q.tabpanel("notes.md");
  expect(panel).toBeInTheDocument();
  // A name on an element without a role would be ignored.
  const code = panel.querySelector("pre");
  expect(code).not.toHaveAttribute("role");
  expect(code).not.toHaveAttribute("aria-labelledby");
  expect(code).not.toHaveAttribute("aria-label");
});
