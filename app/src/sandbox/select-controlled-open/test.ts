import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-default-open-controlled/test.ts
test("toggles a controlled popover from its initial open state", async () => {
  const select = q.combobox("Favorite fruit");
  expect(q.listbox()).toBeVisible();

  await click(select);
  expect(q.listbox()).not.toBeInTheDocument();

  await click(select);
  expect(q.listbox()).toBeVisible();
});
