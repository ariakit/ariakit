import { click, getByRole, press, render } from "ariakit-test-utils";
import { axe } from "jest-axe";
import Example from ".";

const getMenuButton = (name: string) => getByRole("button", { name });
const getMenuItem = (name: string) => getByRole("menuitemcheckbox", { name });

test("a11y", async () => {
  const { container } = render(<Example />);
  expect(await axe(container)).toHaveNoViolations();
});

test("update menu button label on menu item check", async () => {
  render(<Example />);
  expect(getMenuButton("Unwatch")).toBeInTheDocument();
  await click(getMenuButton("Unwatch"));
  await click(getMenuItem("Issues"));
  expect(getMenuButton("Watch")).toBeInTheDocument();
});

test("check/uncheck menu item on click", async () => {
  render(<Example />);
  await click(getMenuButton("Unwatch"));
  expect(getMenuItem("Releases")).toHaveAttribute("aria-checked", "false");
  await click(getMenuItem("Releases"));
  expect(getMenuItem("Releases")).toHaveAttribute("aria-checked", "true");
  await click(getMenuItem("Releases"));
  expect(getMenuItem("Releases")).toHaveAttribute("aria-checked", "false");
});

test("check/uncheck menu item on enter", async () => {
  render(<Example />);
  await press.Tab();
  await press.Enter();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(getMenuItem("Discussions")).toHaveAttribute("aria-checked", "false");
  await press.Enter();
  expect(getMenuItem("Discussions")).toHaveAttribute("aria-checked", "true");
  await press.Enter();
  expect(getMenuItem("Discussions")).toHaveAttribute("aria-checked", "false");
});

test("check/uncheck menu item on space", async () => {
  render(<Example />);
  await press.Tab();
  await press.Space();
  await press.End();
  expect(getMenuItem("Security alerts")).toHaveAttribute(
    "aria-checked",
    "false"
  );
  await press.Space();
  expect(getMenuItem("Security alerts")).toHaveAttribute(
    "aria-checked",
    "true"
  );
  await press.Space();
  expect(getMenuItem("Security alerts")).toHaveAttribute(
    "aria-checked",
    "false"
  );
});
