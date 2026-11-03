import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("selects the last tab with the End key", async () => {
  await click(q.tab("Overview"));
  await press.End();
  expect(q.tab("Changelog")).toHaveFocus();
  expect(q.tabpanel("Changelog")).toHaveTextContent("The Changelog page.");
});
