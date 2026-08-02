import { render } from "@ariakit/test/react";
import { createElement, useRef } from "react";
import { afterEach, expect, test, vi } from "vitest";
import type { FocusPresentationScope } from "./focus-presentation.tsx";
import {
  createFocusPresentationScope,
  FocusPresentationScrollportProvider,
  focusWithoutScrolling,
  getFocusActiveElement,
  scheduleFocusPresentation,
  useFocusPresentationScrollport,
  useFocusPresentationTarget,
} from "./focus-presentation.tsx";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

function getElement(id: string) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element not found: ${id}`);
  return element;
}

function RegisteredTarget({
  id = "target",
  scope,
  registered = true,
}: {
  id?: string;
  scope: FocusPresentationScope;
  registered?: boolean;
}) {
  const ref = useFocusPresentationTarget(registered ? scope : null, null);
  return createElement("button", { id, ref });
}

function OwnedScrollTarget({ scope }: { scope: FocusPresentationScope }) {
  const scrollportRef = useRef<HTMLDivElement>(null);
  const scrollport = useFocusPresentationScrollport(scrollportRef);
  const targetRef = useFocusPresentationTarget(scope, scrollport);
  return createElement(
    "div",
    { id: "outer" },
    createElement(
      "div",
      { id: "scrollport", ref: scrollportRef },
      createElement("button", { id: "target", ref: targetRef }),
    ),
  );
}

function InnerListTarget({ scope }: { scope: FocusPresentationScope }) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollport = useFocusPresentationScrollport(listRef, true);
  const targetRef = useFocusPresentationTarget(scope, scrollport);
  return createElement(
    "div",
    { id: "list", ref: listRef },
    createElement("button", { id: "target", ref: targetRef }),
  );
}

function NestedListTarget({ scope }: { scope: FocusPresentationScope }) {
  const popupRef = useRef<HTMLDivElement>(null);
  const scrollport = useFocusPresentationScrollport(popupRef);
  return createElement(
    "div",
    { id: "popup", ref: popupRef },
    createElement(
      FocusPresentationScrollportProvider,
      { scrollport },
      createElement(InnerListTarget, { scope }),
    ),
  );
}

interface RectParams {
  left: number;
  top: number;
  width: number;
  height: number;
}

function setRect(
  element: HTMLElement,
  { left, top, width, height }: RectParams,
) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue(
    DOMRect.fromRect({ x: left, y: top, width, height }),
  );
}

function setDimensions(
  element: HTMLElement,
  {
    clientWidth,
    clientHeight,
    scrollWidth,
    scrollHeight,
  }: {
    clientWidth: number;
    clientHeight: number;
    scrollWidth: number;
    scrollHeight: number;
  },
) {
  Object.defineProperties(element, {
    clientWidth: { configurable: true, value: clientWidth },
    clientHeight: { configurable: true, value: clientHeight },
    offsetWidth: { configurable: true, value: clientWidth },
    offsetHeight: { configurable: true, value: clientHeight },
    scrollWidth: { configurable: true, value: scrollWidth },
    scrollHeight: { configurable: true, value: scrollHeight },
  });
}

function setScrollState(element: HTMLElement, left = 0, top = 0) {
  const leftWrites: number[] = [];
  const topWrites: number[] = [];
  Object.defineProperties(element, {
    scrollLeft: {
      configurable: true,
      get: () => left,
      set: (value: number) => {
        left = value;
        leftWrites.push(value);
        element.dispatchEvent(new Event("scroll"));
      },
    },
    scrollTop: {
      configurable: true,
      get: () => top,
      set: (value: number) => {
        top = value;
        topWrites.push(value);
        element.dispatchEvent(new Event("scroll"));
      },
    },
  });
  return { leftWrites, topWrites };
}

test("waits for the current open scope to be ready", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(RegisteredTarget, { scope }));
  const target = getElement("target");
  const focus = vi.spyOn(target, "focus");
  const onPresented = vi.fn();
  scope.setOwner(target);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  const update = positioning.beginUpdate();

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: true,
    requireScope: true,
    onPresented,
  });

  expect(focus).not.toHaveBeenCalled();
  expect(onPresented).not.toHaveBeenCalled();

  update.ready();

  expect(focus).toHaveBeenCalledOnce();
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(onPresented).toHaveBeenCalledOnce();
});

test("resolves deferred focus when the presentation runs", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(RegisteredTarget, { scope }));
  const target = getElement("target");
  const focus = vi.spyOn(target, "focus");
  let shouldFocus = false;
  scope.setOwner(target);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  const update = positioning.beginUpdate();

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: () => shouldFocus,
    requireScope: true,
  });

  shouldFocus = true;
  update.ready();

  expect(focus).toHaveBeenCalledOnce();
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
});

test("cancels a request owned by a closed persistent scope", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(RegisteredTarget, { scope }));
  const target = getElement("target");
  const focus = vi.spyOn(target, "focus");
  scope.setOwner(target);

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: true,
    requireScope: true,
  });

  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  positioning.beginUpdate().ready();

  expect(focus).not.toHaveBeenCalled();
});

test("binds a scope cycle before a late target is available", async () => {
  const scope = createFocusPresentationScope();
  await render(
    createElement(
      "div",
      null,
      createElement(RegisteredTarget, { id: "scope-target", scope }),
      createElement(RegisteredTarget, { id: "target", scope }),
    ),
  );
  const scopeTarget = getElement("scope-target");
  const target = getElement("target");
  const focus = vi.spyOn(target, "focus");
  let lateTarget: HTMLElement | null = null;
  scope.setOwner(scopeTarget);
  scope.setOpen(true);
  const firstPositioning = scope.beginPositioning();

  scheduleFocusPresentation({
    getTarget: () => lateTarget,
    getScopeTarget: () => scopeTarget,
    focus: true,
    requireScope: true,
    requireTargetScope: true,
  });

  scope.setOpen(false);
  scope.setOpen(true);
  lateTarget = target;
  firstPositioning.beginUpdate().ready();

  expect(focus).not.toHaveBeenCalled();

  const nextPositioning = scope.beginPositioning();
  const nextUpdate = nextPositioning.beginUpdate();
  scheduleFocusPresentation({
    getTarget: () => target,
    getScopeTarget: () => scopeTarget,
    focus: true,
    requireScope: true,
    requireTargetScope: true,
  });
  nextUpdate.ready();

  expect(focus).toHaveBeenCalledOnce();
});

test("focuses without native scrolling and scrolls only the owned scrollport", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(OwnedScrollTarget, { scope }));
  const outer = getElement("outer");
  const scrollport = getElement("scrollport");
  const target = getElement("target");
  setRect(scrollport, { left: 0, top: 0, width: 100, height: 100 });
  setRect(target, { left: 150, top: 150, width: 20, height: 20 });
  setDimensions(scrollport, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 300,
    scrollHeight: 300,
  });
  const scrollportState = setScrollState(scrollport);
  const outerState = setScrollState(outer, 12, 24);
  const outerScroll = vi.fn();
  const documentScroll = vi.fn();
  outer.addEventListener("scroll", outerScroll);
  document.addEventListener("scroll", documentScroll);
  const focus = vi.spyOn(target, "focus");
  const nativeScrollIntoView = vi.spyOn(target, "scrollIntoView");
  scope.setOwner(scrollport);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  positioning.beginUpdate().ready();

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: true,
    scroll: "nearest",
    requireScope: true,
  });
  outer.removeEventListener("scroll", outerScroll);
  document.removeEventListener("scroll", documentScroll);

  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(nativeScrollIntoView).not.toHaveBeenCalled();
  expect(scrollportState.leftWrites).toEqual([70]);
  expect(scrollportState.topWrites).toEqual([70]);
  expect(outerState.leftWrites).toEqual([]);
  expect(outerState.topWrites).toEqual([]);
  expect(outerScroll).not.toHaveBeenCalled();
  expect(documentScroll).not.toHaveBeenCalled();
});

test("uses the scrollable popup around a fully expanded nested list", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(NestedListTarget, { scope }));
  const popup = getElement("popup");
  const list = getElement("list");
  const target = getElement("target");
  setRect(popup, { left: 0, top: 0, width: 100, height: 100 });
  setRect(list, { left: 0, top: 0, width: 100, height: 300 });
  setRect(target, { left: 0, top: 150, width: 20, height: 20 });
  setDimensions(popup, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 100,
    scrollHeight: 300,
  });
  setDimensions(list, {
    clientWidth: 100,
    clientHeight: 300,
    scrollWidth: 100,
    scrollHeight: 300,
  });
  const popupState = setScrollState(popup);
  const listState = setScrollState(list);
  scope.setOwner(popup);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  positioning.beginUpdate().ready();

  scheduleFocusPresentation({
    getTarget: () => target,
    scroll: "center",
    requireScope: true,
  });

  expect(popupState.topWrites).toEqual([110]);
  expect(listState.topWrites).toEqual([]);
});

test("uses native presentation when no popup scope owns the target", () => {
  const target = document.createElement("button");
  document.body.append(target);
  const scrollIntoView = vi.spyOn(target, "scrollIntoView");

  scheduleFocusPresentation({
    getTarget: () => target,
    scroll: "center",
  });

  expect(scrollIntoView).toHaveBeenCalledOnce();
  expect(scrollIntoView).toHaveBeenCalledWith({
    block: "center",
    inline: "nearest",
  });
});

test("stops after an uncoordinated focus redirect", () => {
  const target = document.createElement("button");
  const other = document.createElement("button");
  document.body.append(target, other);
  target.addEventListener("focus", () => other.focus());
  const scrollIntoView = vi.spyOn(target, "scrollIntoView");
  const onPresented = vi.fn();

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: true,
    scroll: "nearest",
    onPresented,
  });

  expect(document.activeElement).toBe(other);
  expect(scrollIntoView).not.toHaveBeenCalled();
  expect(onPresented).not.toHaveBeenCalled();
});

test("stops when focus closes the bound scope", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(OwnedScrollTarget, { scope }));
  const scrollport = getElement("scrollport");
  const target = getElement("target");
  setRect(scrollport, { left: 0, top: 0, width: 100, height: 100 });
  setRect(target, { left: 0, top: 150, width: 20, height: 20 });
  setDimensions(scrollport, {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 100,
    scrollHeight: 300,
  });
  const scrollState = setScrollState(scrollport);
  const onPresented = vi.fn();
  scope.setOwner(scrollport);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  positioning.beginUpdate().ready();
  target.addEventListener("focus", () => scope.setOpen(false));

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: true,
    scroll: "nearest",
    requireScope: true,
    onPresented,
  });

  expect(document.activeElement).toBe(target);
  expect(scrollState.topWrites).toEqual([]);
  expect(onPresented).not.toHaveBeenCalled();
});

test("continues after a coordinated focus handoff", () => {
  const target = document.createElement("button");
  const base = document.createElement("button");
  document.body.append(target, base);
  target.addEventListener("focus", () => focusWithoutScrolling(base));
  const scrollIntoView = vi.spyOn(target, "scrollIntoView");
  const onPresented = vi.fn();

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: true,
    scroll: "nearest",
    onPresented,
  });

  expect(document.activeElement).toBe(base);
  expect(scrollIntoView).toHaveBeenCalledWith({
    block: "nearest",
    inline: "nearest",
  });
  expect(onPresented).toHaveBeenCalledOnce();
});

test("recognizes a coordinated focus handoff inside a shadow root", () => {
  const host = document.createElement("div");
  const shadowRoot = host.attachShadow({ mode: "open" });
  const target = document.createElement("button");
  const other = document.createElement("button");
  shadowRoot.append(target, other);
  document.body.append(host);
  target.addEventListener("focus", () => focusWithoutScrolling(other));
  const scrollIntoView = vi.spyOn(target, "scrollIntoView");
  const onPresented = vi.fn();

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: true,
    scroll: "nearest",
    onPresented,
  });

  expect(shadowRoot.activeElement).toBe(other);
  expect(scrollIntoView).toHaveBeenCalledOnce();
  expect(onPresented).toHaveBeenCalledOnce();
});

test("tracks focus relative to an element's shadow root", () => {
  const host = document.createElement("div");
  const shadowRoot = host.attachShadow({ mode: "open" });
  const inside = document.createElement("button");
  const outside = document.createElement("button");
  shadowRoot.append(inside);
  document.body.append(host, outside);

  inside.focus();

  expect(document.activeElement).toBe(host);
  expect(getFocusActiveElement(inside)).toBe(inside);

  outside.focus();

  expect(getFocusActiveElement(inside)).toBe(outside);
});

test("uses a distinct scope target to gate external focus", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(RegisteredTarget, { id: "scope-target", scope }));
  const scopeTarget = getElement("scope-target");
  const target = document.createElement("button");
  document.body.append(target);
  const focus = vi.spyOn(target, "focus");
  scope.setOwner(scopeTarget);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  const update = positioning.beginUpdate();

  scheduleFocusPresentation({
    getTarget: () => target,
    getScopeTarget: () => scopeTarget,
    focus: true,
    requireScope: true,
  });

  expect(focus).not.toHaveBeenCalled();

  update.ready();

  expect(focus).toHaveBeenCalledOnce();
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
});

test("requires a presentation target to belong to its scope", async () => {
  const targetScope = createFocusPresentationScope();
  const ownerScope = createFocusPresentationScope();
  await render(
    createElement(
      "div",
      null,
      createElement(RegisteredTarget, {
        id: "target",
        scope: targetScope,
      }),
      createElement(RegisteredTarget, {
        id: "scope-target",
        scope: ownerScope,
      }),
    ),
  );
  const target = getElement("target");
  const scopeTarget = getElement("scope-target");
  const focus = vi.spyOn(target, "focus");
  ownerScope.setOwner(scopeTarget);
  ownerScope.setOpen(true);
  const positioning = ownerScope.beginPositioning();
  positioning.beginUpdate().ready();

  scheduleFocusPresentation({
    getTarget: () => target,
    getScopeTarget: () => scopeTarget,
    focus: true,
    requireScope: true,
    requireTargetScope: true,
  });

  expect(focus).not.toHaveBeenCalled();
});

test("cancels when focus ownership departs while waiting", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(RegisteredTarget, { scope }));
  const target = getElement("target");
  const anchor = document.createElement("button");
  const other = document.createElement("button");
  document.body.append(anchor, other);
  anchor.focus();
  const focus = vi.spyOn(target, "focus");
  scope.setOwner(target);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  const update = positioning.beginUpdate();

  scheduleFocusPresentation({
    getTarget: () => target,
    isValid: () => document.activeElement === anchor,
    focus: true,
    requireScope: true,
  });

  other.focus();
  update.ready();

  expect(focus).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(other);
});

test("cancels when its source becomes invalid", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(RegisteredTarget, { scope }));
  const target = getElement("target");
  const focus = vi.spyOn(target, "focus");
  let valid = true;
  let retry = () => {};
  scope.setOwner(target);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  const update = positioning.beginUpdate();

  scheduleFocusPresentation({
    getTarget: () => target,
    subscribe(listener) {
      retry = listener;
      return () => {
        retry = () => {};
      };
    },
    isValid: () => valid,
    focus: true,
    requireScope: true,
  });

  valid = false;
  retry();
  update.ready();

  expect(focus).not.toHaveBeenCalled();
});

test("waits without canceling when its source is not ready", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(RegisteredTarget, { scope }));
  const target = getElement("target");
  const focus = vi.spyOn(target, "focus");
  let ready = false;
  let retry = () => {};
  scope.setOwner(target);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  positioning.beginUpdate().ready();

  scheduleFocusPresentation({
    getTarget: () => target,
    subscribe(listener) {
      retry = listener;
      return () => {
        retry = () => {};
      };
    },
    isReady: () => ready,
    focus: true,
    requireScope: true,
  });

  expect(focus).not.toHaveBeenCalled();

  ready = true;
  retry();

  expect(focus).toHaveBeenCalledOnce();
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
});

test("settles queued work after the scope becomes ready", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(RegisteredTarget, { scope }));
  const target = getElement("target");
  const focus = vi.spyOn(target, "focus");
  scope.setOwner(target);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  const update = positioning.beginUpdate();

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: true,
    requireScope: true,
    settle: true,
  });

  update.ready();

  expect(focus).not.toHaveBeenCalled();

  await Promise.resolve();

  expect(focus).not.toHaveBeenCalled();

  await Promise.resolve();

  expect(focus).toHaveBeenCalledOnce();
});

test("revalidates work queued while the ready scope settles", async () => {
  const scope = createFocusPresentationScope();
  await render(createElement(RegisteredTarget, { scope }));
  const target = getElement("target");
  const focus = vi.spyOn(target, "focus");
  let valid = true;
  scope.setOwner(target);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  const update = positioning.beginUpdate();

  scheduleFocusPresentation({
    getTarget: () => target,
    isValid: () => valid,
    focus: true,
    requireScope: true,
    settle: true,
  });

  update.ready();
  queueMicrotask(() => {
    valid = false;
  });
  await Promise.resolve();
  await Promise.resolve();

  expect(focus).not.toHaveBeenCalled();
});

test("retries when scope metadata is registered late", async () => {
  const scope = createFocusPresentationScope();
  const view = await render(
    createElement(RegisteredTarget, { scope, registered: false }),
  );
  const target = getElement("target");
  const focus = vi.spyOn(target, "focus");
  scope.setOwner(target);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  positioning.beginUpdate().ready();

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: true,
    requireScope: true,
  });

  expect(focus).not.toHaveBeenCalled();

  await view.rerender(
    createElement(RegisteredTarget, { scope, registered: true }),
  );

  expect(focus).toHaveBeenCalledOnce();
});

test("cancels when required target metadata is removed", async () => {
  const scope = createFocusPresentationScope();
  const view = await render(
    createElement(
      "div",
      null,
      createElement(RegisteredTarget, { id: "target", scope }),
      createElement(RegisteredTarget, { id: "scope-target", scope }),
    ),
  );
  const target = getElement("target");
  const scopeTarget = getElement("scope-target");
  const focus = vi.spyOn(target, "focus");
  scope.setOwner(scopeTarget);
  scope.setOpen(true);
  const positioning = scope.beginPositioning();
  const update = positioning.beginUpdate();

  scheduleFocusPresentation({
    getTarget: () => target,
    getScopeTarget: () => scopeTarget,
    focus: true,
    requireScope: true,
    requireTargetScope: true,
  });

  await view.rerender(
    createElement(
      "div",
      null,
      createElement(RegisteredTarget, {
        id: "target",
        scope,
        registered: false,
      }),
      createElement(RegisteredTarget, { id: "scope-target", scope }),
    ),
  );
  await Promise.resolve();
  update.ready();

  expect(focus).not.toHaveBeenCalled();
});

test("cancels when the target is reparented to another scope", async () => {
  const firstScope = createFocusPresentationScope();
  const secondScope = createFocusPresentationScope();
  const view = await render(
    createElement(RegisteredTarget, { scope: firstScope }),
  );
  const target = getElement("target");
  const focus = vi.spyOn(target, "focus");
  firstScope.setOwner(target);
  firstScope.setOpen(true);
  const firstPositioning = firstScope.beginPositioning();
  const firstUpdate = firstPositioning.beginUpdate();
  secondScope.setOwner(target);
  secondScope.setOpen(true);
  const secondPositioning = secondScope.beginPositioning();
  const secondUpdate = secondPositioning.beginUpdate();

  scheduleFocusPresentation({
    getTarget: () => target,
    focus: true,
    requireScope: true,
  });

  await view.rerender(createElement(RegisteredTarget, { scope: secondScope }));
  firstUpdate.ready();
  secondUpdate.ready();

  expect(focus).not.toHaveBeenCalled();
});

test("only the latest positioning update can make a scope ready", () => {
  const owner = document.createElement("div");
  document.body.append(owner);
  const scope = createFocusPresentationScope();
  scope.setOwner(owner);
  scope.setOpen(true);
  const firstPositioning = scope.beginPositioning();
  const staleUpdate = firstPositioning.beginUpdate();
  const latestUpdate = firstPositioning.beginUpdate();

  staleUpdate.ready();

  expect(staleUpdate.isCurrent()).toBe(false);
  expect(latestUpdate.isCurrent()).toBe(true);
  expect(scope.getSnapshot().ready).toBe(false);

  latestUpdate.ready();

  expect(scope.getSnapshot().ready).toBe(true);

  const latestPositioning = scope.beginPositioning();
  const latestRunUpdate = latestPositioning.beginUpdate();

  expect(scope.getSnapshot().ready).toBe(false);

  latestUpdate.ready();

  expect(scope.getSnapshot().ready).toBe(false);

  latestRunUpdate.ready();

  expect(scope.getSnapshot().ready).toBe(true);

  firstPositioning.dispose();

  expect(scope.getSnapshot().ready).toBe(true);

  latestPositioning.dispose();

  expect(scope.getSnapshot().ready).toBe(false);
});

test("keeps store-driven open state when its owner is replaced", async () => {
  const firstOwner = document.createElement("div");
  const nextOwner = document.createElement("div");
  document.body.append(firstOwner, nextOwner);
  const scope = createFocusPresentationScope();
  scope.setOwner(firstOwner);
  scope.setOpen(true);
  const initialCycle = scope.getSnapshot().cycle;

  scope.setOwner(null);
  await Promise.resolve();

  expect(scope.getSnapshot()).toMatchObject({
    open: true,
    owner: null,
    ready: false,
    cycle: initialCycle + 1,
  });

  scope.setOwner(nextOwner);

  expect(scope.getSnapshot()).toMatchObject({
    open: true,
    owner: nextOwner,
    cycle: initialCycle + 1,
  });
});

test("cleans up a source that retries synchronously", () => {
  const target = document.createElement("button");
  document.body.append(target);
  const unsubscribe = vi.fn();

  scheduleFocusPresentation({
    getTarget: () => target,
    subscribe(retry) {
      retry();
      return unsubscribe;
    },
    focus: true,
  });

  expect(unsubscribe).toHaveBeenCalledOnce();
});

test("emits over a stable listener snapshot", () => {
  const scope = createFocusPresentationScope();
  let calls = 0;
  let unsubscribe = () => {};
  const listener = () => {
    calls += 1;
    unsubscribe();
    unsubscribe = scope.subscribe(listener);
  };
  unsubscribe = scope.subscribe(listener);

  scope.setOpen(true);

  unsubscribe();
  expect(calls).toBe(1);
});
