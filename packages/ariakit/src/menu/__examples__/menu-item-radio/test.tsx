import { click, getByRole, press, render } from "ariakit-test";
import { axe } from "jest-axe";
import Example from ".";

const getMenuButton = (name: string) => getByRole("button", { name });
const getMenuItem = (name: string) => getByRole("menuitemradio", { name });

test("a11y", async () => {
  const { container } = render(<Example />);
  await click(getMenuButton("View all"));
  expect(await axe(container)).toHaveNoViolations();
});

test("update menu button label on menu item check", async () => {
  render(<Example />);
  await click(getMenuButton("View all"));
  await click(getMenuItem("Unread"));
  expect(getMenuButton("View unread")).toBeInTheDocument();
});

test("update checked menu item on click", async () => {
  render(<Example />);
  await click(getMenuButton("View all"));
  await click(getMenuItem("Read"));
  expect(getMenuItem("Read")).toHaveAttribute("aria-checked", "true");
  expect(getMenuButton("View read")).toBeInTheDocument();
});

test("update checked menu item on enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  await press.ArrowDown();
  await press.Enter();
  expect(getMenuItem("Read")).toHaveAttribute("aria-checked", "true");
  expect(getMenuButton("View read")).toBeInTheDocument();
});

test("update checked menu item on space", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  await press.ArrowDown();
  await press.Space();
  expect(getMenuItem("Read")).toHaveAttribute("aria-checked", "true");
  expect(getMenuButton("View read")).toBeInTheDocument();
});
