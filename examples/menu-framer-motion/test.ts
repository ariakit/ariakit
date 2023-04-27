import { version } from "react";
import { click, getByRole, press, queryByRole, waitFor } from "@ariakit/test";

const getMenuButton = () => getByRole("button", { name: "Options" });
const getMenu = () => queryByRole("menu");
const getMenuItem = (name: string) => getByRole("menuitem", { name });

const is17 = version.startsWith("17");

describe.skipIf(is17)("menu-framer-motion", () => {
  test("show/hide on click", async () => {
    expect(getMenu()).not.toBeInTheDocument();
    await click(getMenuButton());
    expect(getMenu()).toBeVisible();
    expect(getMenu()).toHaveFocus();
    await click(getMenuButton());
    expect(getMenuButton()).toHaveFocus();
    expect(getMenu()).toBeVisible();
    await waitFor(() => expect(getMenu()).not.toBeInTheDocument());
  });

  test("show/hide on enter", async () => {
    expect(getMenu()).not.toBeInTheDocument();
    await press.Tab();
    await press.Enter();
    expect(getMenu()).toBeVisible();
    expect(getMenuItem("Edit")).toHaveFocus();
    await press.ShiftTab();
    await press.Enter();
    expect(getMenuButton()).toHaveFocus();
    expect(getMenu()).toBeVisible();
    await waitFor(() => expect(getMenu()).not.toBeInTheDocument());
  });

  test("show/hide on space", async () => {
    expect(getMenu()).not.toBeInTheDocument();
    await press.Tab();
    await press.Space();
    expect(getMenu()).toBeVisible();
    expect(getMenuItem("Edit")).toHaveFocus();
    await press.ShiftTab();
    await press.Space();
    expect(getMenuButton()).toHaveFocus();
    expect(getMenu()).toBeVisible();
    await waitFor(() => expect(getMenu()).not.toBeInTheDocument());
  });

  test("hide on esc", async () => {
    expect(getMenu()).not.toBeInTheDocument();
    await click(getMenuButton());
    await press.Escape();
    expect(getMenuButton()).toHaveFocus();
    expect(getMenu()).toBeVisible();
    await waitFor(() => expect(getMenu()).not.toBeInTheDocument());
  });

  test("hide on click outside", async () => {
    expect(getMenu()).not.toBeInTheDocument();
    await click(getMenuButton());
    await click(document.body);
    expect(getMenuButton()).toHaveFocus();
    expect(getMenu()).toBeVisible();
    await waitFor(() => expect(getMenu()).not.toBeInTheDocument());
  });
});
