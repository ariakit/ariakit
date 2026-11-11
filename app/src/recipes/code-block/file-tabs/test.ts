import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("moves between files with the arrow keys", async () => {
  await click(q.tab("toggle.tsx"));
  await press.ArrowRight();
  expect(q.tab("use-toggle.ts")).toHaveFocus();
  expect(q.tabpanel("use-toggle.ts")).toBeVisible();
  expect(q.tabpanel.maybe("toggle.tsx")).not.toBeInTheDocument();
  // The Tab order after the tabs depends on CSS, which hides the scroll buttons
  // of a strip that fits, so the Chrome test covers it.
});

test("puts a hidden pipe before each file tab after the first", () => {
  expect(q.tab("toggle.tsx").previousElementSibling).toBeNull();
  for (const name of ["use-toggle.ts", "toggle.css"]) {
    const mark = q.tab(name).previousElementSibling;
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).not.toHaveRole("tab");
  }
  expect(q.tab.all()).toHaveLength(3);
});

test("copies the selected file", async () => {
  await click(q.tab("use-toggle.ts"));
  // Only the panel that shows has a copy button, which names its tab.
  expect(q.button.all(/^Copy /)).toHaveLength(1);
  await click(q.button("Copy use-toggle.ts"));
  expect(await q.button.wait("Copied")).toBeInTheDocument();
  expect(await navigator.clipboard.readText()).toMatch(
    /^import \{ useCallback, useState \} from "react";\n/,
  );
});
