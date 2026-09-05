import { init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createMenubarStore } from "../menubar/menubar-store.ts";
import { createMenuStore } from "./menu-store.ts";

test("places submenus beside the items of a vertical parent menu", () => {
  const parent = createMenuStore();
  const submenu = createMenuStore({ parent });
  const stop = init(submenu);
  expect(submenu.getState().placement).toBe("right-start");
  parent.setState("orientation", "horizontal");
  expect(submenu.getState().placement).toBe("bottom-start");
  stop();
});

// https://github.com/ariakit/ariakit/issues/7410
test("places menus beside the items of a vertical menubar", () => {
  const menubar = createMenubarStore({ orientation: "vertical" });
  const menu = createMenuStore({ menubar });
  const stop = init(menu);
  expect(menu.getState().placement).toBe("right-start");
  menubar.setState("orientation", "horizontal");
  expect(menu.getState().placement).toBe("bottom-start");
  stop();
});

test("follows the parent menu instead of the menubar", () => {
  const menubar = createMenubarStore({ orientation: "vertical" });
  const parent = createMenuStore({ menubar, orientation: "horizontal" });
  const submenu = createMenuStore({ parent, menubar });
  const stop = init(submenu);
  expect(submenu.getState().placement).toBe("bottom-start");
  stop();
});

test("keeps an explicit placement in a vertical menubar", () => {
  const menubar = createMenubarStore({ orientation: "vertical" });
  const menu = createMenuStore({ menubar, placement: "left-start" });
  const stop = init(menu);
  expect(menu.getState().placement).toBe("left-start");
  menubar.setState("orientation", "horizontal");
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
