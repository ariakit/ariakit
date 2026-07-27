import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/select-item-custom/test.ts
test("renders custom values and restores a moved value on escape", async () => {
  const select = q.combobox("Account");
  expect(select).toHaveTextContent("John Doe");
  await click(select);
  await press.ArrowUp();
  expect(select).toHaveTextContent("Jane Doe");
  await press.Enter();

  await press.Enter();
  await press.End();
  expect(select).toHaveTextContent("Sonia Poe");
  await press.Escape();
  expect(select).toHaveTextContent("Jane Doe");
});
