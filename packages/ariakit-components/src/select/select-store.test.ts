import { init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createComboboxStore } from "../combobox/combobox-store.ts";
import { createSelectStore } from "./select-store.ts";

test("keeps label and select elements independent from the combobox store", () => {
  const combobox = createComboboxStore();
  const select = createSelectStore({ combobox });
  const stopCombobox = init(combobox);
  const stopSelect = init(select);

  try {
    const selectButton = document.createElement("button");
    const selectLabel = document.createElement("div");

    select.setSelectElement(selectButton);
    select.setLabelElement(selectLabel);

    expect(combobox.getState().selectElement).toBeNull();
    expect(combobox.getState().labelElement).toBeNull();

    const comboboxButton = document.createElement("button");
    const comboboxLabel = document.createElement("label");

    combobox.setSelectElement(comboboxButton);
    combobox.setLabelElement(comboboxLabel);

    expect(select.getState().selectElement).toBe(selectButton);
    expect(select.getState().labelElement).toBe(selectLabel);

    // Genuinely shared states, such as the open state, must remain in sync.
    select.setOpen(true);
    expect(combobox.getState().open).toBe(true);
  } finally {
    stopSelect();
    stopCombobox();
  }
});
