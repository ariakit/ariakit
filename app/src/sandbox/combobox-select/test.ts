import { click, dispatch, focus, hover, press, q, type } from "@ariakit/test";
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

test("navigates a standard (input-less) select with virtual focus", async () => {
  const combobox = q.combobox.ensure("Plain fruit");
  await click(combobox);

  expect(q.dialog("Plain fruit")).toBeInTheDocument();
  expect(combobox).toHaveFocus();
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");
  expect(combobox).toHaveAttribute(
    "aria-activedescendant",
    q.option.ensure("Apple").id,
  );

  await press.ArrowDown();
  expect(q.option("Banana")).toHaveAttribute("data-active-item");
  expect(combobox).toHaveAttribute(
    "aria-activedescendant",
    q.option.ensure("Banana").id,
  );

  await press.End();
  expect(q.option("Orange")).toHaveAttribute("data-active-item");
  await press.Home();
  expect(q.option("Apple")).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  await press.Enter();

  expect(q.dialog("Plain fruit")).not.toBeInTheDocument();
  expect(combobox).toHaveTextContent("Banana");
  expect(combobox).toHaveFocus();
  expect(combobox).not.toHaveAttribute("aria-activedescendant");
});

test("supports typeahead on a standard select while open", async () => {
  const combobox = q.combobox.ensure("Plain fruit");
  await click(combobox);
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");

  await type("o");
  expect(q.option("Orange")).toHaveAttribute("data-active-item");

  await press.Enter();
  expect(combobox).toHaveTextContent("Orange");
});

test("moves the selection with arrow keys while closed", async () => {
  const combobox = q.combobox.ensure("Closed fruit");
  await click(combobox);
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");
  await press.Escape();
  expect(q.dialog("Closed fruit")).not.toBeInTheDocument();

  await press.ArrowDown();
  expect(combobox).toHaveTextContent("Banana");
  await press.ArrowDown();
  expect(combobox).toHaveTextContent("Orange");
  await press.ArrowUp();
  expect(combobox).toHaveTextContent("Banana");
  expect(q.dialog("Closed fruit")).not.toBeInTheDocument();
});

test("selects with typeahead while closed", async () => {
  const combobox = q.combobox.ensure("Closed fruit");
  await click(combobox);
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");
  await press.Escape();

  await type("o");
  expect(combobox).toHaveTextContent("Orange");
  expect(q.dialog("Closed fruit")).not.toBeInTheDocument();
});

test("does not submit the form when the trigger is clicked", async () => {
  // The native contract that prevents the implicit form submission in real
  // browsers.
  expect(q.combobox("Favorite fruit")).toHaveAttribute("type", "button");

  await click(q.combobox("Favorite fruit"));

  expect(q.dialog("Favorite fruit")).toBeInTheDocument();
  expect(q.text("Favorite submitted: None")).toBeInTheDocument();
});

test("keeps an input-less select interactive in the modal context", async () => {
  const combobox = q.combobox.ensure("Modal plain fruit");
  await click(combobox);

  expect(q.dialog("Modal plain fruit")).toBeInTheDocument();
  expect(combobox.inert).toBe(false);
  expect(combobox.hasAttribute("aria-hidden")).toBe(false);
  expect(combobox).toHaveFocus();
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  expect(q.option("Banana")).toHaveAttribute("data-active-item");
  expect(combobox).toHaveAttribute(
    "aria-activedescendant",
    q.option.ensure("Banana").id,
  );

  await press.Enter();
  expect(q.dialog("Modal plain fruit")).not.toBeInTheDocument();
  expect(combobox).toHaveTextContent("Banana");
  expect(combobox).toHaveFocus();
});

test("shows and hides on Enter and Space", async () => {
  const combobox = q.combobox.ensure("Plain fruit");
  await focus(combobox);

  await press.Enter();
  expect(q.dialog("Plain fruit")).toBeInTheDocument();
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");
  // Enter forwards the activation to the active item, which re-selects the
  // already selected item and hides the popover, like a native select.
  await press.Enter();
  expect(q.dialog("Plain fruit")).not.toBeInTheDocument();
  expect(combobox).toHaveTextContent("Apple");
  expect(combobox).toHaveFocus();

  await press.Space();
  expect(q.dialog("Plain fruit")).toBeInTheDocument();
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");
  await press.Space();
  expect(q.dialog("Plain fruit")).not.toBeInTheDocument();
  expect(combobox).toHaveTextContent("Apple");
  expect(combobox).toHaveFocus();
});

