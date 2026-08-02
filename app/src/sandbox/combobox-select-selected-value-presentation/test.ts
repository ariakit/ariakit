import { click, focus, press, q, sleep, type } from "@ariakit/test";
import { afterEach, expect, test, vi } from "vitest";

interface RectParams {
  top: number;
  height: number;
  width?: number;
}

interface ScrollportDimensions {
  height?: number;
  scrollHeight?: number;
  width?: number;
}

interface ScrollState {
  top: number;
  topWrites: number[];
}

afterEach(() => {
  vi.restoreAllMocks();
});

function getRect({ top, height, width = 200 }: RectParams) {
  return DOMRect.fromRect({ x: 0, y: top, width, height });
}

function setScrollportDimensions(
  scrollport: HTMLElement,
  { height = 120, scrollHeight = 1000, width = 200 }: ScrollportDimensions = {},
) {
  const state: ScrollState = { top: 0, topWrites: [] };
  Object.defineProperties(scrollport, {
    clientHeight: { configurable: true, value: height },
    clientWidth: { configurable: true, value: width },
    offsetHeight: { configurable: true, value: height },
    offsetWidth: { configurable: true, value: width },
    scrollHeight: { configurable: true, value: scrollHeight },
    scrollTop: {
      configurable: true,
      get: () => state.top,
      set: (value: number) => {
        state.top = value;
        state.topWrites.push(value);
      },
    },
    scrollWidth: { configurable: true, value: width },
  });
  vi.spyOn(scrollport, "getBoundingClientRect").mockReturnValue(
    getRect({ top: 0, height, width }),
  );
  return state;
}

function setTargetRect(
  target: HTMLElement,
  scrollport: HTMLElement,
  top = 900,
) {
  vi.spyOn(target, "getBoundingClientRect").mockImplementation(() =>
    getRect({ top: top - scrollport.scrollTop, height: 20 }),
  );
  return vi.spyOn(target, "scrollIntoView").mockImplementation(() => {});
}

function mockLateTargetRect(name: string, scrollport: HTMLElement, top = 900) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function mockRect(this: HTMLElement) {
      if (this.getAttribute("role") === "option") {
        if (this.textContent?.trim() === name) {
          return getRect({ top: top - scrollport.scrollTop, height: 20 });
        }
      }
      return getRect({ top: 0, height: 0, width: 0 });
    },
  );
}

// https://github.com/ariakit/ariakit/pull/6832
test("activates a far item reached through typeahead", async () => {
  const select = q.combobox("Selected fruit");
  await click(select);
  await type("ly");

  expect(q.option("Lychee")).toHaveAttribute("data-active-item");
  expect(select).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/6986
test("keyboard opening centers the last selected value", async () => {
  const select = q.combobox.ensure("Selected fruit");
  const listbox = q.listbox.ensure("Selected fruit", { hidden: true });
  const watermelon = q
    .within(listbox)
    .option.ensure("Watermelon", { hidden: true });
  const scrollState = setScrollportDimensions(listbox);
  const nativeScroll = setTargetRect(watermelon, listbox);

  await focus(select);
  await press.Enter();
  await sleep();

  expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  expect(watermelon).toHaveAttribute("aria-selected", "true");
  expect(watermelon).toHaveAttribute("data-active-item");
  expect(scrollState.topWrites).toContain(850);
  expect(nativeScroll).not.toHaveBeenCalled();
  expect(select).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/6986
test("centers a selected item that registers after opening", async () => {
  const select = q.combobox("Late selected fruit");
  const listbox = q.listbox.ensure("Late selected fruit", { hidden: true });
  setScrollportDimensions(listbox);
  mockLateTargetRect("Watermelon", listbox);

  await click(select);
  q.button.ensure("Register Late selected fruit items").click();
  await sleep();

  expect(q.option("Watermelon")).toBeInTheDocument();
  expect(listbox.scrollTop).toBe(850);
  expect(select).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/6986
test("navigation cancels a late selected-item presentation", async () => {
  const select = q.combobox("Late selected fruit");
  const listbox = q.listbox.ensure("Late selected fruit", { hidden: true });
  const scrollState = setScrollportDimensions(listbox);
  mockLateTargetRect("Watermelon", listbox);

  await click(select);
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveAttribute("data-active-item");

  q.button.ensure("Register Late selected fruit items").click();
  await sleep();

  expect(q.option("Apple")).toHaveAttribute("data-active-item");
  expect(q.option("Watermelon")).not.toHaveAttribute("data-active-item");
  expect(scrollState.topWrites).toEqual([]);
  expect(listbox.scrollTop).toBe(0);
  expect(select).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/6986
test("focus departure cancels selected-item presentation", async () => {
  const listbox = q.listbox.ensure("Focus moving filterable fruit", {
    hidden: true,
  });
  const watermelon = q
    .within(listbox)
    .option.ensure("Watermelon", { hidden: true });
  const scrollState = setScrollportDimensions(listbox);
  setTargetRect(watermelon, listbox);

  await click(q.combobox("Focus moving filterable fruit"));

  expect(q.option("Focus target")).toHaveFocus();
  expect(scrollState.topWrites).toEqual([]);
  expect(listbox.scrollTop).toBe(0);
});

// https://github.com/ariakit/ariakit/issues/6986
test("default-open presentation does not steal focus", async () => {
  const mount = q.button("Mount default-open fruit picker");

  await click(mount);

  expect(q.listbox("Default-open fruit")).toBeVisible();
  expect(q.option("Default Watermelon")).toBeInTheDocument();
  expect(mount).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/6986
test("centers the deprecated SelectPopover value", async () => {
  const select = q.combobox("Legacy fruit");
  const listbox = q.listbox.ensure("Legacy fruit", { hidden: true });
  const watermelon = q
    .within(listbox)
    .option.ensure("Legacy Watermelon", { hidden: true });
  const scrollState = setScrollportDimensions(listbox);
  const nativeScroll = setTargetRect(watermelon, listbox);

  await click(select);
  await sleep();

  expect(watermelon).toHaveAttribute("data-active-item");
  expect(scrollState.topWrites).toContain(850);
  expect(nativeScroll).not.toHaveBeenCalled();
  expect(listbox).toHaveFocus();
  expect(listbox).toHaveAttribute("aria-activedescendant", watermelon.id);
});
