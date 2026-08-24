import { createStore, init, sync } from "@ariakit/store";
import { UndoManager } from "@ariakit/utils";
import { expect, test, vi } from "vitest";
import { createTagStore } from "../tag/tag-store.ts";
import { createComboboxStore } from "./combobox-store.ts";

test("throws on cross-alias defaults with connected stores", () => {
  const legacySource = createStore({ value: "Apple" });
  expect(() =>
    createComboboxStore({
      store: legacySource,
      defaultInputValue: "Banana",
    }),
  ).toThrow("Passing a store prop in conjunction with a default state");

  const source = createStore({ inputValue: "Apple" });
  expect(() =>
    createComboboxStore({
      store: source,
      defaultValue: "Banana",
    }),
  ).toThrow("Passing a store prop in conjunction with a default state");
});

test("supports input value aliases", () => {
  const store = createComboboxStore({
    inputValue: "Apple",
    value: "Deprecated",
  });
  const stop = init(store);

  expect(store.getState().inputValue).toBe("Apple");
  expect(store.getState().value).toBe("Apple");

  store.setInputValue("Banana");
  expect(store.getState().inputValue).toBe("Banana");
  expect(store.getState().value).toBe("Banana");

  store.setValue("Orange");
  expect(store.getState().inputValue).toBe("Orange");
  expect(store.getState().value).toBe("Orange");

  store.setState("inputValue", "Grape");
  expect(store.getState().inputValue).toBe("Grape");
  expect(store.getState().value).toBe("Grape");

  store.setState("value", "Strawberry");
  expect(store.getState().inputValue).toBe("Strawberry");
  expect(store.getState().value).toBe("Strawberry");

  store.resetInputValue();
  expect(store.getState().inputValue).toBe("Apple");
  expect(store.getState().value).toBe("Apple");

  store.setInputValue("Watermelon");
  store.resetValue();
  expect(store.getState().inputValue).toBe("Apple");
  expect(store.getState().value).toBe("Apple");
  stop();
});

test("syncs input value aliases with connected stores", () => {
  const legacySource = createStore({ value: "Apple" });
  const legacyStore = createComboboxStore({ store: legacySource });
  const stopLegacyStore = init(legacyStore);

  expect(legacyStore.getState().inputValue).toBe("Apple");

  legacySource.setState("value", "Banana");
  expect(legacyStore.getState().inputValue).toBe("Banana");

  legacyStore.setInputValue("Orange");
  expect(legacySource.getState().value).toBe("Orange");
  stopLegacyStore();

  const source = createStore({ inputValue: "Grape" });
  const store = createComboboxStore({ store: source });
  const stopStore = init(store);

  expect(store.getState().value).toBe("Grape");

  source.setState("inputValue", "Strawberry");
  expect(store.getState().value).toBe("Strawberry");

  store.setValue("Watermelon");
  expect(source.getState().inputValue).toBe("Watermelon");
  stopStore();
});

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

  store.setCompositeElement(combobox);
  expect(store.getState().anchorElement).toBe(combobox);

  store.setDisclosureElement(nextDisclosure);
  expect(store.getState().anchorElement).toBe(combobox);

  store.setAnchorElement(anchor);
  store.setCompositeElement(nextCombobox);
  expect(store.getState().anchorElement).toBe(anchor);

  store.setAnchorElement(null);
  expect(store.getState().anchorElement).toBe(nextCombobox);

  store.setCompositeElement(null);
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

  store.setCompositeElement(combobox);
  store.setAnchorElement(anchor);
  store.setCompositeElement(nextCombobox);
  store.setAnchorElement(combobox);

  expect(store.getState().anchorElement).toBe(combobox);
  stop();
});

test("updates the combobox fallback when reinitialized", () => {
  const store = createComboboxStore();
  const firstCombobox = document.createElement("input");
  const nextCombobox = document.createElement("input");
  const stop = init(store);

  store.setCompositeElement(firstCombobox);
  expect(store.getState().anchorElement).toBe(firstCombobox);
  stop();

  store.setCompositeElement(nextCombobox);
  expect(store.getState().anchorElement).toBe(firstCombobox);

  const nextStop = init(store);
  expect(store.getState().anchorElement).toBe(nextCombobox);
  nextStop();
});

