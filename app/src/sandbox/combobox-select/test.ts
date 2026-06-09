import { click, dispatch, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

function getNativeSelect(label: string) {
  const select = q.labeled.ensure(label, { selector: "select" });
  expect(select).toBeInstanceOf(HTMLSelectElement);
  return select as HTMLSelectElement;
}

test("uses the popover heading as the popover label when present", async () => {
  await click(q.combobox("Heading fruit"));

  expect(q.dialog("Available fruits")).toBeInTheDocument();
  expect(q.dialog("Heading fruit")).not.toBeInTheDocument();
});

test("keeps the select in the modal context", async () => {
  const outside = q.button.ensure("Outside action");
  await click(q.combobox("Modal fruit"));
  expect(q.dialog("Modal fruit")).toBeInTheDocument();

  const select = q.combobox.ensure("Modal fruit");

  expect(outside.inert).toBe(true);
  expect(select.inert).toBe(false);
  expect(select.hasAttribute("aria-hidden")).toBe(false);
});

test("submits the selected value with a hidden native select", async () => {
  await click(q.combobox("Favorite fruit"));
  await click(q.option("Banana"));
  await click(q.button("Submit favorite"));

  expect(q.text("Favorite submitted: Banana")).toBeInTheDocument();
});

test("supports native select change and focus forwarding", async () => {
  const select = getNativeSelect("Favorite fruit");
  const combobox = q.combobox.ensure("Favorite fruit");

  expect(combobox.hasAttribute("data-autofill")).toBe(false);
  await dispatch.change(select, { target: { value: "Orange" } });
  expect(combobox).toHaveTextContent("Orange");
  expect(combobox.hasAttribute("data-autofill")).toBe(true);

  expect(combobox).not.toHaveFocus();
  await focus(select);
  await expect.poll(q.combobox.lazy("Favorite fruit")).toHaveFocus();
});

test("supports native select required validation", async () => {
  await click(q.button("Submit required"));

  expect(q.text("Required submitted: yes")).not.toBeInTheDocument();
  expect(getNativeSelect("Required fruit").checkValidity()).toBe(false);
});

test("supports multiple selected values", async () => {
  const select = getNativeSelect("Multiple fruit");
  const combobox = q.combobox.ensure("Multiple fruit");

  expect(select.multiple).toBe(true);
  expect(combobox).toHaveTextContent("Apple, Banana");

  await click(combobox);
  await click(q.option("Orange"));

  expect(combobox).toHaveTextContent("Apple, Banana, Orange");
  expect(
    Array.from(select.selectedOptions).map((option) => option.value),
  ).toEqual(["Apple", "Banana", "Orange"]);
});

test("renders fallback when selected value is empty", () => {
  expect(q.combobox("Empty fruit")).toHaveTextContent("Choose fruit");
});

test("does not show on arrow keys when showOnKeyDown is false", async () => {
  await focus(q.combobox.ensure("Keyboard fruit"));
  await press.ArrowDown();

  expect(q.dialog("Keyboard fruit")).not.toBeInTheDocument();
});

test("does not toggle on click when toggleOnClick is false", async () => {
  await click(q.combobox("Click fruit"));

  expect(q.dialog("Click fruit")).not.toBeInTheDocument();
});

test("forwards disabled to the hidden native select", async () => {
  const combobox = q.combobox.ensure("Disabled fruit");
  const select = getNativeSelect("Disabled fruit");

  expect(combobox).toBeDisabled();
  expect(select.disabled).toBe(true);

  await click(combobox);
  expect(q.dialog("Disabled fruit")).not.toBeInTheDocument();
});

test("sets aria-required when required", () => {
  expect(q.combobox("Required fruit")).toHaveAttribute("aria-required", "true");
  expect(q.combobox("Empty fruit")).not.toHaveAttribute("aria-required");
});

test("keeps select behavior when the popover is shown programmatically", async () => {
  await click(q.button("Show programmatic fruit"));

  expect(q.dialog("Programmatic fruit")).toBeInTheDocument();
  await expect.poll(q.combobox.lazy("Search Programmatic fruit")).toHaveFocus();

  await click(q.option("Banana"));

  expect(q.dialog("Programmatic fruit")).not.toBeInTheDocument();
  expect(q.combobox("Programmatic fruit")).toHaveTextContent("Banana");
  await expect.poll(q.combobox.lazy("Programmatic fruit")).toHaveFocus();
});

test("highlights the selected item on reopen with unmountOnHide", async () => {
  await click(q.combobox("Unmount fruit"));
  await expect
    .poll(q.option.lazy("Banana"))
    .toHaveAttribute("data-active-item");

  await click(q.option("Orange"));
  expect(q.dialog("Unmount fruit")).not.toBeInTheDocument();

  await click(q.combobox("Unmount fruit"));
  await expect
    .poll(q.option.lazy("Orange"))
    .toHaveAttribute("data-active-item");
});

test("highlights the last selected value in multiple mode", async () => {
  await click(q.combobox("Multiple fruit"));
  await expect
    .poll(q.option.lazy("Banana"))
    .toHaveAttribute("data-active-item");
});

test("reverts to plain combobox behavior when the select unmounts", async () => {
  await click(q.button("Toggle select"));
  await click(q.combobox("Search Toggle fruit"));
  await click(q.option("Banana"));

  expect(q.combobox("Search Toggle fruit")).toHaveValue("Banana");
});