test("hides on click outside", async () => {
  await click(q.combobox("Plain fruit"));
  expect(q.dialog("Plain fruit")).toBeInTheDocument();

  await click(document.body);
  expect(q.dialog("Plain fruit")).not.toBeInTheDocument();
});

test("hides on click on the label and moves focus to the trigger", async () => {
  const combobox = q.combobox.ensure("Plain fruit");
  expect(combobox).not.toHaveFocus();

  await click(q.text("Plain fruit"));
  await expect.poll(() => document.activeElement).toBe(combobox);
  expect(q.dialog("Plain fruit")).not.toBeInTheDocument();

  await click(combobox);
  expect(q.dialog("Plain fruit")).toBeInTheDocument();

  await click(q.text("Plain fruit"));
  await expect.poll(() => document.activeElement).toBe(combobox);
  expect(q.dialog("Plain fruit")).not.toBeInTheDocument();
});

test("ignores disabled items on click and typeahead", async () => {
  const combobox = q.combobox.ensure("Plain fruit");
  await click(combobox);
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");

  expect(q.option("Grape")).toHaveAttribute("aria-disabled", "true");
  await click(q.option("Grape"));
  expect(q.dialog("Plain fruit")).toBeInTheDocument();
  expect(combobox).toHaveTextContent("Apple");

  await type("g");
  expect(q.option("Apple")).toHaveAttribute("data-active-item");

  await press.Escape();
  await type("g");
  expect(combobox).toHaveTextContent("Apple");
});

test("moves virtual focus on hover and clears it on a disabled item", async () => {
  const combobox = q.combobox.ensure("Plain fruit");
  await click(combobox);
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");

  await hover(q.option("Banana"));
  expect(q.option("Banana")).toHaveAttribute("data-active-item");
  expect(combobox).toHaveFocus();
  expect(combobox).toHaveTextContent("Apple");

  await hover(q.option("Grape"));
  expect(q.option("Banana")).not.toHaveAttribute("data-active-item");
  expect(q.option("Grape")).not.toHaveAttribute("data-active-item");
  expect(combobox).not.toHaveAttribute("aria-activedescendant");
});

test("wraps virtual focus at the boundaries by default", async () => {
  const combobox = q.combobox.ensure("Plain fruit");
  await click(combobox);
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");

  await press.End();
  expect(q.option("Orange")).toHaveAttribute("data-active-item");
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveAttribute("data-active-item");
  await press.ArrowUp();
  expect(q.option("Orange")).toHaveAttribute("data-active-item");
});

test("does not wrap virtual focus with focusLoop disabled", async () => {
  const combobox = q.combobox.ensure("No loop fruit");
  await click(combobox);
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");

  await press.ArrowUp();
  expect(q.option("Apple")).toHaveAttribute("data-active-item");
  expect(combobox).toHaveAttribute(
    "aria-activedescendant",
    q.option.ensure("Apple").id,
  );

  await press.End();
  expect(q.option("Orange")).toHaveAttribute("data-active-item");

  // Even without a next item, the key press must be consumed while the
  // popover is open so the page doesn't scroll behind it, as with Select and
  // the native select element.
  let defaultPrevented = false;
  const onKeyDown = (event: KeyboardEvent) => {
    defaultPrevented = event.defaultPrevented;
  };
  document.addEventListener("keydown", onKeyDown);
  await press.ArrowDown();
  document.removeEventListener("keydown", onKeyDown);

  expect(q.option("Orange")).toHaveAttribute("data-active-item");
  expect(defaultPrevented).toBe(true);
});

