import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

const options = ["Lemon", "Lime", "Orange", "Apple", "Banana"] as const;

// https://github.com/ariakit/ariakit/issues/6301
test("sets sequential option positions across groups and leaves", async () => {
  await click(q.combobox("Fruit"));

  for (const [index, name] of options.entries()) {
    const option = q.option(name);
    expect(option).toHaveAttribute("aria-setsize", "5");
    expect(option).toHaveAttribute("aria-posinset", `${index + 1}`);
  }
});

test("SelectRenderer forwards horizontal orientation to the item layout", async () => {
  await click(q.combobox("Favorite fruit"));

  expect(q.option("Cherry")).toHaveStyle({ left: "192px", top: "0px" });
});
