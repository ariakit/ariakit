import { createStore, init } from "@ariakit/store";
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

test("preserves an anchor that later becomes the disclosure", () => {
  const store = createPopoverStore();
  const stop = init(store);
  const anchor = document.createElement("a");
  const disclosure = document.createElement("button");

  store.setAnchorElement(anchor);
  store.setDisclosureElement(anchor);
  store.setDisclosureElement(disclosure);

  expect(store.getState().anchorElement).toBe(anchor);
  stop();
});

test("preserves an explicit anchor matching a previous fallback", () => {
  const store = createPopoverStore();
  const stop = init(store);
  const disclosure = document.createElement("button");
  const nextDisclosure = document.createElement("button");
  const anchor = document.createElement("div");

  store.setDisclosureElement(disclosure);
  store.setAnchorElement(anchor);
  store.setDisclosureElement(nextDisclosure);
  store.setAnchorElement(disclosure);

  expect(store.getState().anchorElement).toBe(disclosure);
  stop();
});

test("updates the disclosure fallback when reinitialized", () => {
  const store = createPopoverStore();
  const firstDisclosure = document.createElement("button");
  const nextDisclosure = document.createElement("button");
  const stop = init(store);

  store.setDisclosureElement(firstDisclosure);
  expect(store.getState().anchorElement).toBe(firstDisclosure);
  stop();

  store.setDisclosureElement(nextDisclosure);
  expect(store.getState().anchorElement).toBe(firstDisclosure);

  const nextStop = init(store);
  expect(store.getState().anchorElement).toBe(nextDisclosure);
  nextStop();
});

test("updates an inherited disclosure fallback", () => {
  const disclosure = document.createElement("button");
  const nextDisclosure = document.createElement("button");
  const source = createStore({
    anchorElement: disclosure,
    disclosureElement: disclosure,
  });
  const store = createPopoverStore({ store: source });
  const stop = init(store);

  store.setDisclosureElement(nextDisclosure);

  expect(store.getState().anchorElement).toBe(nextDisclosure);
  stop();
});
