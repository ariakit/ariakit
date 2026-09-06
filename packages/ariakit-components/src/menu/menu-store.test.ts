import { init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createComboboxStore } from "../combobox/combobox-store.ts";
import { createMenubarStore } from "../menubar/menubar-store.ts";
import { createPopoverStore } from "../popover/popover-store.ts";
import { createMenuStore } from "./menu-store.ts";

// https://github.com/ariakit/ariakit/issues/7410
test("places menus beside the items of a vertical menubar", () => {
  const menubar = createMenubarStore({ orientation: "vertical" });
  const menu = createMenuStore({ menubar });
  expect(menu.getState().placement).toBe("right-start");
  const stop = init(menu);
  expect(menu.getState().placement).toBe("right-start");
  stop();
});

test("places menus below the items of a horizontal menubar", () => {
  const menubar = createMenubarStore({ orientation: "horizontal" });
  const menu = createMenuStore({ menubar });
  expect(menu.getState().placement).toBe("bottom-start");
});

test("places submenus beside the items of a vertical parent menu", () => {
  const parent = createMenuStore();
  const submenu = createMenuStore({ parent });
  expect(submenu.getState().placement).toBe("right-start");
});

test("places submenus below the items of a horizontal parent menu", () => {
  const parent = createMenuStore({ orientation: "horizontal" });
  const submenu = createMenuStore({ parent });
  expect(submenu.getState().placement).toBe("bottom-start");
});

test("follows the parent menu instead of the menubar", () => {
  const menubar = createMenubarStore({ orientation: "vertical" });
  const parent = createMenuStore({ menubar, orientation: "horizontal" });
  const submenu = createMenuStore({ parent, menubar });
  expect(submenu.getState().placement).toBe("bottom-start");
});

test("keeps an explicit placement in a vertical menubar", () => {
  const menubar = createMenubarStore({ orientation: "vertical" });
  const menu = createMenuStore({ menubar, placement: "left-start" });
  const stop = init(menu);
  expect(menu.getState().placement).toBe("left-start");
  stop();
});

test("keeps an explicit placement in a vertical parent menu", () => {
  const parent = createMenuStore();
  const submenu = createMenuStore({ parent, placement: "left-start" });
  const stop = init(submenu);
  expect(submenu.getState().placement).toBe("left-start");
  stop();
});

// A store passed with the `store` or `popover` option carries the placement it
// already holds, which the derived default must not replace, the same way it
// gives way to an explicit placement.
// A popover store is merged below the menu, inside the hovercard store, so it
// applies its placement while the menu store initializes rather than when the
// menu store resolves its own.
test("keeps the placement of a popover store passed to a submenu", () => {
  const parent = createMenuStore();
  const submenu = createMenuStore({ parent, popover: createPopoverStore() });
  expect(submenu.getState().placement).toBe("right-start");
  const stop = init(submenu);
  expect(submenu.getState().placement).toBe("bottom");
  stop();
});

// The first assertion pins the order of the defaultValue call: a store merged
// into the menu is resolved before the derived default, so the placement
// changes across initialization only when an explicit placement outranked the
// store there, and no first render has to be corrected here.
test("keeps the placement of a store passed to a submenu", () => {
  const parent = createMenuStore();
  const submenu = createMenuStore({ parent, store: createMenuStore() });
  expect(submenu.getState().placement).toBe("bottom-start");
  const stop = init(submenu);
  expect(submenu.getState().placement).toBe("bottom-start");
  stop();
});

test("keeps the derived placement of a store created in the same menu", () => {
  const parent = createMenuStore();
  const submenu = createMenuStore({
    parent,
    store: createMenuStore({ parent }),
  });
  const stop = init(submenu);
  expect(submenu.getState().placement).toBe("right-start");
  stop();
});

// The combobox store shares the popover state of the menu that renders it, but
// the menu is the element that gets placed, so it keeps its own placement and
// the current placement that follows from it.
test("keeps the derived placement of a submenu with a combobox", () => {
  const parent = createMenuStore();
  const submenu = createMenuStore({ parent, combobox: createComboboxStore() });
  const stop = init(submenu);
  expect(submenu.getState().placement).toBe("right-start");
  expect(submenu.getState().currentPlacement).toBe("right-start");
  stop();
});

test("keeps an explicit placement of a menu with a combobox", () => {
  const combobox = createComboboxStore({ placement: "top" });
  const menu = createMenuStore({ combobox, placement: "left-start" });
  const stop = init(menu);
  expect(menu.getState().placement).toBe("left-start");
  stop();
});
