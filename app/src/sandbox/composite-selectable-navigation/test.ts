import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

function setPageBoundaryGeometry(listbox: HTMLElement) {
  const first = listbox.querySelector<HTMLElement>("#multiple-first");
  const terminal = listbox.querySelector<HTMLElement>("#multiple-terminal");
  if (!first || !terminal) {
    throw new Error("Multiple-selection boundary items were not rendered");
  }

  const setRect = (element: HTMLElement, top: number, height: number) => {
    Object.defineProperty(element, "clientHeight", {
      configurable: true,
      value: height,
    });
    element.getBoundingClientRect = () => ({
      bottom: top + height,
      height,
      left: 0,
      right: 100,
      top,
      width: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    });
  };

  listbox.style.overflowY = "auto";
  Object.defineProperty(listbox, "scrollHeight", {
    configurable: true,
    value: 300,
  });
  setRect(listbox, 0, 100);
  setRect(first, 200, 20);
  setRect(terminal, -200, 20);
}

// https://github.com/ariakit/ariakit/issues/7114
test("leaves terminal Shift navigation unhandled without focusLoop", async () => {
  await focus(q.option("Terminal item"));
  await press.ArrowDown(undefined, { shiftKey: true });

  expect(q.option("Terminal item")).toHaveFocus();
  expect(q.status("Boundary key result")).toHaveTextContent(
    "Default action allowed",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps plain Shift navigation looping", async () => {
  await focus(q.option("Plain loop terminal"));
  await press.ArrowDown(undefined, { shiftKey: true });

  expect(q.option("Plain loop first")).toHaveFocus();
  expect(q.status("Plain loop key result")).toHaveTextContent(
    "Default action prevented",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps none-mode Shift navigation looping", async () => {
  await focus(q.option("None terminal"));
  await press.ArrowDown(undefined, { shiftKey: true });

  expect(q.option("None first")).toHaveFocus();
  expect(q.status("None loop key result")).toHaveTextContent(
    "Default action prevented",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps single-mode Shift navigation looping", async () => {
  await focus(q.option("Single terminal"));
  await press.ArrowDown(undefined, { shiftKey: true });

  expect(q.option("Single first")).toHaveFocus();
  expect(q.status("Single loop key result")).toHaveTextContent(
    "Default action prevented",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("stops Shift+PageUp at the first range item", async () => {
  const listbox = q.listbox("Multiple selection list");
  const first = q.option("Multiple first");
  const terminal = q.option("Multiple terminal");
  await click(first);
  setPageBoundaryGeometry(listbox);

  await press.PageUp(undefined, { shiftKey: true });

  expect(first).toHaveFocus();
  expect(first).toHaveAttribute("aria-selected", "true");
  expect(terminal).toHaveAttribute("aria-selected", "false");
  expect(q.status("Multiple page key result")).toHaveTextContent(
    "PageUp default prevented",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("stops Shift+PageDown at the last range item", async () => {
  const listbox = q.listbox("Multiple selection list");
  const first = q.option("Multiple first");
  const terminal = q.option("Multiple terminal");
  await click(terminal);
  setPageBoundaryGeometry(listbox);

  await press.PageDown(undefined, { shiftKey: true });

  expect(terminal).toHaveFocus();
  expect(first).toHaveAttribute("aria-selected", "false");
  expect(terminal).toHaveAttribute("aria-selected", "true");
  expect(q.status("Multiple page key result")).toHaveTextContent(
    "PageDown default prevented",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("leaves the vertical edge open for a horizontal-only loop", async () => {
  const bottom = q.gridcell("Horizontal loop bottom");
  await focus(bottom);

  await press.ArrowDown(undefined, { shiftKey: true });

  expect(bottom).toHaveFocus();
  expect(
    q.status("Horizontal loop vertical boundary result"),
  ).toHaveTextContent("Default action allowed");
});

// https://github.com/ariakit/ariakit/issues/7114
test("leaves the horizontal edge open for a vertical-only loop", async () => {
  const listbox = q.listbox("Vertical-only loop virtual boundary");
  await focus(listbox);

  await press.ArrowRight(undefined, { shiftKey: true });

  expect(listbox).toHaveFocus();
  expect(
    q.status("Vertical loop horizontal boundary result"),
  ).toHaveTextContent("Default action allowed");
});

// https://github.com/ariakit/ariakit/issues/7114
test("leaves Control+A unhandled in none mode", async () => {
  await focus(q.option("None first"));
  await press("a", null, { ctrlKey: true });

  expect(q.status("None select-all result")).toHaveTextContent(
    "Control+A default allowed",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("leaves Control+A unhandled in single mode", async () => {
  await focus(q.option("Single first"));
  await press("a", null, { ctrlKey: true });

  expect(q.status("Single select-all result")).toHaveTextContent(
    "Control+A default allowed",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("wraps a Shift range from the end of one grid row to the next", async () => {
  await focus(q.gridcell("Alpha right"));
  await press.ArrowRight(undefined, { shiftKey: true });

  expect(q.gridcell("Beta left")).toHaveFocus();
  expect(q.row("Alpha row")).toHaveAttribute("aria-selected", "true");
  expect(q.row("Beta row")).toHaveAttribute("aria-selected", "true");
  expect(q.status("Wrapped grid selection")).toHaveTextContent(
    "2 selected: Alpha, Beta",
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("does not move or select when moveOnKeyPress is false", async () => {
  const guarded = q.option("Guarded item");
  await focus(guarded);
  await press.ArrowDown(undefined, { shiftKey: true });

  expect(guarded).toHaveFocus();
  expect(guarded).toHaveAttribute("aria-selected", "false");
  expect(q.option("Following item")).toHaveAttribute("aria-selected", "false");
  expect(q.status("Guarded selection")).toHaveTextContent("Nothing selected");
});

// https://github.com/ariakit/ariakit/issues/7114
test("keeps the item registration and element while opt-in changes", async () => {
  const listbox = q.listbox("Guarded selectable list");
  const guarded = q.option("Guarded item");
  const itemCount = listbox.querySelectorAll('[role="option"]').length;
  expect(q.status("Guarded registry")).toHaveTextContent(
    `Registered items: ${itemCount}`,
  );

  await click(q.checkbox("Include guarded item in selection"));

  expect(listbox.querySelectorAll('[role="option"]')).toHaveLength(itemCount);
  expect(q.option("Guarded item")).toBe(guarded);
  expect(guarded).toBeInTheDocument();
  expect(guarded).not.toHaveAttribute("aria-selected");
  expect(q.status("Guarded registry")).toHaveTextContent(
    `Registered items: ${itemCount}`,
  );
});

// https://github.com/ariakit/ariakit/issues/7114
test("seats an anchor when virtual focus starts with a null active id", async () => {
  const listbox = q.listbox("Virtual focus list");
  await focus(listbox);
  expect(q.status("Virtual cursor")).toHaveTextContent("Cursor: Composite");

  await press.ArrowDown(undefined, { shiftKey: true });
  expect(listbox).toHaveFocus();
  expect(q.status("Virtual cursor")).toHaveTextContent("Cursor: Virtual one");
  expect(q.status("Virtual selection")).toHaveTextContent(
    "1 selected: Virtual one",
  );

  await click(q.button("Move cursor to Virtual three"));
  expect(q.status("Virtual cursor")).toHaveTextContent("Cursor: Virtual three");
  await focus(listbox);
  await press.ArrowUp(undefined, { shiftKey: true });
  expect(listbox).toHaveFocus();
  expect(q.status("Virtual cursor")).toHaveTextContent("Cursor: Virtual two");
  expect(q.status("Virtual selection")).toHaveTextContent(
    "2 selected: Virtual one, Virtual two",
  );
  expect(q.option("Virtual three")).toHaveAttribute("aria-selected", "false");
});
