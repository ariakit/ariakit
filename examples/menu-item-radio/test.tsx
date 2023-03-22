import { click, getByRole, press, render } from "@ariakit/test";
import Example from "./index.jsx";

const getMenuButton = (name: string) => getByRole("button", { name });
const getMenuItem = (name: string) => getByRole("menuitemradio", { name });

test("default checked menu item", async () => {
  render(<Example />);
  await click(getMenuButton("Sort"));
  expect(getMenuItem("Popular")).toHaveAttribute("aria-checked", "true");
});

test("update checked menu item on click", async () => {
  render(<Example />);
  await click(getMenuButton("Sort"));
  await click(getMenuItem("Newest"));
  expect(getMenuItem("Newest")).toHaveAttribute("aria-checked", "true");
});

test("update checked menu item on enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  await press.ArrowDown();
  await press.Enter();
  expect(getMenuItem("Newest")).toHaveAttribute("aria-checked", "true");
});

test("update checked menu item on space", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  await press.ArrowDown();
  await press.Space();
  expect(getMenuItem("Newest")).toHaveAttribute("aria-checked", "true");
});
