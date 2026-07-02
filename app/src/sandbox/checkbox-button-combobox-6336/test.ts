import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6336
test("checkbox keeps role and toggling after swapping the render element", async () => {
  await click(q.checkbox.ensure("Accept terms"));
  expect(q.text("checked: true")).toBeInTheDocument();

  await click(q.button.ensure("Use custom checkbox"));

  const checkbox = q.checkbox.ensure("Accept terms");
  expect(checkbox).not.toHaveAttribute("type");
  expect(checkbox).toHaveAttribute("tabindex", "0");

  await click(checkbox);
  expect(q.text("checked: false")).toBeInTheDocument();

  await press.Space(checkbox);
  expect(q.text("checked: true")).toBeInTheDocument();

  await click(q.button.ensure("Use native checkbox"));

  const nativeCheckbox = q.checkbox.ensure("Accept terms");
  expect(nativeCheckbox).toHaveAttribute("type", "checkbox");

  await click(nativeCheckbox);
  expect(q.text("checked: false")).toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/6336
test("radio keeps role and toggling after swapping the render element", async () => {
  await click(q.radio.ensure("orange"));
  expect(q.text("fruit: orange")).toBeInTheDocument();

  await click(q.radio.ensure("apple"));
  expect(q.text("fruit: apple")).toBeInTheDocument();

  await click(q.button.ensure("Use custom radio"));

  const radio = q.radio.ensure("orange");
  expect(radio).not.toHaveAttribute("type");

  await click(radio);
  expect(q.text("fruit: orange")).toBeInTheDocument();
  expect(radio).toHaveAttribute("aria-checked", "true");

  // Swap back to the native input while the radio is checked so the swapped
  // element mounts as a controlled checked radio right away.
  await click(q.button.ensure("Use native radio"));

  const nativeRadio = q.radio.ensure("orange");
  expect(nativeRadio).toHaveAttribute("type", "radio");
  expect(nativeRadio).toHaveAttribute("aria-checked", "true");

  await click(q.radio.ensure("apple"));
  expect(q.text("fruit: apple")).toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/6336
test("button keeps role and keyboard activation after swapping the render element", async () => {
  await click(q.button.ensure("Submit"));
  expect(q.text("submit clicks: 1")).toBeInTheDocument();

  await click(q.button.ensure("Use custom submit"));

  const button = q.button.ensure("Submit");
  expect(button).not.toHaveAttribute("type");
  expect(button).toHaveAttribute("tabindex", "0");

  await click(button);
  expect(q.text("submit clicks: 2")).toBeInTheDocument();

  await press.Enter(button);
  expect(q.text("submit clicks: 3")).toBeInTheDocument();

  await press.Space(button);
  expect(q.text("submit clicks: 4")).toBeInTheDocument();

  await click(q.button.ensure("Use native submit"));

  const nativeButton = q.button.ensure("Submit");
  expect(nativeButton).toHaveAttribute("type", "button");

  await click(nativeButton);
  expect(q.text("submit clicks: 5")).toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/6336
test("button regains native button props after swapping from a custom element", async () => {
  await click(q.button.ensure("Save"));
  expect(q.text("save clicks: 1")).toBeInTheDocument();

  await click(q.button.ensure("Use native save"));

  const button = q.button.ensure("Save");
  expect(button).toHaveAttribute("type", "button");
  expect(button).not.toHaveAttribute("role");

  await click(button);
  expect(q.text("save clicks: 2")).toBeInTheDocument();
});

// https://github.com/ariakit/ariakit/issues/6336
test("combobox list updates aria-multiselectable after swapping the render element", async () => {
  expect(q.listbox.ensure("Fruits")).toHaveAttribute(
    "aria-multiselectable",
    "true",
  );

  await click(q.button.ensure("Use dialog list"));

  expect(q.dialog.ensure("Fruits")).not.toHaveAttribute("aria-multiselectable");

  await click(q.button.ensure("Use listbox list"));

  expect(q.listbox.ensure("Fruits")).toHaveAttribute(
    "aria-multiselectable",
    "true",
  );
});
