import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6345
test("onChange commits the value on arrow-key selection", async () => {
  const apple = q.radio.ensure("apple");
  const orange = q.radio.ensure("orange");

  await click(apple);
  expect(apple).toBeChecked();
  expect(q.text("Selected fruit: apple")).toBeInTheDocument();

  await press.ArrowDown();
  expect(orange).toHaveFocus();
  expect(orange).toBeChecked();
  expect(q.text("Selected fruit: orange")).toBeInTheDocument();

  await press.ArrowUp();
  expect(apple).toHaveFocus();
  expect(apple).toBeChecked();
  expect(q.text("Selected fruit: apple")).toBeInTheDocument();
});
