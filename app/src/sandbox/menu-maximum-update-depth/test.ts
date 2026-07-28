import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders and independently opens sixty menu stores", async () => {
  const buttons = q.button.all("Menu");
  expect(buttons).toHaveLength(60);
  const lastButton = buttons.at(-1);
  if (!lastButton) return;
  await click(lastButton);
  expect(q.menu()).toBeVisible();
  expect(q.menuitem("A")).toBeVisible();
});
