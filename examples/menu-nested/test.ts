import { click, hover, press, q, sleep, type, waitFor } from "@ariakit/test";

test("show/hide submenu on click", async () => {
  expect(q.menu("Edit")).not.toBeInTheDocument();
  await click(q.button("Edit"));
  expect(q.menu("Edit")).toBeVisible();
  expect(q.menu("Find")).not.toBeInTheDocument();
  await click(q.menuitem("Find"));
  expect(q.menu("Find")).toBeVisible();
  expect(q.menuitem("Find")).toHaveFocus();
  await click(q.menuitem("Find"));
  expect(q.menu("Find")).toBeVisible();
  expect(q.menuitem("Find")).toHaveFocus();
  await click(q.menuitem("Find Next"));
  expect(q.menu("Edit")).not.toBeInTheDocument();
  expect(q.button("Edit")).toHaveFocus();
});

test("show/hide submenu on enter", async () => {
  await press.Tab();
  await press.Enter();
  await type("f");
  expect(q.menuitem("Find")).toHaveFocus();
  expect(q.menu("Find")).not.toBeInTheDocument();
  await press.Enter();
  expect(q.menu("Find")).toBeVisible();
  expect(q.menuitem("Search the Web...")).toHaveFocus();
  await press.Enter();
  expect(q.menu("Edit")).not.toBeInTheDocument();
  expect(q.menu("Find")).not.toBeInTheDocument();
  expect(q.button("Edit")).toHaveFocus();
});

test("show/hide submenu on space", async () => {
  await press.Tab();
  await press.Space();
  await sleep();
  await type("s");
  expect(q.menuitem("Speech")).toHaveFocus();
  expect(q.menu("Speech")).not.toBeInTheDocument();
  // Wait for typeahead delay
  await sleep(600);
  await press.Space();
  expect(q.menu("Speech")).toBeVisible();
  expect(q.menuitem("Start Speaking")).toHaveFocus();
  await press.Space();
  expect(q.menu("Edit")).not.toBeInTheDocument();
  expect(q.menu("Speech")).not.toBeInTheDocument();
  expect(q.button("Edit")).toHaveFocus();
});

test("show/hide submenu on arrow keys", async () => {
  await press.Tab();
  await press.Enter();
  await type("f");
  await press.ArrowLeft();
  expect(q.menu("Find")).not.toBeInTheDocument();
  await press.ArrowRight();
  expect(q.menu("Find")).toBeVisible();
  expect(q.menuitem("Search the Web...")).toHaveFocus();
  await press.ArrowRight();
  expect(q.menu("Find")).toBeVisible();
  expect(q.menuitem("Search the Web...")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitem("Find...")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitem("Find Next")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitem("Find Previous")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitem("Find Previous")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.menuitem("Find")).toHaveFocus();
  expect(q.menu("Find")).not.toBeInTheDocument();
});

test("show/hide submenu on mouse hover", async () => {
  await click(q.button("Edit"));
  await hover(q.menuitem("Find"));
  expect(q.menuitem("Find")).toHaveFocus();
  // The submenu shouldn't be immediately visible
  expect(q.menu("Find")).not.toBeInTheDocument();
  // Wait for show timeout
  await waitFor(() => expect(q.menu("Find")).toBeVisible());
  expect(q.menuitem("Find")).toHaveFocus();
  // Hover on submenu item
  await hover(q.menuitem("Find Next"));
  expect(q.menu("Find")).toBeVisible();
  expect(q.menu("Find")).toHaveFocus();
  expect(q.menuitem("Find Next")).toHaveAttribute("data-active-item");
  // Hover on an adjacent submenu button
  await hover(q.menuitem("Speech"));
  expect(q.menuitem("Speech")).toHaveFocus();
  expect(q.menu("Find")).not.toBeInTheDocument();
  expect(q.menu("Speech")).not.toBeInTheDocument();
  await waitFor(() => expect(q.menu("Speech")).toBeVisible());
});

test("hide submenu on escape", async () => {
  await click(q.button("Edit"));
  await click(q.menuitem("Find"));
  await hover(q.menuitem("Find Next"));
  await press.Escape();
  expect(q.menu("Find")).not.toBeInTheDocument();
  expect(q.menu("Edit")).not.toBeInTheDocument();
  expect(q.button("Edit")).toHaveFocus();
});

test("typeahead on submenu", async () => {
  await click(q.button("Edit"));
  await type("f");
  await press.Enter();
  expect(q.menuitem("Search the Web...")).toHaveFocus();
  await type("f");
  expect(q.menuitem("Find...")).toHaveFocus();
  await type("fffff");
  expect(q.menuitem("Find Previous")).toHaveFocus();
});

test("blur submenu button on mouse leave after hovering over disabled submenu item", async () => {
  await click(q.button("Edit"));
  await hover(q.menuitem("Speech"));
  await hover(await q.menuitem.wait("Stop Speaking"));
  await hover(document.body);
  expect(q.menu("Speech")).not.toBeInTheDocument();
  expect(q.menuitem("Speech")).not.toHaveAttribute("data-active-item");
});
