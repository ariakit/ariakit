import { click, press, q, type } from "@ariakit/test";

test("update menu button label on menu item check", async () => {
  expect(q.button("Unwatch")).toBeInTheDocument();
  await click(q.button("Unwatch"));
  await click(q.menuitemcheckbox("Issues"));
  expect(q.button("Watch")).toBeInTheDocument();
});

test("check/uncheck menu item on click", async () => {
  await click(q.button("Unwatch"));
  expect(q.menuitemcheckbox("Issues")).toHaveAttribute("aria-checked", "true");
  await click(q.menuitemcheckbox("Issues"));
  expect(q.menuitemcheckbox("Issues")).toHaveAttribute("aria-checked", "false");
  expect(q.menuitemcheckbox("Releases")).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await click(q.menuitemcheckbox("Releases"));
  expect(q.menuitemcheckbox("Releases")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await click(q.menuitemcheckbox("Releases"));
  expect(q.menuitemcheckbox("Releases")).toHaveAttribute(
    "aria-checked",
    "false",
  );
});

test("check/uncheck menu item on enter", async () => {
  await press.Tab();
  await press.Enter();
  await press.ArrowDown();
  await press.ArrowDown();
  await press.ArrowDown();
  expect(q.menuitemcheckbox("Discussions")).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await press.Enter();
  expect(q.menuitemcheckbox("Discussions")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await press.Enter();
  expect(q.menuitemcheckbox("Discussions")).toHaveAttribute(
    "aria-checked",
    "false",
  );
});

test("check/uncheck menu item on space", async () => {
  await press.Tab();
  await press.Space();
  await press.End();
  expect(q.menuitemcheckbox("Security alerts")).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await press.Space();
  expect(q.menuitemcheckbox("Security alerts")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await press.Space();
  expect(q.menuitemcheckbox("Security alerts")).toHaveAttribute(
    "aria-checked",
    "false",
  );
});

test("typeahead", async () => {
  await click(q.button("Unwatch"));
  await type("d");
  expect(q.menuitemcheckbox("Discussions")).toHaveFocus();
});
