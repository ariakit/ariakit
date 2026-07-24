import { click, q } from "@ariakit/test";
import { beforeEach, describe, expect, test } from "vitest";

// Registered by the consolidated test entry point.
describe("select-item-4567", () => {
  beforeEach(async () => {
    await click(q.button("Show select-item-4567"));
  });

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
});
