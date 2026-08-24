import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/7114
test("automatically extends and shrinks a keyboard range", async () => {
  await click(q.combobox("Favorite food"));
  await press.ArrowDown();
  expect(q.option("Candy")).toHaveFocus();

  await press.ArrowDown(undefined, { shiftKey: true });
  expect(q.option("Carrot")).toHaveFocus();
  expect(q.status("Automatic selection")).toHaveTextContent(
    "4 selected: Apple, Cake, Candy, Carrot",
  );

  await press.ArrowUp(undefined, { shiftKey: true });
  expect(q.option("Candy")).toHaveFocus();
  expect(q.status("Automatic selection")).toHaveTextContent(
    "3 selected: Apple, Cake, Candy",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps unmodified clicks as one-value toggles", async () => {
  await click(q.combobox("Favorite food"));
  await click(q.option("Chocolate"));

  expect(q.status("Automatic selection")).toHaveTextContent(
    "3 selected: Apple, Cake, Chocolate",
  );
  expect(q.option("Candy")).toHaveAttribute("aria-selected", "false");
});

// https://github.com/ariakit/ariakit/issues/7114
test("automatically extends a Shift-click range", async () => {
  await click(q.combobox("Favorite food"));
  await click(q.option("Candy"));
  await click(q.option("Chocolate"), { shiftKey: true });

  expect(q.status("Automatic selection")).toHaveTextContent(
    "6 selected: Apple, Cake, Candy, Carrot, Cherry, Chocolate",
  );
  expect(q.option("Carrot")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Cherry")).toHaveAttribute("aria-selected", "true");
});
