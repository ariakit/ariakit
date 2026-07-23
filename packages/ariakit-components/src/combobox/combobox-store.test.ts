import { init } from "@ariakit/store";
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
