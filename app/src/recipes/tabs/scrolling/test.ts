import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("selects the last tab with the End key", async () => {
  await click(q.tab("Overview"));
  await press.End();
  expect(q.tab("Changelog")).toHaveFocus();
  expect(q.tabpanel("Changelog")).toHaveTextContent("The Changelog page.");
});

test("renders the scroll buttons outside the tab list", () => {
  const list = q.tablist("Documentation");
  expect(q.button("Previous tabs")).toBeInTheDocument();
  expect(q.button("Next tabs")).toBeInTheDocument();
  expect(q.within(list).button.maybe("Previous tabs")).not.toBeInTheDocument();
  expect(q.within(list).button.maybe("Next tabs")).not.toBeInTheDocument();
});
