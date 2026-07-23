import { createStore, init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createComboboxStore } from "./combobox-store.ts";

test("syncs the combobox element with the anchor element", () => {
  const store = createComboboxStore();
  const stop = init(store);
  const disclosure = document.createElement("button");
  const nextDisclosure = document.createElement("button");
  const combobox = document.createElement("input");
  const nextCombobox = document.createElement("input");
  const anchor = document.createElement("div");

  store.setDisclosureElement(disclosure);
  expect(store.getState().anchorElement).toBe(disclosure);

  store.setBaseElement(combobox);
  expect(store.getState().anchorElement).toBe(combobox);

  store.setDisclosureElement(nextDisclosure);
  expect(store.getState().anchorElement).toBe(combobox);

  store.setAnchorElement(anchor);
  store.setBaseElement(nextCombobox);
  expect(store.getState().anchorElement).toBe(anchor);

  store.setAnchorElement(null);
  expect(store.getState().anchorElement).toBe(nextCombobox);

  store.setBaseElement(null);
  expect(store.getState().anchorElement).toBe(nextDisclosure);
  stop();
});

test("preserves an anchor that later becomes the disclosure", () => {
  const store = createComboboxStore();
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
  const store = createComboboxStore();
  const stop = init(store);
  const combobox = document.createElement("input");
  const nextCombobox = document.createElement("input");
  const anchor = document.createElement("div");

  store.setBaseElement(combobox);
  store.setAnchorElement(anchor);
  store.setBaseElement(nextCombobox);
  store.setAnchorElement(combobox);

  expect(store.getState().anchorElement).toBe(combobox);
  stop();
});

test("updates the combobox fallback when reinitialized", () => {
  const store = createComboboxStore();
  const firstCombobox = document.createElement("input");
  const nextCombobox = document.createElement("input");
  const stop = init(store);

  store.setBaseElement(firstCombobox);
  expect(store.getState().anchorElement).toBe(firstCombobox);
  stop();

  store.setBaseElement(nextCombobox);
  expect(store.getState().anchorElement).toBe(firstCombobox);

  const nextStop = init(store);
  expect(store.getState().anchorElement).toBe(nextCombobox);
  nextStop();
});

test("updates an inherited combobox fallback", () => {
  const combobox = document.createElement("input");
  const nextCombobox = document.createElement("input");
  const source = createStore({
    anchorElement: combobox,
    baseElement: combobox,
  });
  const store = createComboboxStore({ store: source });
  const stop = init(store);

  store.setBaseElement(nextCombobox);

  expect(store.getState().anchorElement).toBe(nextCombobox);
  stop();
});
