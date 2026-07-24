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

test("uses the select as the base and anchor fallback", () => {
  const store = createComboboxStore();
  const stop = init(store);
  const select = document.createElement("button");
  const input = document.createElement("input");

  store.setSelectElement(select);
  expect(store.getState().baseElement).toBe(select);
  expect(store.getState().anchorElement).toBe(select);

  store.setBaseElement(input);
  expect(store.getState().baseElement).toBe(input);
  expect(store.getState().anchorElement).toBe(select);

  store.setBaseElement(null);
  expect(store.getState().baseElement).toBe(select);

  store.setSelectElement(null);
  expect(store.getState().baseElement).toBeNull();
  expect(store.getState().anchorElement).toBeNull();
  stop();
});

test("selects the first item when a select is rendered", async () => {
  const store = createComboboxStore({
    defaultItems: [
      { id: "disabled", value: "Disabled", disabled: true },
      { id: "apple", value: "Apple" },
    ],
  });
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));
  await Promise.resolve();

  expect(store.getState().selectedValue).toBe("Apple");
  expect(store.getState().activeId).toBe("apple");
  stop();
});

test("preserves an explicit empty selected value", () => {
  const store = createComboboxStore({
    defaultItems: [{ id: "apple", value: "Apple" }],
    defaultSelectedValue: "",
  });
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));

  expect(store.getState().selectedValue).toBe("");
  stop();
});

test("preserves a selected value set before the select is rendered", async () => {
  const store = createComboboxStore({
    defaultItems: [
      { id: "apple", value: "Apple" },
      { id: "banana", value: "Banana" },
    ],
  });
  const stop = init(store);

  store.setSelectedValue("Banana");
  store.setSelectElement(document.createElement("button"));
  await Promise.resolve();

  expect(store.getState().selectedValue).toBe("Banana");
  stop();
});

test("preserves an explicit empty selected value before items load", async () => {
  const store = createComboboxStore();
  const stop = init(store);

  store.setSelectedValue("");
  store.setSelectElement(document.createElement("button"));
  store.setState("items", [{ id: "apple", value: "Apple" }]);
  await Promise.resolve();

  expect(store.getState().selectedValue).toBe("");
  stop();
});

test("does not select the first item when a combobox input is rendered", async () => {
  const store = createComboboxStore({
    defaultItems: [{ id: "apple", value: "Apple" }],
  });
  const stop = init(store);

  store.setListElement(document.createElement("div"));
  store.setInputElement(document.createElement("input"));
  await Promise.resolve();

  expect(store.getState().selectedValue).toBe("");
  stop();
});

test("uses select composite defaults while a select is rendered", () => {
  const store = createComboboxStore();
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));

  expect(store.getState().focusLoop).toBe(false);
  expect(store.getState().focusWrap).toBe(false);
  expect(store.getState().includesBaseElement).toBe(false);

  store.setSelectElement(null);

  expect(store.getState().focusLoop).toBe(true);
  expect(store.getState().focusWrap).toBe(true);
  expect(store.getState().includesBaseElement).toBe(true);
  stop();
});

test("preserves explicit composite options in select mode", () => {
  const store = createComboboxStore({
    focusLoop: true,
    focusWrap: true,
    includesBaseElement: true,
  });
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));

  expect(store.getState().focusLoop).toBe(true);
  expect(store.getState().focusWrap).toBe(true);
  expect(store.getState().includesBaseElement).toBe(true);
  stop();
});

test("sets the selected value when moving while the select is closed", async () => {
  const store = createComboboxStore({
    defaultItems: [
      { id: "apple", value: "Apple" },
      { id: "banana", value: "Banana" },
    ],
    defaultSelectedValue: "Apple",
  });
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));
  store.move("banana");
  await Promise.resolve();

  expect(store.getState().selectedValue).toBe("Banana");
  stop();
});

test("sets the selected value on open moves only when enabled", async () => {
  const store = createComboboxStore({
    defaultItems: [
      { id: "apple", value: "Apple" },
      { id: "banana", value: "Banana" },
    ],
    defaultSelectedValue: "Apple",
  });
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));
  store.show();
  store.move("banana");
  await Promise.resolve();

  expect(store.getState().selectedValue).toBe("Apple");

  store.setState("setSelectedValueOnMove", true);
  await Promise.resolve();

  expect(store.getState().selectedValue).toBe("Banana");
  stop();
});