test("supports an inherited deprecated base element", () => {
  const combobox = document.createElement("input");
  const nextCombobox = document.createElement("input");
  const source = createStore({
    anchorElement: combobox,
    baseElement: combobox,
  });
  const store = createComboboxStore({ store: source });
  const stop = init(store);

  expect(store.getState().compositeElement).toBe(combobox);
  store.setCompositeElement(nextCombobox);

  expect(store.getState().anchorElement).toBe(nextCombobox);
  stop();
});

test("uses the select as the composite and anchor fallback", () => {
  const store = createComboboxStore();
  const stop = init(store);
  const select = document.createElement("button");
  const input = document.createElement("input");

  store.setSelectElement(select);
  expect(store.getState().compositeElement).toBe(select);
  expect(store.getState().anchorElement).toBe(select);

  store.setCompositeElement(input);
  expect(store.getState().compositeElement).toBe(input);
  expect(store.getState().anchorElement).toBe(select);

  store.setCompositeElement(null);
  expect(store.getState().compositeElement).toBe(select);

  store.setSelectElement(null);
  expect(store.getState().compositeElement).toBeNull();
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

test("resolves the selected item when the store starts open", async () => {
  const store = createComboboxStore({
    defaultItems: [
      { id: "apple", value: "Apple" },
      { id: "banana", value: "Banana" },
    ],
    defaultSelectedValue: "Banana",
    defaultOpen: true,
  });
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));
  await Promise.resolve();

  expect(store.getState().activeId).toBe("banana");
  stop();
});

test("resolves the selected item when it registers after opening", async () => {
  const store = createComboboxStore({
    defaultItems: [{ id: "apple", value: "Apple" }],
    defaultSelectedValue: "Banana",
  });
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));
  store.show();
  store.setState("mounted", true);
  store.registerItem({ id: "banana", value: "Banana" });
  await Promise.resolve();

  expect(store.getState().activeId).toBe("banana");
  stop();
});

test("preserves the active item when the selection registers after hover", async () => {
  const store = createComboboxStore({
    defaultItems: [{ id: "apple", value: "Apple" }],
    defaultSelectedValue: "Banana",
  });
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));
  store.show();
  store.setState("mounted", true);
  store.setActiveId("apple");
  expect(store.getState().moves).toBe(0);

  store.registerItem({ id: "banana", value: "Banana" });
  await Promise.resolve();

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

test("preserves an empty selected value set with setState", async () => {
  const store = createComboboxStore();
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));
  store.setState("selectedValue", "");
  store.setState("items", [{ id: "apple", value: "Apple" }]);
  await Promise.resolve();

  expect(store.getState().selectedValue).toBe("");
  stop();
});

test("does not select the first item without a select element", async () => {
  const store = createComboboxStore({
    defaultItems: [{ id: "apple", value: "Apple" }],
  });
  const stop = init(store);

  store.setInputElement(document.createElement("input"));
  await Promise.resolve();

  expect(store.getState().selectedValue).toBe("");
  stop();
});

test("uses select defaults while a select is rendered", () => {
  const store = createComboboxStore();
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));

  expect(store.getState().focusLoop).toBe(false);
  expect(store.getState().focusWrap).toBe(false);
  expect(store.getState().compositeElementInFocusOrder).toBe(false);
  expect(store.getState().resetValueOnSelect).toBe(true);

  store.setSelectElement(null);

  expect(store.getState().focusLoop).toBe(true);
  expect(store.getState().focusWrap).toBe(true);
  expect(store.getState().compositeElementInFocusOrder).toBe(true);
  expect(store.getState().resetValueOnSelect).toBe(false);
  stop();
});

