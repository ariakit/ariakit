// @vitest-environment jsdom
// The "check/uncheck item after filtering" test relies on React concurrent
// rendering to settle the filtered list; under happy-dom's faster rAF cadence it
// doesn't settle in time on slower CI, failing there even with a retry (it
// passes locally). Pinned to jsdom.
import { click, press, q } from "@ariakit/test";
import "../combobox-multiple/test.ts";
import { expect, test } from "vitest";

test("click on listbox then move through items with keyboard", async () => {
  await click(q.combobox());
  expect(q.combobox()).toHaveFocus();
  await click(q.listbox());
  expect(q.listbox()).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
  expect(q.combobox()).toHaveFocus();
});
