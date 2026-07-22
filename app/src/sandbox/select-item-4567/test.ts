import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/4567
test("exposes and updates the SelectItem selected state", async () => {
  await click(q.combobox("Favorite fruits"));
  expect(q.option("Apple (selected)")).toBeVisible();
  expect(q.option("Banana (not selected)")).toBeVisible();

  await click(q.option("Banana (not selected)"));
  expect(q.option("Banana (selected)")).toBeVisible();

  await click(q.option("Apple (selected)"));
  expect(q.option("Apple (not selected)")).toBeVisible();
});