test("preserves explicit options in select mode", () => {
  const store = createComboboxStore({
    focusLoop: true,
    focusWrap: true,
    compositeElementInFocusOrder: true,
    resetValueOnSelect: false,
  });
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));

  expect(store.getState().focusLoop).toBe(true);
  expect(store.getState().focusWrap).toBe(true);
  expect(store.getState().compositeElementInFocusOrder).toBe(true);
  expect(store.getState().resetValueOnSelect).toBe(false);
  stop();
});

test("preserves composite options changed while a select is rendered", () => {
  const store = createComboboxStore();
  const stop = init(store);

  store.setState("focusLoop", false);
  store.setState("focusWrap", false);
  store.setState("compositeElementInFocusOrder", false);

  store.setSelectElement(document.createElement("button"));

  store.setState("focusLoop", true);
  store.setState("focusWrap", true);
  store.setState("compositeElementInFocusOrder", true);

  store.setSelectElement(null);

  expect(store.getState().focusLoop).toBe(true);
  expect(store.getState().focusWrap).toBe(true);
  expect(store.getState().compositeElementInFocusOrder).toBe(true);
  stop();
});

test("preserves same-value composite options set in select mode", () => {
  const store = createComboboxStore();
  const stop = init(store);
  const select = document.createElement("button");

  store.setSelectElement(select);
  store.setState("focusLoop", false);
  store.setState("focusWrap", false);
  store.setState("compositeElementInFocusOrder", false);
  store.setState("resetValueOnSelect", true);
  store.setSelectElement(null);

  expect(store.getState().focusLoop).toBe(false);
  expect(store.getState().focusWrap).toBe(false);
  expect(store.getState().compositeElementInFocusOrder).toBe(false);
  expect(store.getState().resetValueOnSelect).toBe(true);

  store.setSelectElement(select);
  store.setState("focusLoop", true);
  store.setState("focusWrap", true);
  store.setState("compositeElementInFocusOrder", true);
  store.setState("resetValueOnSelect", false);
  store.setSelectElement(null);

  expect(store.getState().focusLoop).toBe(true);
  expect(store.getState().focusWrap).toBe(true);
  expect(store.getState().compositeElementInFocusOrder).toBe(true);
  expect(store.getState().resetValueOnSelect).toBe(false);

  store.setSelectElement(select);

  expect(store.getState().focusLoop).toBe(true);
  expect(store.getState().focusWrap).toBe(true);
  expect(store.getState().compositeElementInFocusOrder).toBe(true);
  expect(store.getState().resetValueOnSelect).toBe(false);
  stop();
});

test("preserves an orientation set while a select is rendered", () => {
  const store = createComboboxStore();
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));
  store.setState("focusLoop", "vertical");
  store.setState("focusWrap", "horizontal");
  store.setSelectElement(null);

  expect(store.getState().focusLoop).toBe("vertical");
  expect(store.getState().focusWrap).toBe("horizontal");
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

test("does not set the selected value when moving on a multi-selectable store", async () => {
  const store = createComboboxStore({
    defaultItems: [
      { id: "apple", value: "Apple" },
      { id: "banana", value: "Banana" },
    ],
    defaultSelectedValue: ["Apple"],
  });
  const stop = init(store);

  store.setSelectElement(document.createElement("button"));
  store.move("banana");
  await Promise.resolve();

  expect(store.getState().selectedValue).toEqual(["Apple"]);
  stop();
});

// https://github.com/ariakit/ariakit/issues/7114
test("binds selection membership to multi-selectable values", () => {
  const store = createComboboxStore<string[]>({
    defaultItems: [
      { id: "first-apple", value: "Apple" },
      { id: "second-apple", value: "Apple" },
      { id: "banana", value: "Banana" },
    ],
    defaultSelectedValue: [],
  });
  const stop = init(store);
  const selection = store.unstable_selection;
  expect(selection).toBeDefined();
  if (!selection) return;

  selection.select("first-apple");
  selection.select("second-apple");

  expect(store.getState().selectedValue).toEqual(["Apple"]);
  expect(selection.isSelected("first-apple")).toBe(true);
  expect(selection.isSelected("second-apple")).toBe(true);

  store.setSelectedValue(["Banana"]);
  expect(selection.isSelected("first-apple")).toBe(false);
  expect(selection.isSelected("banana")).toBe(true);
  stop();
});

