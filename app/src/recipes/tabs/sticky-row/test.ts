import { click, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the action of the sidebar button in its tooltip and keeps the button name", async () => {
  const toggle = q.button("Toggle sidebar");
  await hover(toggle);
  expect(await q.tooltip.wait("Open sidebar")).toBeVisible();
  await click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(await q.tooltip.wait("Close sidebar")).toBeVisible();
});

test("shows the name of the new note button in its tooltip", async () => {
  await hover(q.button("New note"));
  expect(await q.tooltip.wait("New note")).toBeVisible();
});

test("opens and closes the sidebar with the toggle button", async () => {
  const toggle = q.button("Toggle sidebar");
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  await click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  await click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("renders the buttons outside the tab list", () => {
  const list = q.within(q.tablist("Open notes"));
  expect(q.tab.all()).toHaveLength(3);
  for (const name of ["Toggle sidebar", "New note"]) {
    expect(q.button(name)).toBeInTheDocument();
    expect(list.button.maybe(name)).not.toBeInTheDocument();
  }
});

test("keeps the selected tab when the sidebar opens", async () => {
  await click(q.tab("Workshop"));
  await click(q.button("Toggle sidebar"));
  expect(q.tab("Workshop")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Workshop")).toHaveTextContent("Sand the shelf");
});

test("opens a note in a new tab and closes it with Delete", async () => {
  await click(q.button("New note"));
  expect(q.tab.all()).toHaveLength(4);
  expect(q.tab("Note 1")).toHaveAttribute("aria-selected", "true");
  expect(q.tabpanel("Note 1")).toHaveTextContent("This note is empty.");
  await click(q.tab("Note 1"));
  await press.Delete();
  expect(q.tab.maybe("Note 1")).not.toBeInTheDocument();
  expect(q.tab("Groceries")).toHaveFocus();
  expect(q.tab("Groceries")).toHaveAttribute("aria-selected", "true");
});
