import { click, getByRole, press } from "@ariakit/test";

const getMenuButton = (name: string) => getByRole("button", { name });
const getMenuItem = (name: string) => getByRole("menuitemradio", { name });

test("default checked menu item", async () => {
  await click(getMenuButton("Sort"));
  expect(getMenuItem("Popular")).toHaveAttribute("aria-checked", "true");
});

test("update checked menu item on click", async () => {
  await click(getMenuButton("Sort"));
  await click(getMenuItem("Newest"));
  expect(getMenuItem("Newest")).toHaveAttribute("aria-checked", "true");
});

test("update checked menu item on enter", async () => {
  await press.Tab();
  await press.Enter();
  await press.ArrowDown();
  await press.Enter();
  expect(getMenuItem("Newest")).toHaveAttribute("aria-checked", "true");
});

test("update checked menu item on space", async () => {
  await press.Tab();
  await press.Space();
  await press.ArrowDown();
  await press.Space();
  expect(getMenuItem("Newest")).toHaveAttribute("aria-checked", "true");
});