// https://github.com/ariakit/ariakit/issues/7114
test("commits a multi-value range in one selected value update", () => {
  const items = Array.from({ length: 10 }, (_, index) => ({
    id: `${index + 1}`,
    value: `${index + 1}`,
  }));
  const store = createComboboxStore<string[]>({
    defaultItems: items,
    defaultSelectedValue: [],
  });
  const stop = init(store);
  const selection = store.unstable_selection;
  expect(selection).toBeDefined();
  if (!selection) return;
  store.setState("renderedItems", items);

  const listener = vi.fn();
  const stopSync = sync(store, ["selectedValue"], listener);
  listener.mockClear();

  store.move("1", { anchor: true });
  store.move("10", { extend: true });

  expect(store.getState().selectedValue).toEqual(
    items.map((item) => item.value),
  );
  expect(listener).toHaveBeenCalledOnce();
  stopSync();
  stop();
});

// https://github.com/ariakit/ariakit/issues/7114
test("commits a tag-connected range as one undo entry", async () => {
  while (UndoManager.canUndo()) {
    await UndoManager.undo();
  }

  const items = Array.from({ length: 10 }, (_, index) => ({
    id: `${index + 1}`,
    value: `${index + 1}`,
  }));
  const tag = createTagStore({ defaultValues: [] });
  const store = createComboboxStore<string[]>({
    defaultItems: items,
    defaultSelectedValue: [],
    tag,
  });
  const stopTag = init(tag);
  const stop = init(store);
  const setTagValues = vi.spyOn(tag, "setValues");
  const selectedValueListener = vi.fn();
  const stopSelectedValueSync = sync(
    store,
    ["selectedValue"],
    selectedValueListener,
  );
  setTagValues.mockClear();
  selectedValueListener.mockClear();
  store.setState("renderedItems", items);

  store.move("1", { anchor: true });
  store.move("10", { extend: true });
  await Promise.resolve();

  const values = items.map((item) => item.value);
  expect(store.getState().selectedValue).toEqual(values);
  expect(tag.getState().values).toEqual(values);
  expect(setTagValues).toHaveBeenCalledOnce();
  expect(selectedValueListener).toHaveBeenCalledOnce();
  expect(UndoManager.canUndo()).toBe(true);

  await UndoManager.undo();
  expect(store.getState().selectedValue).toEqual([]);
  expect(tag.getState().values).toEqual([]);
  expect(UndoManager.canUndo()).toBe(false);

  stopSelectedValueSync();
  stop();
  stopTag();
});

// https://github.com/ariakit/ariakit/issues/7114
test("excludes disabled values from a multi-value range", () => {
  const items = [
    { id: "apple", value: "Apple" },
    { id: "banana", value: "Banana", disabled: true },
    { id: "orange", value: "Orange" },
  ];
  const store = createComboboxStore<string[]>({
    defaultItems: items,
    defaultSelectedValue: [],
  });
  const stop = init(store);
  const selection = store.unstable_selection;
  expect(selection).toBeDefined();
  if (!selection) return;
  store.setState("renderedItems", items);

  store.move("apple", { anchor: true });
  store.move("orange", { extend: true });

  expect(store.getState().selectedValue).toEqual(["Apple", "Orange"]);
  expect(selection.isSelectable("banana")).toBe(false);
  stop();
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps selection disabled for initially single-value stores", () => {
  const store = createComboboxStore({ defaultSelectedValue: "Apple" });
  expect(store.unstable_selection).toBeUndefined();
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

  store.setState("selectOnMove", true);
  await Promise.resolve();

  expect(store.getState().selectedValue).toBe("Banana");
  stop();
});
