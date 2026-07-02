import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6319
// The page-freeze variant (two trailing items without value) is covered only
// by the browser test: on the buggy code, the keydown handler loops forever
// synchronously, which would hang the happy-dom worker instead of failing.
test("arrow keys on the closed select skip the trailing item without value", async () => {
  const combobox = q.combobox.ensure("Favorite color");
  await click(combobox);
  expect(q.option.ensure("Green")).toBeVisible();
  await press.Escape();
  expect(combobox).toHaveFocus();
  expect(combobox).toHaveTextContent("Green");
  await press.ArrowDown();
  expect(combobox).toHaveTextContent("Blue");
  // The only item after Blue has no value, so this should be a no-op
  await press.ArrowDown();
  expect(combobox).toHaveTextContent("Blue");
  await press.ArrowUp();
  expect(combobox).toHaveTextContent("Green");
});
