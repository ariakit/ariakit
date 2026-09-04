import { createStore, init } from "@ariakit/store";
import { expect, onTestFinished, test } from "vitest";
import { createMenubarStore } from "../menubar/menubar-store.ts";
import { createPopoverStore } from "../popover/popover-store.ts";
import { createMenuStore } from "./menu-store.ts";

test("updates default placement with the menubar orientation and direction", () => {
  const menubar = createMenubarStore();
  const menu = createMenuStore({ menubar });
  onTestFinished(init(menu));

  expect(menu.getState().placement).toBe("bottom-start");
  menubar.setState("orientation", "vertical");
  expect(menu.getState().placement).toBe("right-start");
  menubar.setState("rtl", true);
  expect(menu.getState().placement).toBe("left-start");
  menubar.setState("orientation", "horizontal");
  expect(menu.getState().placement).toBe("bottom-start");
  menubar.setState("orientation", "vertical");
  expect(menu.getState().placement).toBe("left-start");
  menubar.setState("rtl", false);
  expect(menu.getState().placement).toBe("right-start");
});

test("preserves an explicit placement when the menubar changes", () => {
  const menubar = createMenubarStore({ orientation: "vertical" });
  const menu = createMenuStore({ menubar, placement: "top-end" });
  onTestFinished(init(menu));

  expect(menu.getState().placement).toBe("top-end");
  menubar.setState("rtl", true);
  expect(menu.getState().placement).toBe("top-end");
  menubar.setState("orientation", "horizontal");
  expect(menu.getState().placement).toBe("top-end");
});

test("preserves placement from a synchronized store when the menubar changes", () => {
  const menubar = createMenubarStore({ orientation: "vertical" });
  const store = createStore({ placement: "top-end" as const });
  const menu = createMenuStore({ menubar, store });
  onTestFinished(init(menu));

  expect(menu.getState().placement).toBe("top-end");
  menubar.setState("rtl", true);
  expect(menu.getState().placement).toBe("top-end");
  menubar.setState("orientation", "horizontal");
  expect(menu.getState().placement).toBe("top-end");
});

test("preserves placement from a synchronized popover when the menubar changes", () => {
  const menubar = createMenubarStore();
  const popover = createPopoverStore({ placement: "top-end" });
  const menu = createMenuStore({ menubar, popover });
  onTestFinished(init(menu));

  expect(menu.getState().placement).toBe("top-end");
  menubar.setState("rtl", true);
  expect(menu.getState().placement).toBe("top-end");
  expect(popover.getState().placement).toBe("top-end");
  menubar.setState("orientation", "vertical");
  expect(menu.getState().placement).toBe("top-end");
  expect(popover.getState().placement).toBe("top-end");
  popover.setState("placement", "bottom-end");
  expect(menu.getState().placement).toBe("bottom-end");
});

test("derives nested menu placement from its parent menu", () => {
  const menubar = createMenubarStore();
  const parent = createMenuStore({ menubar });
  const menu = createMenuStore({ menubar, parent });
  onTestFinished(init(parent));
  onTestFinished(init(menu));

  expect(menu.getState().placement).toBe("right-start");
  parent.setState("orientation", "horizontal");
  expect(menu.getState().placement).toBe("bottom-start");
  menubar.setState("orientation", "vertical");
  menubar.setState("rtl", true);
  expect(menu.getState().placement).toBe("bottom-start");
});
