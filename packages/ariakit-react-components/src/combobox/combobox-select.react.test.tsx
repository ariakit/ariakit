import { click, dispatch, focus, q, render } from "@ariakit/test/react";
import { cleanup } from "@testing-library/react";
import type { FormEvent } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { PopoverHeading } from "../popover/popover-heading.tsx";
import { ComboboxItem } from "./combobox-item.tsx";
import { ComboboxLabel } from "./combobox-label.tsx";
import { ComboboxList } from "./combobox-list.tsx";
import { ComboboxPopover } from "./combobox-popover.tsx";
import { ComboboxProvider } from "./combobox-provider.tsx";
import { ComboboxSelect } from "./combobox-select.tsx";
import { Combobox } from "./combobox.tsx";

afterEach(cleanup);

interface TestProps {
  defaultSelectedValue?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  required?: boolean;
}

function Test({ defaultSelectedValue, onSubmit, required }: TestProps = {}) {
  return (
    <form onSubmit={onSubmit}>
      <ComboboxProvider
        defaultSelectedValue={defaultSelectedValue}
        resetValueOnHide
      >
        <ComboboxLabel>Favorite fruit</ComboboxLabel>
        <ComboboxSelect name="fruit" required={required} />
        <ComboboxPopover>
          <Combobox autoSelect placeholder="Search..." />
          <ComboboxList>
            <ComboboxItem value="Apple" />
            <ComboboxItem value="Banana" />
            <ComboboxItem value="Orange" />
          </ComboboxList>
        </ComboboxPopover>
      </ComboboxProvider>
      <button type="submit">Submit</button>
    </form>
  );
}

function getNativeSelect() {
  return document.querySelector<HTMLSelectElement>("select[name='fruit']")!;
}

test("clicking on the label focuses the select without showing the popover", async () => {
  await render(<Test defaultSelectedValue="Apple" />);
  await click(q.text("Favorite fruit"));
  expect(document.activeElement).toBe(q.combobox("Favorite fruit"));
  expect(q.dialog()).toBeNull();
});

test("labels the popover with the combobox label", async () => {
  await render(<Test defaultSelectedValue="Apple" />);
  await click(q.combobox("Favorite fruit"));
  expect(q.dialog("Favorite fruit")).not.toBeNull();
  const dialog = q.dialog();
  const label = q.text("Favorite fruit");
  if (!dialog) throw new Error("Dialog not found");
  if (!label) throw new Error("Label not found");
  expect(dialog.getAttribute("aria-labelledby")).toBe(label.id);
});

test("uses the popover heading as the popover label when present", async () => {
  await render(
    <ComboboxProvider defaultSelectedValue="Apple">
      <ComboboxLabel>Favorite fruit</ComboboxLabel>
      <ComboboxSelect />
      <ComboboxPopover>
        <PopoverHeading>Available fruits</PopoverHeading>
        <Combobox autoSelect placeholder="Search..." />
        <ComboboxList>
          <ComboboxItem value="Apple" />
          <ComboboxItem value="Banana" />
          <ComboboxItem value="Orange" />
        </ComboboxList>
      </ComboboxPopover>
    </ComboboxProvider>,
  );

  await click(q.combobox("Favorite fruit"));
  expect(q.dialog("Available fruits")).not.toBeNull();
  expect(q.dialog("Favorite fruit")).toBeNull();
});

test("keeps the select in the modal context", async () => {
  await render(
    <>
      <button id="outside" type="button">
        Outside
      </button>
      <ComboboxProvider defaultSelectedValue="Apple">
        <ComboboxLabel>Favorite fruit</ComboboxLabel>
        <ComboboxSelect />
        <ComboboxPopover modal>
          <Combobox autoSelect placeholder="Search..." />
          <ComboboxList>
            <ComboboxItem value="Apple" />
            <ComboboxItem value="Banana" />
            <ComboboxItem value="Orange" />
          </ComboboxList>
        </ComboboxPopover>
      </ComboboxProvider>
    </>,
  );

  await click(q.combobox("Favorite fruit"));
  expect(q.dialog("Favorite fruit")).not.toBeNull();

  const select = q.combobox("Favorite fruit")!;
  const outside = document.getElementById("outside")!;

  expect(outside.inert).toBe(true);
  expect(select.inert).toBe(false);
  expect(select.hasAttribute("aria-hidden")).toBe(false);
});

