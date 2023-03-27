import {
  click,
  getByLabelText,
  getByRole,
  hover,
  press,
  sleep,
  type,
  waitFor,
} from "@ariakit/test";

const getMenuButton = () => getByRole("button", { name: "Edit" });
const getMenu = (name: string) =>
  getByLabelText(name, { selector: "[role='menu']" });
const getMenuItem = (name: string) => getByRole("menuitem", { name });

test("show/hide submenu on click", async () => {
  expect(getMenu("Edit")).not.toBeVisible();
  await click(getMenuButton());
  expect(getMenu("Edit")).toBeVisible();
  expect(getMenu("Find")).not.toBeVisible();
  await click(getMenuItem("Find"));
  expect(getMenu("Find")).toBeVisible();
  expect(getMenuItem("Find")).toHaveFocus();
  await click(getMenuItem("Find"));
  expect(getMenu("Find")).toBeVisible();
  expect(getMenuItem("Find")).toHaveFocus();
  await click(getMenuItem("Find Next"));
  expect(getMenu("Edit")).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("show/hide submenu on enter", async () => {
  await press.Tab();
  await press.Enter();
  await type("f");
  expect(getMenuItem("Find")).toHaveFocus();
  expect(getMenu("Find")).not.toBeVisible();
  await press.Enter();
  expect(getMenu("Find")).toBeVisible();
  expect(getMenuItem("Search the Web...")).toHaveFocus();
  await press.Enter();
  expect(getMenu("Edit")).not.toBeVisible();
  expect(getMenu("Find")).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("show/hide submenu on space", async () => {
  await press.Tab();
  await press.Space();
  await sleep();
  await type("s");
  expect(getMenuItem("Speech")).toHaveFocus();
  expect(getMenu("Speech")).not.toBeVisible();
  // Wait for typeahead delay
  await sleep(600);
  await press.Space();
  expect(getMenu("Speech")).toBeVisible();
  expect(getMenuItem("Start Speaking")).toHaveFocus();
  await press.Space();
  expect(getMenu("Edit")).not.toBeVisible();
  expect(getMenu("Speech")).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("show/hide submenu on arrow keys", async () => {
  await press.Tab();
  await press.Enter();
  await type("f");
  await press.ArrowLeft();
  expect(getMenu("Find")).not.toBeVisible();
  await press.ArrowRight();
  expect(getMenu("Find")).toBeVisible();
  expect(getMenuItem("Search the Web...")).toHaveFocus();
  await press.ArrowRight();
  expect(getMenu("Find")).toBeVisible();
  expect(getMenuItem("Search the Web...")).toHaveFocus();
  await press.ArrowDown();
  expect(getMenuItem("Find...")).toHaveFocus();
  await press.ArrowDown();
  expect(getMenuItem("Find Next")).toHaveFocus();
  await press.ArrowDown();
  expect(getMenuItem("Find Previous")).toHaveFocus();
  await press.ArrowDown();
  expect(getMenuItem("Find Previous")).toHaveFocus();
  await press.ArrowLeft();
  expect(getMenuItem("Find")).toHaveFocus();
  expect(getMenu("Find")).not.toBeVisible();
});

test("show/hide submenu on mouse hover", async () => {
  await click(getMenuButton());
  await hover(getMenuItem("Find"));
  expect(getMenuItem("Find")).toHaveFocus();
  // The submenu shouldn't be immediately visible
  expect(getMenu("Find")).not.toBeVisible();
  // Wait for show timeout
  await waitFor(() => expect(getMenu("Find")).toBeVisible());
  expect(getMenuItem("Find")).toHaveFocus();
  // Hover on submenu item
  await hover(getMenuItem("Find Next"));
  expect(getMenu("Find")).toBeVisible();
  expect(getMenu("Find")).toHaveFocus();
  expect(getMenuItem("Find Next")).toHaveAttribute("data-active-item");
  // Hover on an adjacent submenu button
  await hover(getMenuItem("Speech"));
  expect(getMenuItem("Speech")).toHaveFocus();
  expect(getMenu("Find")).not.toBeVisible();
  expect(getMenu("Speech")).not.toBeVisible();
  await waitFor(() => expect(getMenu("Speech")).toBeVisible());
});

test("hide submenu on escape", async () => {
  await click(getMenuButton());
  await click(getMenuItem("Find"));
  await hover(getMenuItem("Find Next"));
  await press.Escape();
  expect(getMenu("Find")).not.toBeVisible();
  expect(getMenu("Edit")).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

test("typeahead on submenu", async () => {
  await click(getMenuButton());
  await type("f");
  await press.Enter();
  expect(getMenuItem("Search the Web...")).toHaveFocus();
  await type("f");
  expect(getMenuItem("Find...")).toHaveFocus();
  await type("fffff");
  expect(getMenuItem("Find Previous")).toHaveFocus();
});