test("navigates a grid select with arrow keys while open", async () => {
  const combobox = q.combobox.ensure("Grid fruit");
  await click(combobox);

  expect(q.grid("Grid fruit")).toBeInTheDocument();
  await expect
    .poll(q.gridcell.lazy("Apple"))
    .toHaveAttribute("data-active-item");

  await press.ArrowRight();
  expect(q.gridcell("Banana")).toHaveAttribute("data-active-item");
  await press.ArrowDown();
  expect(q.gridcell("Kiwi")).toHaveAttribute("data-active-item");
  await press.ArrowLeft();
  expect(q.gridcell("Grape")).toHaveAttribute("data-active-item");
  await press.ArrowUp();
  expect(q.gridcell("Apple")).toHaveAttribute("data-active-item");

  await press.End();
  expect(q.gridcell("Cherry")).toHaveAttribute("data-active-item");
  await press.End(null, { ctrlKey: true });
  expect(q.gridcell("Lemon")).toHaveAttribute("data-active-item");
  await press.Home();
  expect(q.gridcell("Grape")).toHaveAttribute("data-active-item");
  await press.Home(null, { ctrlKey: true });
  expect(q.gridcell("Apple")).toHaveAttribute("data-active-item");

  // Vertical wrap at the grid boundaries is column-aware: down from the
  // bottom of a column moves to the top of the next column, and up from the
  // top of a column moves to the bottom of the previous one.
  await press.ArrowRight();
  await press.ArrowDown();
  expect(q.gridcell("Kiwi")).toHaveAttribute("data-active-item");
  await press.ArrowDown();
  expect(q.gridcell("Cherry")).toHaveAttribute("data-active-item");
  await press.ArrowUp();
  expect(q.gridcell("Kiwi")).toHaveAttribute("data-active-item");
  await press.ArrowUp();
  await press.ArrowUp();
  expect(q.gridcell("Grape")).toHaveAttribute("data-active-item");
  await press.Home(null, { ctrlKey: true });

  await press.ArrowDown();
  await press.Enter();
  expect(q.grid("Grid fruit")).not.toBeInTheDocument();
  expect(combobox).toHaveTextContent("Grape");
});

test("moves the grid selection with arrow keys while closed", async () => {
  const combobox = q.combobox.ensure("Grid fruit");
  await click(combobox);
  await expect
    .poll(q.gridcell.lazy("Apple"))
    .toHaveAttribute("data-active-item");
  await press.Escape();
  expect(q.grid("Grid fruit")).not.toBeInTheDocument();

  await press.ArrowRight();
  expect(combobox).toHaveTextContent("Banana");
  await press.ArrowDown();
  expect(combobox).toHaveTextContent("Kiwi");
  await press.ArrowLeft();
  expect(combobox).toHaveTextContent("Grape");
  await press.ArrowUp();
  expect(combobox).toHaveTextContent("Apple");
  expect(q.grid("Grid fruit")).not.toBeInTheDocument();
});

test("highlights the first item when opened with no selected value", async () => {
  const combobox = q.combobox.ensure("Unset fruit");
  await click(combobox);

  expect(q.dialog("Unset fruit")).toBeInTheDocument();
  // Matches Select: with an empty value, the first enabled item becomes the
  // active item when the popover opens.
  await expect.poll(q.option.lazy("Apple")).toHaveAttribute("data-active-item");
  expect(combobox).toHaveAttribute(
    "aria-activedescendant",
    q.option.ensure("Apple").id,
  );
});

test("names a standalone list from the select label", async () => {
  const combobox = q.combobox.ensure("Standalone fruit");
  const list = q.listbox.ensure("Standalone fruit");

  expect(list).toBeVisible();

  await click(combobox);
  await expect.poll(q.option.lazy("Pear")).toHaveAttribute("data-active-item");
  expect(combobox).toHaveAttribute(
    "aria-activedescendant",
    q.option.ensure("Pear").id,
  );

  await press.ArrowDown();
  expect(q.option("Peach")).toHaveAttribute("data-active-item");
  await press.Enter();
  expect(combobox).toHaveTextContent("Peach");
  expect(list).toBeVisible();
});

test("exposes aria-selected on items when a select is registered", async () => {
  await click(q.combobox("Favorite fruit"));

  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(q.option("Banana")).toHaveAttribute("aria-selected", "false");
});

test("omits aria-selected in a single-select without a ComboboxSelect", async () => {
  await click(q.button("Toggle select"));
  await click(q.combobox("Search Toggle fruit"));

  expect(q.option("Apple")).not.toHaveAttribute("aria-selected");
});
