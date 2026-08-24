import { init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createComboboxStore } from "../combobox/combobox-store.ts";
import { createSelectStore } from "./select-store.ts";

test("keeps select and combobox element state separate", () => {
  const combobox = createComboboxStore();
  const select = createSelectStore({ combobox, virtualFocus: true });
  const stopCombobox = init(combobox);
  const stopSelect = init(select);
  const input = document.createElement("input");
  const inputLabel = document.createElement("label");
  const selectLabel = document.createElement("label");
  const selectElement = document.createElement("button");
  const list = document.createElement("div");

  combobox.setInputElement(input);
  combobox.setLabelElement(inputLabel);
  select.setLabelElement(selectLabel);
  select.setSelectElement(selectElement);
  select.setListElement(list);

  expect(combobox.getState().inputElement).toBe(input);
  expect(combobox.getState().labelElement).toBe(inputLabel);
  expect(combobox.getState().selectLabelElement).toBe(selectLabel);
  expect(select.getState().labelElement).toBe(selectLabel);
  expect(combobox.getState().selectElement).toBeNull();
  expect(select.getState().selectElement).toBe(selectElement);
  expect(select.getState().listElement).toBe(list);
  expect(combobox.getState().virtualFocus).toBe(true);

  select.setLabelElement(null);

  expect(combobox.getState().labelElement).toBe(inputLabel);
  expect(combobox.getState().selectLabelElement).toBeNull();

  stopSelect();
  stopCombobox();
});

// https://github.com/ariakit/ariakit/issues/7114
test("owns multi-value selection independently from a connected combobox", () => {
  const items = [
    { id: "first-apple", value: "Apple" },
    { id: "second-apple", value: "Apple" },
    { id: "banana", value: "Banana", disabled: true },
    { id: "cherry", value: "Cherry" },
  ];
  const combobox = createComboboxStore<string[]>({
    defaultSelectedValue: [],
  });
  const select = createSelectStore<string[]>({
    combobox,
    defaultItems: items,
    defaultValue: [],
  });
  const stopCombobox = init(combobox);
  const stopSelect = init(select);

  expect(select.unstable_selection).toBeDefined();
  expect(select.unstable_selection).not.toBe(combobox.unstable_selection);
  const selection = select.unstable_selection;
  if (!selection) return;

  select.setState("renderedItems", items);
  select.move("first-apple", { anchor: true });
  select.move("cherry", { extend: true });

  expect(select.getState().value).toEqual(["Apple", "Cherry"]);
  expect(combobox.getState().selectedValue).toEqual([]);
  expect(selection.isSelected("first-apple")).toBe(true);
  expect(selection.isSelected("second-apple")).toBe(true);
  expect(selection.isSelectable("banana")).toBe(false);

  select.setValue(["Cherry"]);
  expect(selection.isSelected("first-apple")).toBe(false);
  expect(selection.isSelected("cherry")).toBe(true);

  stopSelect();
  stopCombobox();
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps selection disabled for an initially single-value select", () => {
  const select = createSelectStore({ defaultValue: "Apple" });
  expect(select.unstable_selection).toBeUndefined();
});
