import { click, press, q } from "@ariakit/test";
import { screen } from "@testing-library/dom";

let count = 0;
test.only("check/uncheck on click", async () => {
  console.log("Test only", count++);
  screen.debug();
  console.log(new Error((count++).toString()));

  expect(q.labeled("Apple")).toHaveAttribute("aria-checked", "false");
  expect(q.labeled("Orange")).toHaveAttribute("aria-checked", "false");
  expect(q.labeled("Mango")).toHaveAttribute("aria-checked", "false");
  await click(q.labeled("Apple"));
  expect(q.labeled("Apple")).toHaveAttribute("aria-checked", "true");
  expect(q.labeled("Orange")).toHaveAttribute("aria-checked", "false");
  expect(q.labeled("Mango")).toHaveAttribute("aria-checked", "false");
  await click(q.labeled("Apple"));
  await click(q.labeled("Mango"));
  expect(q.labeled("Apple")).toHaveAttribute("aria-checked", "false");
  expect(q.labeled("Orange")).toHaveAttribute("aria-checked", "false");
  expect(q.labeled("Mango")).toHaveAttribute("aria-checked", "true");
});

test("space", async () => {
  await press.Tab();
  expect(q.labeled("Apple")).toHaveFocus();
  expect(q.labeled("Apple")).not.toBeChecked();
  await press.Space();
  expect(q.labeled("Apple")).toHaveFocus();
  expect(q.labeled("Apple")).toBeChecked();
  await press.Tab();
  await press.Space();
  expect(q.labeled("Apple")).not.toHaveFocus();
  expect(q.labeled("Orange")).toHaveFocus();
  expect(q.labeled("Apple")).toBeChecked();
  expect(q.labeled("Orange")).toBeChecked();
});
