import { click, getByRole, press, type } from "@ariakit/test";

const getMenuButton = (name: string) => getByRole("button", { name });
const getMenuItem = (name: string) => getByRole("menuitemcheckbox", { name });

test("update menu button label on menu item check", async () => {
  expect(getMenuButton("Unwatch")).toBeInTheDocument();
  await click(getMenuButton("Unwatch"));
  await click(getMenuItem("Issues"));
  expect(getMenuButton("Watch")).toBeInTheDocument();
});

test("check/uncheck menu item on click", async () => {
  await click(getMenuButton("Unwatch"));
  expect(getMenuItem("Issues")).toHaveAttribute("aria-checked", "true");
  await click(getMenuItem("Issues"));
  expect(getMenuItem("Issues")).toHaveAttribute("aria-checked", "false");
  expect(getMenuItem("Releases")).toHaveAttribute("aria-checked", "false");
  await click(getMenuItem("Releases"));
  expect(getMenuItem("Releases")).toHaveAttribute("aria-checked", "true");
  await click(getMenuItem("Releases"));
  expect(getMenuItem("Releases")).toHaveAttribute("aria-checked", "false");
});

test("check/uncheck menu item on enter", async () => {
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

test("typeahead", async () => {
  await click(getMenuButton("Unwatch"));
  await type("d");
  expect(getMenuItem("Discussions")).toHaveFocus();
});
