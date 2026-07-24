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
  expect(combobox.getState().listElement).toBeNull();
  expect(select.getState().selectElement).toBe(selectElement);
  expect(select.getState().listElement).toBe(list);
  expect(combobox.getState().virtualFocus).toBe(true);

  select.setLabelElement(null);

  expect(combobox.getState().labelElement).toBe(inputLabel);
  expect(combobox.getState().selectLabelElement).toBeNull();

  stopSelect();
  stopCombobox();
});
