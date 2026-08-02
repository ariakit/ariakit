import { afterEach, expect, test, vi } from "vitest";
import { scrollIntoView } from "./scroll-into-view.ts";

interface RectParams {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface DimensionsParams {
  clientLeft?: number;
  clientTop?: number;
  clientWidth: number;
  clientHeight: number;
  offsetWidth?: number;
  offsetHeight?: number;
  scrollWidth: number;
  scrollHeight: number;
}

interface ScrollStateParams {
  left?: number;
  top?: number;
  emitScroll?: boolean;
}

interface ScrollState {
  left: number;
  top: number;
  leftWrites: number[];
  topWrites: number[];
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

function setRect(element: HTMLElement, params: RectParams) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue(
    DOMRect.fromRect({
      x: params.left,
      y: params.top,
      width: params.width,
      height: params.height,
    }),
  );
}

function setDimensions(element: HTMLElement, params: DimensionsParams) {
  Object.defineProperties(element, {
    clientLeft: { configurable: true, value: params.clientLeft ?? 0 },
    clientTop: { configurable: true, value: params.clientTop ?? 0 },
    clientWidth: { configurable: true, value: params.clientWidth },
    clientHeight: { configurable: true, value: params.clientHeight },
    offsetWidth: {
      configurable: true,
      value: params.offsetWidth ?? params.clientWidth,
    },
    offsetHeight: {
      configurable: true,
      value: params.offsetHeight ?? params.clientHeight,
    },
    scrollWidth: { configurable: true, value: params.scrollWidth },
    scrollHeight: { configurable: true, value: params.scrollHeight },
  });
}

function setScrollState(
  element: HTMLElement,
  { left = 0, top = 0, emitScroll = false }: ScrollStateParams = {},
) {
  const state: ScrollState = {
    left,
    top,
    leftWrites: [],
    topWrites: [],
  };
  const dispatchScroll = () => {
    if (!emitScroll) return;
    element.dispatchEvent(new Event("scroll"));
  };
  Object.defineProperties(element, {
    scrollLeft: {
      configurable: true,
      get: () => state.left,
      set: (value: number) => {
        state.left = value;
        state.leftWrites.push(value);
        dispatchScroll();
      },
    },
    scrollTop: {
      configurable: true,
      get: () => state.top,
      set: (value: number) => {
        state.top = value;
        state.topWrites.push(value);
        dispatchScroll();
      },
    },
  });
  return state;
}

function createElements() {
  const scrollport = document.createElement("div");
  const target = document.createElement("div");
  scrollport.append(target);
  document.body.append(scrollport);
  return { scrollport, target };
}

test("centers vertically and uses nearest horizontal alignment", () => {
  const { scrollport, target } = createElements();
  scrollport.style.scrollPaddingTop = "4px";
  scrollport.style.scrollPaddingRight = "5px";
  scrollport.style.scrollPaddingBottom = "6px";
  scrollport.style.scrollPaddingLeft = "3px";
  target.style.scrollMarginTop = "2px";
  target.style.scrollMarginRight = "2px";
  target.style.scrollMarginBottom = "4px";
  target.style.scrollMarginLeft = "1px";
  setRect(scrollport, { left: 100, top: 50, width: 200, height: 160 });
  setRect(target, { left: 80, top: 130, width: 60, height: 20 });
  setDimensions(scrollport, {
    clientLeft: 2,
    clientTop: 1,
    clientWidth: 90,
    clientHeight: 70,
    offsetWidth: 100,
    offsetHeight: 80,
    scrollWidth: 300,
    scrollHeight: 400,
  });
  const state = setScrollState(scrollport, { left: 20, top: 30 });

  scrollIntoView(target, scrollport, "center");

  expect(state.left).toBe(4);
  expect(state.top).toBe(41);
});

test("moves the minimum distance on both axes", () => {
  const { scrollport, target } = createElements();
  setRect(scrollport, { left: 0, top: 0, width: 100, height: 100 });
  setRect(target, { left: 140, top: 120, width: 30, height: 50 });
  setDimensions(scrollport, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 250,
    scrollHeight: 300,
  });
  const state = setScrollState(scrollport, { left: 70, top: 50 });

  scrollIntoView(target, scrollport, "nearest");

  expect(state.left).toBe(140);
  expect(state.top).toBe(120);
});

test("uses the nearer edge for an oversized target", () => {
  const { scrollport, target } = createElements();
  setRect(scrollport, { left: 0, top: 0, width: 100, height: 100 });
  setRect(target, { left: 0, top: -20, width: 20, height: 110 });
  setDimensions(scrollport, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 100,
    scrollHeight: 300,
  });
  const state = setScrollState(scrollport);

  scrollIntoView(target, scrollport, "nearest");

  expect(state.leftWrites).toEqual([]);
  expect(state.top).toBe(-10);
});

