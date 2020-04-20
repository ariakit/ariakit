import * as React from "react";
import { render, press, hover, click, wait } from "reakit-test-utils";
import MenuWithSubmenu from "..";

test("open menu", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  expect(label("Bookmarks")).not.toBeVisible();
  click(text("Bookmarks"));
  await wait(expect(label("Bookmarks")).toBeVisible);
  await wait(expect(text("Bookmark Manager")).toHaveFocus);
});

test("open dialog", async () => {
  const { getByText: text, getByLabelText: label, getByRole: role } = render(
    <MenuWithSubmenu />
  );
  click(text("Bookmarks"));
  click(role("menuitem", { name: "Bookmark This Tab..." }));
  await wait(expect(label("Bookmark This Tab...")).toBeVisible);
  await wait(expect(text("Cancel")).toHaveFocus);
});

test("close dialog", async () => {
  const { getByText: text, getByLabelText: label, getByRole: role } = render(
    <MenuWithSubmenu />
  );
  click(text("Bookmarks"));
  press.ArrowDown();
  press.Enter();
  await wait(expect(label("Bookmark This Tab...")).toBeVisible);
  await wait(expect(text("Cancel")).toHaveFocus);
  press.Enter();
  await wait(expect(label("Bookmark This Tab...")).not.toBeVisible);
  await wait(
    expect(role("menuitem", { name: "Bookmark This Tab..." })).toHaveFocus
  );
});

test("hover menu items with dialog open", async () => {
  const { getByText: text, getByLabelText: label } = render(
    <MenuWithSubmenu />
  );
  click(text("Bookmarks"));
  press.ArrowDown();
  press.Enter();
  await wait(expect(label("Bookmark This Tab...")).toBeVisible);
  hover(text("Bookmark Manager"));
  expect(label("Bookmark This Tab...")).toBeVisible();
});
