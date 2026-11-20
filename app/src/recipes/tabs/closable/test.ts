import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The close mark is hidden from assistive technologies, so it has no role or
// name to query. It's the last element in its tab.
function getCloseMark(name: string) {
  const mark = q.tab(name).lastElementChild;
  if (!mark) throw new Error(`The ${name} tab has no close mark.`);
  return mark;
}

test("names each tab without its close mark", () => {
  expect(q.tab.all()).toHaveLength(3);
  for (const name of ["Groceries", "Workshop", "Trip"]) {
    expect(q.tab(name)).toHaveAccessibleName(name);
    expect(getCloseMark(name)).toHaveAttribute("aria-hidden", "true");
  }
});

test("closes a tab with its close mark and keeps the selected tab", async () => {
  await click(getCloseMark("Workshop"));
  expect(q.tab.maybe("Workshop")).not.toBeInTheDocument();
  expect(q.tab("Groceries")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Groceries")).toHaveTextContent("Oat milk");
});

test("selects the next tab when the close mark closes the selected tab", async () => {
  await click(getCloseMark("Groceries"));
  expect(q.tab.maybe("Groceries")).not.toBeInTheDocument();
  expect(q.tab("Workshop")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Workshop")).toHaveTextContent("Sand the shelf");
});

test("moves the focus and the selection to the next tab with Delete", async () => {
  await click(q.tab("Workshop"));
  await press.Delete();
  expect(q.tab.maybe("Workshop")).not.toBeInTheDocument();
  expect(q.tab("Trip")).toHaveFocus();
  expect(q.tab("Trip")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Trip")).toHaveTextContent("night train");
});

test("moves to the previous tab when Backspace closes the last tab", async () => {
  await click(q.tab("Trip"));
  await press.Backspace();
  expect(q.tab.maybe("Trip")).not.toBeInTheDocument();
  expect(q.tab("Workshop")).toHaveFocus();
  expect(q.tab("Workshop")).toHaveAttribute("aria-selected", "true");
});

test("keeps the only tab that is left", async () => {
  await click(q.tab("Trip"));
  await press.Delete();
  await press.Delete();
  expect(q.tab.all()).toHaveLength(1);
  const last = q.tab("Groceries");
  expect(last).toHaveFocus();
  // The tab that can't close shows no close mark.
  expect(last.querySelector("svg")).toBeNull();
  await press.Delete();
  expect(q.tab("Groceries")).toBeInTheDocument();
});

test("opens a tab with the button after the tab list", async () => {
  const list = q.within(q.tablist("Open notes"));
  expect(list.button.maybe("New note")).not.toBeInTheDocument();
  await click(q.button("New note"));
  expect(q.tab.all()).toHaveLength(4);
  expect(q.tab("Note 1")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Note 1")).toHaveTextContent("This note is empty.");
});
