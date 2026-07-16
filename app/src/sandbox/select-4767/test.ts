import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/4767
test("clears focus-visible when focus moves to another option", async () => {
  await click(q.combobox("Favorite fruit"));
  const apple = q.option("Apple");
  expect(document.activeElement).toBe(apple);

  await press.ArrowDown();
  const banana = q.option("Banana");
  expect(document.activeElement).toBe(banana);
  expect(banana).toHaveAttribute("data-focus-visible", "true");

  await press.ArrowDown();

  const orange = q.option("Orange");
  expect(document.activeElement).toBe(orange);
  expect(orange).toHaveAttribute("data-focus-visible", "true");
  expect(apple).not.toHaveAttribute("data-focus-visible");
  expect(banana).not.toHaveAttribute("data-focus-visible");
});
