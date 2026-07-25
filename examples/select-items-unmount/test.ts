import { click, q, sleep } from "@ariakit/test";
import { expect, test, vi } from "vitest";
import { testSelect } from "../select/select-tests.ts";

testSelect("combobox");

test("scroll the selected item into view on open", async () => {
  using scrollIntoView = vi.spyOn(HTMLElement.prototype, "scrollIntoView");
  await click(q.combobox());
  await sleep();
  expect(scrollIntoView.mock.contexts).toContain(q.option("Apple"));
});