test("centers on the logical block axis in a vertical writing mode", () => {
  const { scrollport, target } = createElements();
  scrollport.style.writingMode = "vertical-rl";
  setRect(scrollport, { left: 100, top: 0, width: 100, height: 100 });
  setRect(target, { left: 20, top: 0, width: 20, height: 20 });
  setDimensions(scrollport, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 300,
    scrollHeight: 100,
  });
  const state = setScrollState(scrollport);

  scrollIntoView(target, scrollport, "center");

  expect(state.left).toBe(-120);
  expect(state.topWrites).toEqual([]);
});

test("preserves a negative inline scroll origin in a sideways writing mode", () => {
  const { scrollport, target } = createElements();
  scrollport.style.writingMode = "sideways-lr";
  setRect(scrollport, { left: 0, top: 100, width: 100, height: 100 });
  setRect(target, { left: 40, top: 20, width: 20, height: 20 });
  setDimensions(scrollport, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 100,
    scrollHeight: 300,
  });
  const state = setScrollState(scrollport);

  scrollIntoView(target, scrollport, "center");

  expect(state.leftWrites).toEqual([]);
  expect(state.top).toBe(-80);
});

test("does not infer a transform from fractional layout rounding", () => {
  const { scrollport, target } = createElements();
  scrollport.style.width = "100.5px";
  scrollport.style.height = "100.5px";
  setRect(scrollport, { left: 0, top: 0, width: 100.5, height: 100.5 });
  setRect(target, { left: 0, top: 1000, width: 20, height: 20 });
  setDimensions(scrollport, {
    clientWidth: 100.5,
    clientHeight: 100.5,
    offsetWidth: 101,
    offsetHeight: 101,
    scrollWidth: 100.5,
    scrollHeight: 2000,
  });
  const state = setScrollState(scrollport);

  scrollIntoView(target, scrollport, "center");

  expect(state.leftWrites).toEqual([]);
  expect(state.top).toBe(959.75);
});

test("uses negative horizontal scroll positions in RTL", () => {
  const { scrollport, target } = createElements();
  scrollport.style.direction = "rtl";
  setRect(scrollport, { left: 100, top: 0, width: 100, height: 100 });
  setRect(target, { left: 20, top: 0, width: 20, height: 20 });
  setDimensions(scrollport, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 300,
    scrollHeight: 100,
  });
  const state = setScrollState(scrollport);

  scrollIntoView(target, scrollport, "nearest");

  expect(state.left).toBe(-80);
  expect(state.topWrites).toEqual([]);
});

test("does nothing for an unrelated target or disconnected scrollport", () => {
  const { scrollport, target } = createElements();
  const unrelatedTarget = document.createElement("div");
  document.body.append(unrelatedTarget);
  setRect(scrollport, { left: 0, top: 0, width: 100, height: 100 });
  setRect(target, { left: 40, top: 40, width: 20, height: 20 });
  setDimensions(scrollport, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 200,
    scrollHeight: 200,
  });
  const state = setScrollState(scrollport);

  scrollIntoView(unrelatedTarget, scrollport, "center");
  scrollIntoView(target, scrollport, "center");
  scrollport.remove();
  scrollIntoView(target, scrollport, "center");

  expect(state.leftWrites).toEqual([]);
  expect(state.topWrites).toEqual([]);
});

test("writes and emits scroll only on the explicit scrollport", () => {
  const outer = document.createElement("div");
  const scrollport = document.createElement("div");
  const target = document.createElement("div");
  outer.append(scrollport);
  scrollport.append(target);
  document.body.append(outer);

  setRect(scrollport, { left: 0, top: 0, width: 100, height: 100 });
  setRect(target, { left: 150, top: 150, width: 20, height: 20 });
  setDimensions(scrollport, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 300,
    scrollHeight: 300,
  });
  const scrollportState = setScrollState(scrollport, { emitScroll: true });
  const outerState = setScrollState(outer, { left: 12, top: 24 });
  document.documentElement.scrollLeft = 30;
  document.documentElement.scrollTop = 40;
  document.body.scrollLeft = 50;
  document.body.scrollTop = 60;
  const scrollIntoViewSpy = vi.spyOn(target, "scrollIntoView");
  const outerScrollSpy = vi.fn();
  const documentScrollSpy = vi.fn();
  outer.addEventListener("scroll", outerScrollSpy);
  document.addEventListener("scroll", documentScrollSpy);

  scrollIntoView(target, scrollport, "nearest");
  outer.removeEventListener("scroll", outerScrollSpy);
  document.removeEventListener("scroll", documentScrollSpy);

  expect(scrollportState.leftWrites).toEqual([70]);
  expect(scrollportState.topWrites).toEqual([70]);
  expect(outerState.leftWrites).toEqual([]);
  expect(outerState.topWrites).toEqual([]);
  expect(document.documentElement.scrollLeft).toBe(30);
  expect(document.documentElement.scrollTop).toBe(40);
  expect(document.body.scrollLeft).toBe(50);
  expect(document.body.scrollTop).toBe(60);
  expect(scrollIntoViewSpy).not.toHaveBeenCalled();
  expect(outerScrollSpy).not.toHaveBeenCalled();
  expect(documentScrollSpy).not.toHaveBeenCalled();
});
