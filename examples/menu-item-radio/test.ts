import { click, press, q } from "@ariakit/test";

test("default checked menu item", async () => {
  await click(q.button("Sort"));
  expect(q.menuitemradio("Popular")).toHaveAttribute("aria-checked", "true");
});

test("update checked menu item on click", async () => {
  await click(q.button("Sort"));
  await click(q.menuitemradio("Newest"));
  expect(q.menuitemradio("Newest")).toHaveAttribute("aria-checked", "true");
});

test("update checked menu item on enter", async () => {
  await press.Tab();
  await press.Enter();
  await press.ArrowDown();
  await press.Enter();
  expect(q.menuitemradio("Newest")).toHaveAttribute("aria-checked", "true");
});

test("update checked menu item on space", async () => {
  await press.Tab();
  await press.Space();
  await press.ArrowDown();
  await press.Space();
  expect(q.menuitemradio("Newest")).toHaveAttribute("aria-checked", "true");
});
