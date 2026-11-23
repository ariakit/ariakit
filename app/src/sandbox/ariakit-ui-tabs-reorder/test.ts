import { focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// happy-dom has no layout, so these tests move tabs with the keyboard only, and
// it doesn't take the text direction from the dir attribute, so the tabs from
// right to left stay in the browser tests. It reports a platform that isn't an
// Apple device, where the Control key moves tabs.
const move = { ctrlKey: true, shiftKey: true };

function getTabNames(name: string) {
  return q
    .within(q.tablist(name))
    .tab.all()
    .map((tab) => tab.textContent);
}

test("moves the focused tab with the arrow keys and keeps the focus", async () => {
  const tab = q.tab("utils.ts");
  await focus(tab);
  await press.ArrowRight(null, move);
  expect(getTabNames("Files").slice(0, 4)).toEqual([
    "index.ts",
    "tabs.ariakit.react.tsx",
    "README.md",
    "utils.ts",
  ]);
  expect(q.text(/^Files: 1 move\./)).toBeInTheDocument();
  expect(tab).toHaveFocus();
  // The status text waits a moment for more moves.
  await expect
    .poll(() => q.status.all().map((status) => status.textContent))
    .toContain("utils.ts moved to position 4 of 7");
  // The tab passes a disabled tab.
  await press.ArrowRight(null, move);
  expect(getTabNames("Files").slice(3, 5)).toEqual([
    "package.json",
    "utils.ts",
  ]);
  expect(tab).toHaveFocus();
});

test("moves the focused tab to the ends with Home and End", async () => {
  const tab = q.tab("utils.ts");
  await focus(tab);
  await press.End(null, move);
  expect(getTabNames("Files").at(-1)).toBe("utils.ts");
  expect(tab).toHaveFocus();
  await press.Home(null, move);
  expect(getTabNames("Files").at(0)).toBe("utils.ts");
  expect(tab).toHaveFocus();
  expect(q.text(/^Files: 2 moves\./)).toBeInTheDocument();
});

test("moves the focus, and not the tab, with a plain arrow key", async () => {
  await focus(q.tab("index.ts"));
  await press.ArrowRight();
  expect(q.tab("tabs.ariakit.react.tsx")).toHaveFocus();
  expect(q.text(/^Files: 0 moves\./)).toBeInTheDocument();
});

test("keeps a disabled tab in its place", async () => {
  const disabled = q.tab("package.json");
  await focus(disabled);
  await press.ArrowLeft(null, move);
  expect(getTabNames("Files")[4]).toBe("package.json");
  expect(disabled).toHaveFocus();
  expect(q.text(/^Files: 0 moves\./)).toBeInTheDocument();
});

test("keeps the tabs of a list without onReorder in their places", async () => {
  await focus(q.tab("One"));
  await press.End(null, move);
  expect(getTabNames("Fixed tabs")).toEqual(["One", "Two", "Three"]);
});