test("submits the selected value with a hidden native select", async () => {
  const values: FormDataEntryValue[] = [];

  await render(
    <Test
      defaultSelectedValue="Apple"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        values.push(data.get("fruit")!);
      }}
    />,
  );

  await click(q.combobox("Favorite fruit"));
  await click(q.option("Banana"));
  await click(q.button("Submit"));

  expect(values).toEqual(["Banana"]);
});

test("scrolls the selected item into view when the popover is shown", async () => {
  const scrollIntoView = vi
    .spyOn(HTMLElement.prototype, "scrollIntoView")
    .mockImplementation(function (this: Element) {
      return this;
    });

  try {
    await render(<Test defaultSelectedValue="Apple" />);
    await click(q.combobox("Favorite fruit"));
    scrollIntoView.mockClear();
    await click(q.option("Banana"));
    await click(q.combobox("Favorite fruit"));

    expect(scrollIntoView.mock.contexts).toContain(q.option("Banana"));
  } finally {
    scrollIntoView.mockRestore();
  }
});

test("preserves viewport scroll when scrolling the selected item into view", async () => {
  let scrollX = 0;
  let scrollY = 100;
  const getScrollX = vi
    .spyOn(window, "scrollX", "get")
    .mockImplementation(() => scrollX);
  const getScrollY = vi
    .spyOn(window, "scrollY", "get")
    .mockImplementation(() => scrollY);
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(((
    options?: ScrollToOptions | number,
    y?: number,
  ) => {
    if (typeof options === "number") {
      scrollX = options;
      scrollY = y ?? scrollY;
    } else if (options) {
      scrollX = options.left ?? scrollX;
      scrollY = options.top ?? scrollY;
    }
  }) as typeof window.scrollTo);
  const scrollIntoView = vi
    .spyOn(HTMLElement.prototype, "scrollIntoView")
    .mockImplementation(function (this: HTMLElement) {
      if (this.textContent === "Banana") {
        scrollY = 1;
      }
    });

  try {
    await render(<Test defaultSelectedValue="Apple" />);
    await click(q.combobox("Favorite fruit"));
    scrollIntoView.mockClear();
    await click(q.option("Banana"));
    await click(q.combobox("Favorite fruit"));

    expect(scrollIntoView.mock.contexts).toContain(q.option("Banana"));
    expect(scrollY).toBe(100);
    expect(scrollTo).toHaveBeenLastCalledWith({
      left: 0,
      top: 100,
      behavior: "instant",
    });
  } finally {
    getScrollX.mockRestore();
    getScrollY.mockRestore();
    scrollTo.mockRestore();
    scrollIntoView.mockRestore();
  }
});

test("supports native select change and focus forwarding", async () => {
  await render(<Test defaultSelectedValue="Apple" />);
  const select = getNativeSelect();
  const combobox = q.combobox("Favorite fruit")!;

  expect(combobox.hasAttribute("data-autofill")).toBe(false);
  await dispatch.change(select, { target: { value: "Orange" } });
  expect(combobox.textContent).toContain("Orange");
  expect(combobox.hasAttribute("data-autofill")).toBe(true);

  expect(document.activeElement).not.toBe(combobox);
  await focus(select);
  await expect.poll(() => document.activeElement).toBe(combobox);
});

test("supports native select required validation", async () => {
  const values: FormDataEntryValue[] = [];

  await render(
    <Test
      required
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        values.push(data.get("fruit")!);
      }}
    />,
  );

  await click(q.button("Submit"));

  expect(values).toEqual([]);
  expect(getNativeSelect().checkValidity()).toBe(false);
});
