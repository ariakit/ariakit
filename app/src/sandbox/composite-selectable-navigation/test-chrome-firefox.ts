import { withFramework } from "#app/test-utils/preview.ts";

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

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7114
  test("leaves terminal Shift navigation unhandled without focusLoop", async ({
    q,
  }) => {
    const terminal = q.option("Terminal item");
    await terminal.focus();
    await terminal.press("Shift+ArrowDown");

    await test.expect(terminal).toBeFocused();
    await test
      .expect(q.status("Boundary key result"))
      .toHaveText("Default action allowed");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps plain Shift navigation looping", async ({ q }) => {
    const terminal = q.option("Plain loop terminal");
    await terminal.focus();
    await terminal.press("Shift+ArrowDown");

    await test.expect(q.option("Plain loop first")).toBeFocused();
    await test
      .expect(q.status("Plain loop key result"))
      .toHaveText("Default action prevented");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps none-mode Shift navigation looping", async ({ q }) => {
    const terminal = q.option("None terminal");
    await terminal.focus();
    await terminal.press("Shift+ArrowDown");

    await test.expect(q.option("None first")).toBeFocused();
    await test
      .expect(q.status("None loop key result"))
      .toHaveText("Default action prevented");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps single-mode Shift navigation looping", async ({ q }) => {
    const terminal = q.option("Single terminal");
    await terminal.focus();
    await terminal.press("Shift+ArrowDown");

    await test.expect(q.option("Single first")).toBeFocused();
    await test
      .expect(q.status("Single loop key result"))
      .toHaveText("Default action prevented");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("stops Shift+PageUp at the first range item", async ({ q }) => {
    const listbox = q.listbox("Multiple selection list");
    const first = q.option("Multiple first");
    const terminal = q.option("Multiple terminal");
    await first.click();
    await listbox.evaluate(setPageBoundaryGeometry);

    await first.press("Shift+PageUp");

    await test.expect(first).toBeFocused();
    await test.expect(first).toHaveAttribute("aria-selected", "true");
    await test.expect(terminal).toHaveAttribute("aria-selected", "false");
    await test
      .expect(q.status("Multiple page key result"))
      .toHaveText("PageUp default prevented");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("stops Shift+PageDown at the last range item", async ({ q }) => {
    const listbox = q.listbox("Multiple selection list");
    const first = q.option("Multiple first");
    const terminal = q.option("Multiple terminal");
    await terminal.click();
    await listbox.evaluate(setPageBoundaryGeometry);

    await terminal.press("Shift+PageDown");

    await test.expect(terminal).toBeFocused();
    await test.expect(first).toHaveAttribute("aria-selected", "false");
    await test.expect(terminal).toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.status("Multiple page key result"))
      .toHaveText("PageDown default prevented");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("leaves the vertical edge open for a horizontal-only loop", async ({
    q,
  }) => {
    const bottom = q.gridcell("Horizontal loop bottom");
    await bottom.focus();

    await bottom.press("Shift+ArrowDown");

    await test.expect(bottom).toBeFocused();
    await test
      .expect(q.status("Horizontal loop vertical boundary result"))
      .toHaveText("Default action allowed");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("leaves the horizontal edge open for a vertical-only loop", async ({
    q,
  }) => {
    const listbox = q.listbox("Vertical-only loop virtual boundary");
    await listbox.focus();

    await listbox.press("Shift+ArrowRight");

    await test.expect(listbox).toBeFocused();
    await test
      .expect(q.status("Vertical loop horizontal boundary result"))
      .toHaveText("Default action allowed");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("leaves Control+A and Meta+A unhandled in none mode", async ({ q }) => {
    const first = q.option("None first");
    await first.focus();
    await first.press("Control+a");

    await test
      .expect(q.status("None select-all result"))
      .toHaveText("Control+A default allowed");
    await first.press("Meta+a");
    await test
      .expect(q.status("None select-all result"))
      .toHaveText("Meta+A default allowed");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("leaves Control+A and Meta+A unhandled in single mode", async ({
    q,
  }) => {
    const first = q.option("Single first");
    await first.focus();
    await first.press("Control+a");
    await test
      .expect(q.status("Single select-all result"))
      .toHaveText("Control+A default allowed");
    await first.press("Meta+a");

    await test
      .expect(q.status("Single select-all result"))
      .toHaveText("Meta+A default allowed");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("wraps a Shift range from the end of one grid row to the next", async ({
    q,
  }) => {
    await q.gridcell("Alpha right").focus();
    await q.gridcell("Alpha right").press("Shift+ArrowRight");

    await test.expect(q.gridcell("Beta left")).toBeFocused();
    await test
      .expect(q.row("Alpha row"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.row("Beta row"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.status("Wrapped grid selection"))
      .toHaveText("2 selected: Alpha, Beta");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("does not move or select when moveOnKeyPress is false", async ({
    q,
  }) => {
    const guarded = q.option("Guarded item");
    await guarded.focus();
    await guarded.press("Shift+ArrowDown");

    await test.expect(guarded).toBeFocused();
    await test.expect(guarded).toHaveAttribute("aria-selected", "false");
    await test
      .expect(q.option("Following item"))
      .toHaveAttribute("aria-selected", "false");
    await test
      .expect(q.status("Guarded selection"))
      .toHaveText("Nothing selected");
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("keeps the item registration and element while opt-in changes", async ({
    q,
  }) => {
    const listbox = q.listbox("Guarded selectable list");
    const options = query(listbox).option();
    const itemCount = await options.count();
    const guarded = q.option("Guarded item");
    const initialElement = await guarded.elementHandle();
    if (!initialElement) {
      throw new Error("Guarded item was not rendered");
    }
    await test
      .expect(q.status("Guarded registry"))
      .toHaveText(`Registered items: ${itemCount}`);

    await q.checkbox("Include guarded item in selection").click();

    await test.expect(options).toHaveCount(itemCount);
    await test
      .expect(q.status("Guarded registry"))
      .toHaveText(`Registered items: ${itemCount}`);
    await test.expect(guarded).not.toHaveAttribute("aria-selected");
    const sameElement = await guarded.evaluate(
      (element, previousElement) => element === previousElement,
      initialElement,
    );
    test.expect(sameElement).toBe(true);
    await initialElement.dispose();
  });

  // https://github.com/ariakit/ariakit/issues/7114
  test("seats an anchor when virtual focus starts with a null active id", async ({
    q,
  }) => {
    const listbox = q.listbox("Virtual focus list");
    await listbox.focus();
    await test
      .expect(q.status("Virtual cursor"))
      .toHaveText("Cursor: Composite");

    await listbox.press("Shift+ArrowDown");
    await test.expect(listbox).toBeFocused();
    await test
      .expect(q.status("Virtual cursor"))
      .toHaveText("Cursor: Virtual one");
    await test
      .expect(q.status("Virtual selection"))
      .toHaveText("1 selected: Virtual one");

    await q.button("Move cursor to Virtual three").click();
    await test
      .expect(q.status("Virtual cursor"))
      .toHaveText("Cursor: Virtual three");
    await listbox.focus();
    await listbox.press("Shift+ArrowUp");
    await test.expect(listbox).toBeFocused();
    await test
      .expect(q.status("Virtual cursor"))
      .toHaveText("Cursor: Virtual two");
    await test
      .expect(q.status("Virtual selection"))
      .toHaveText("2 selected: Virtual one, Virtual two");
    await test
      .expect(q.option("Virtual three"))
      .toHaveAttribute("aria-selected", "false");
  });
});
