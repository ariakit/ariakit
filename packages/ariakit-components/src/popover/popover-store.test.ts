import { init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createPopoverStore } from "./popover-store.ts";

test("syncs the disclosure element with the anchor element", () => {
  const store = createPopoverStore();
  const stop = init(store);
  const disclosure = document.createElement("button");
  const nextDisclosure = document.createElement("button");
  const anchor = document.createElement("div");

  store.setDisclosureElement(disclosure);
  expect(store.getState().anchorElement).toBe(disclosure);

  store.setAnchorElement(anchor);
  store.setDisclosureElement(nextDisclosure);
  expect(store.getState().anchorElement).toBe(anchor);

  store.setAnchorElement(null);
  expect(store.getState().anchorElement).toBe(nextDisclosure);

  store.setDisclosureElement(null);
  expect(store.getState().anchorElement).toBeNull();
  stop();
});

test("preserves an anchor registered before the disclosure", () => {
  const store = createPopoverStore();
  const stop = init(store);
  const anchor = document.createElement("div");
  const disclosure = document.createElement("button");

  store.setAnchorElement(anchor);
  store.setDisclosureElement(disclosure);
  expect(store.getState().anchorElement).toBe(anchor);

  store.setAnchorElement(null);
  expect(store.getState().anchorElement).toBe(disclosure);
  stop();
});
