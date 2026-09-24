import { init } from "@ariakit/store";
import { expect, test, vi } from "vitest";
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

// https://github.com/ariakit/ariakit/issues/7621
test("a hide request on the combobox store runs the handler of the select", () => {
  const combobox = createComboboxStore({ defaultOpen: true });
  const select = createSelectStore({ combobox });
  const stop = init(select);
  const handler = vi.fn();
  const unregister = select.unstable_onHideRequest(handler);

  combobox.hide();
  expect(handler).toHaveBeenCalledTimes(1);
  expect(combobox.getState().open).toBe(true);
  expect(select.getState().open).toBe(true);

  unregister();
  stop();
});
