// The native value setters read in `setNativeValue` are intentionally captured
// unbound and invoked with an explicit receiver via `.call`.
// oxlint-disable unbound-method

// Part of this code is based on https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/event-map.js
// and https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/events.js
// Original work licensed under the MIT License, Copyright (c) Kent C. Dodds.

import { getConfig } from "./config.ts";

export interface EventMapEntry {
  EventType: string;
  defaultInit: EventInit;
}

// Constraint used for the `eventMap` literal. It mirrors `EventMapEntry` but
// allows event-specific init keys such as `charCode` (keyboard) and `button`
// (mouse) that are not part of the base `EventInit`, which the object-literal
// excess-property check would otherwise reject.
interface EventMapEntryConstraint {
  EventType: string;
  defaultInit: EventInit & { [key: string]: unknown };
}

// Typed as a plain object literal (not `Record<string, EventMapEntry>`) so that
// `keyof typeof eventMap` resolves to the literal union of event names, which is
// what the `EventType` type and the per-key `createEvent`/`fireEvent` methods
// rely on.
export const eventMap = {
  // Clipboard Events
  copy: {
    EventType: "ClipboardEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  cut: {
    EventType: "ClipboardEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  paste: {
    EventType: "ClipboardEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  // Composition Events
  compositionEnd: {
    EventType: "CompositionEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  compositionStart: {
    EventType: "CompositionEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  compositionUpdate: {
    EventType: "CompositionEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  // Keyboard Events
  keyDown: {
    EventType: "KeyboardEvent",
    defaultInit: {
      bubbles: true,
      cancelable: true,
      charCode: 0,
      composed: true,
    },
  },
  keyPress: {
    EventType: "KeyboardEvent",
    defaultInit: {
      bubbles: true,
      cancelable: true,
      charCode: 0,
      composed: true,
    },
  },
  keyUp: {
    EventType: "KeyboardEvent",
    defaultInit: {
      bubbles: true,
      cancelable: true,
      charCode: 0,
      composed: true,
    },
  },
  // Focus Events
  focus: {
    EventType: "FocusEvent",
    defaultInit: { bubbles: false, cancelable: false, composed: true },
  },
  blur: {
    EventType: "FocusEvent",
    defaultInit: { bubbles: false, cancelable: false, composed: true },
  },
  focusIn: {
    EventType: "FocusEvent",
    defaultInit: { bubbles: true, cancelable: false, composed: true },
  },
  focusOut: {
    EventType: "FocusEvent",
    defaultInit: { bubbles: true, cancelable: false, composed: true },
  },
  // Form Events
  change: {
    EventType: "Event",
    defaultInit: { bubbles: true, cancelable: false },
  },
  input: {
    EventType: "InputEvent",
    defaultInit: { bubbles: true, cancelable: false, composed: true },
  },
  invalid: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: true },
  },
  submit: {
    EventType: "Event",
    defaultInit: { bubbles: true, cancelable: true },
  },
  reset: {
    EventType: "Event",
    defaultInit: { bubbles: true, cancelable: true },
  },
  // Mouse Events
  click: {
    EventType: "MouseEvent",
    defaultInit: { bubbles: true, cancelable: true, button: 0, composed: true },
  },
  contextMenu: {
    EventType: "MouseEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  dblClick: {
    EventType: "MouseEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  drag: {
    EventType: "DragEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  dragEnd: {
    EventType: "DragEvent",
    defaultInit: { bubbles: true, cancelable: false, composed: true },
  },
  dragEnter: {
    EventType: "DragEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  dragExit: {
    EventType: "DragEvent",
    defaultInit: { bubbles: true, cancelable: false, composed: true },
  },
  dragLeave: {
    EventType: "DragEvent",
    defaultInit: { bubbles: true, cancelable: false, composed: true },
  },
  dragOver: {
    EventType: "DragEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  dragStart: {
    EventType: "DragEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  drop: {
    EventType: "DragEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  mouseDown: {
    EventType: "MouseEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  mouseEnter: {
    EventType: "MouseEvent",
    defaultInit: { bubbles: false, cancelable: false, composed: true },
  },
  mouseLeave: {
    EventType: "MouseEvent",
    defaultInit: { bubbles: false, cancelable: false, composed: true },
  },
  mouseMove: {
    EventType: "MouseEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  mouseOut: {
    EventType: "MouseEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  mouseOver: {
    EventType: "MouseEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  mouseUp: {
    EventType: "MouseEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  // Selection Events
  select: {
    EventType: "Event",
    defaultInit: { bubbles: true, cancelable: false },
  },
  // Touch Events
  touchCancel: {
    EventType: "TouchEvent",
    defaultInit: { bubbles: true, cancelable: false, composed: true },
  },
  touchEnd: {
    EventType: "TouchEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  touchMove: {
    EventType: "TouchEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  touchStart: {
    EventType: "TouchEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  // UI Events
  resize: {
    EventType: "UIEvent",
    defaultInit: { bubbles: false, cancelable: false },
  },
  scroll: {
    EventType: "UIEvent",
    defaultInit: { bubbles: false, cancelable: false },
  },
  // Wheel Events
  wheel: {
    EventType: "WheelEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  // Media Events
  abort: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  canPlay: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  canPlayThrough: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  durationChange: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  emptied: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  encrypted: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  ended: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  loadedData: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  loadedMetadata: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  loadStart: {
    EventType: "ProgressEvent",
    defaultInit: { bubbles: false, cancelable: false },
  },
  pause: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  play: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  playing: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  progress: {
    EventType: "ProgressEvent",
    defaultInit: { bubbles: false, cancelable: false },
  },
  rateChange: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  seeked: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  seeking: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  stalled: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  suspend: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  timeUpdate: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  volumeChange: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  waiting: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  // Events
  load: {
    // load events can be UIEvent or Event depending on what generated them.
    // This is where this abstraction breaks down, but the common targets
    // (`<img />`, `<script />`, and window) never receive a UIEvent.
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  error: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  // Animation Events
  animationStart: {
    EventType: "AnimationEvent",
    defaultInit: { bubbles: true, cancelable: false },
  },
  animationEnd: {
    EventType: "AnimationEvent",
    defaultInit: { bubbles: true, cancelable: false },
  },
  animationIteration: {
    EventType: "AnimationEvent",
    defaultInit: { bubbles: true, cancelable: false },
  },
  // Transition Events
  transitionCancel: {
    EventType: "TransitionEvent",
    defaultInit: { bubbles: true, cancelable: false },
  },
  transitionEnd: {
    EventType: "TransitionEvent",
    defaultInit: { bubbles: true, cancelable: true },
  },
  transitionRun: {
    EventType: "TransitionEvent",
    defaultInit: { bubbles: true, cancelable: false },
  },
  transitionStart: {
    EventType: "TransitionEvent",
    defaultInit: { bubbles: true, cancelable: false },
  },
  // Pointer Events
  pointerOver: {
    EventType: "PointerEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  pointerEnter: {
    EventType: "PointerEvent",
    defaultInit: { bubbles: false, cancelable: false },
  },
  pointerDown: {
    EventType: "PointerEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  pointerMove: {
    EventType: "PointerEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  pointerUp: {
    EventType: "PointerEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  pointerCancel: {
    EventType: "PointerEvent",
    defaultInit: { bubbles: true, cancelable: false, composed: true },
  },
  pointerOut: {
    EventType: "PointerEvent",
    defaultInit: { bubbles: true, cancelable: true, composed: true },
  },
  pointerLeave: {
    EventType: "PointerEvent",
    defaultInit: { bubbles: false, cancelable: false },
  },
  gotPointerCapture: {
    EventType: "PointerEvent",
    defaultInit: { bubbles: true, cancelable: false, composed: true },
  },
  lostPointerCapture: {
    EventType: "PointerEvent",
    defaultInit: { bubbles: true, cancelable: false, composed: true },
  },
  // History Events
  popState: {
    EventType: "PopStateEvent",
    defaultInit: { bubbles: true, cancelable: false },
  },
  // Window Events
  offline: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  online: {
    EventType: "Event",
    defaultInit: { bubbles: false, cancelable: false },
  },
  pageHide: {
    EventType: "PageTransitionEvent",
    defaultInit: { bubbles: true, cancelable: true },
  },
  pageShow: {
    EventType: "PageTransitionEvent",
    defaultInit: { bubbles: true, cancelable: true },
  },
} satisfies { [name: string]: EventMapEntryConstraint };

export const eventAliasMap = {
  doubleClick: "dblClick",
} satisfies { [alias: string]: keyof typeof eventMap };

/**
 * Union of canonical event names defined in {@link eventMap}.
 */
export type EventType = keyof typeof eventMap;

type EventAlias = keyof typeof eventAliasMap;

// Nodes that `createEvent`/`fireEvent` accept as targets.
type EventTargetNode = Document | Element | Window | Node;

interface CreateEventOptions {
  EventType?: string;
  defaultInit?: EventInit;
}

type CreateEventMethod = (target: EventTargetNode, init?: object) => Event;

type FireEventMethod = (target: EventTargetNode, init?: object) => boolean;

interface CreateEventFunction {
  (
    eventName: string,
    node: EventTargetNode,
    init?: object,
    options?: CreateEventOptions,
  ): Event;
}

interface FireEventFunction {
  (element: EventTargetNode, event: Event): boolean;
}

// Both objects expose a method per canonical event name. The mapped keys are
// exactly `EventType` (not the aliases) so that `keyof typeof fireEvent` equals
// `EventType`: consumers do `getKeys(fireEvent)` and index objects keyed by
// `EventType`, which only type-checks when the two key sets match. Alias methods
// (e.g. `fireEvent.doubleClick`) still exist at runtime; they are reached through
// dynamic indexing rather than static property access.
type CreateEvent = CreateEventFunction & {
  [K in EventType]: CreateEventMethod;
};

type FireEvent = FireEventFunction & {
  [K in EventType]: FireEventMethod;
};

// Structural view of the values `getWindowFromNode` probes. The upstream helper
// receives arbitrary input (documents, DOM nodes, windows, and the misuse cases
// it reports), so every property is optional and read defensively.
interface NodeLike {
  defaultView?: (Window & typeof globalThis) | null;
  ownerDocument?: { defaultView?: (Window & typeof globalThis) | null } | null;
  window?: Window & typeof globalThis;
  then?: unknown;
}

// Resolves the constructor for a given event type from the node's own window,
// so events created for a node always use that document's realm. Adapted from
// `getWindowFromNode` in the upstream `helpers.js`.
function getWindowFromNode(node: EventTargetNode): Window & typeof globalThis {
  const candidate: NodeLike = node;
  if (candidate.defaultView) {
    // node is a document
    return candidate.defaultView;
  }
  if (candidate.ownerDocument?.defaultView) {
    // node is a DOM node
    return candidate.ownerDocument.defaultView;
  }
  if (candidate.window) {
    // node is a window
    return candidate.window;
  }
  if (candidate.ownerDocument && candidate.ownerDocument.defaultView === null) {
    throw new Error(
      "It looks like the window object is not available for the provided node.",
    );
  }
  if (candidate.then instanceof Function) {
    throw new Error(
      "It looks like you passed a Promise object instead of a DOM node. Did " +
        "you do something like `fireEvent.click(screen.findBy...` when you " +
        "meant to use a `getBy` query `fireEvent.click(screen.getBy...`, or " +
        "await the findBy query `fireEvent.click(await screen.findBy...`?",
    );
  }
  if (Array.isArray(node)) {
    throw new Error(
      "It looks like you passed an Array instead of a DOM node. Did you do " +
        "something like `fireEvent.click(screen.getAllBy...` when you meant to " +
        "use a `getBy` query `fireEvent.click(screen.getBy...`?",
    );
  }
  throw new Error(
    `The given node is not an Element, the node type is: ${typeof node}.`,
  );
}

// Sets a node's `value` through the prototype setter so that React's tracked
// value stays in sync. See https://github.com/facebook/react/issues/10135#issuecomment-401496776
function setNativeValue(element: EventTargetNode, value: unknown) {
  const { set: valueSetter } =
    Object.getOwnPropertyDescriptor(element, "value") || {};
  const prototype = Object.getPrototypeOf(element);
  const { set: prototypeValueSetter } =
    Object.getOwnPropertyDescriptor(prototype, "value") || {};
  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
    return;
  }
  if (valueSetter) {
    valueSetter.call(element, value);
    return;
  }
  throw new Error("The given element does not have a value setter");
}

/**
 * Creates an event of `eventName` for `node`, merging `init` over the event
 * type's `defaultInit`. Handles `target.value`/`target.files` assignment and
 * `dataTransfer`/`clipboardData` properties the same way Testing Library does.
 *
 * Prefer the per-event helpers (`createEvent.click(node, init)` and friends),
 * which fill in the correct `EventType`/`defaultInit` for you.
 */
export const createEvent = createEventBase as CreateEvent;

function createEventBase(
  eventName: string,
  node: EventTargetNode,
  init?: object,
  { EventType = "Event", defaultInit = {} }: CreateEventOptions = {},
): Event {
  if (!node) {
    throw new Error(
      `Unable to fire a "${eventName}" event - please provide a DOM element.`,
    );
  }
  const eventInit: EventInit & { [key: string]: unknown } = {
    ...defaultInit,
    ...init,
  };
  const { target: { value, files, ...targetProperties } = {} } = eventInit as {
    target?: { value?: unknown; files?: unknown; [key: string]: unknown };
  };
  if (value !== undefined) {
    setNativeValue(node, value);
  }
  if (files !== undefined) {
    // `input.files` is a read-only property, so it cannot be assigned directly.
    // Redefining the property is the supported workaround.
    Object.defineProperty(node, "files", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: files,
    });
  }
  Object.assign(node, targetProperties);
  const window = getWindowFromNode(node);
  const EventConstructor = Reflect.get(window, EventType) || window.Event;
  if (typeof EventConstructor !== "function") {
    throw new Error(`Unable to find a constructor for event "${eventName}".`);
  }
  const event = new EventConstructor(eventName, eventInit);

  // `DataTransfer` is not supported in jsdom, so copy the requested properties
  // onto a real `DataTransfer` instance when available, or fall back to the
  // provided object. See https://github.com/jsdom/jsdom/issues/1568
  const dataTransferKeys = ["dataTransfer", "clipboardData"] as const;
  for (const dataTransferKey of dataTransferKeys) {
    const dataTransferValue = eventInit[dataTransferKey];
    if (typeof dataTransferValue !== "object" || dataTransferValue === null) {
      continue;
    }
    if (typeof window.DataTransfer === "function") {
      const target = Object.getOwnPropertyNames(dataTransferValue).reduce(
        (acc, propName) => {
          Object.defineProperty(acc, propName, {
            value: Reflect.get(dataTransferValue, propName),
          });
          return acc;
        },
        new window.DataTransfer(),
      );
      Object.defineProperty(event, dataTransferKey, { value: target });
    } else {
      Object.defineProperty(event, dataTransferKey, {
        value: dataTransferValue,
      });
    }
  }
  return event;
}

/**
 * Dispatches `event` on `element`, routing the dispatch through the configured
 * `eventWrapper` (the React integration runs it inside `act`). Returns `false`
 * when the event's default action was prevented, `true` otherwise.
 *
 * Prefer the per-event helpers (`fireEvent.click(node, init)` and friends),
 * which build and dispatch the event in one call.
 */
export const fireEvent = fireEventBase as FireEvent;

function fireEventBase(element: EventTargetNode, event: Event): boolean {
  return getConfig().eventWrapper(() => {
    if (!event) {
      throw new Error(
        "Unable to fire an event - please provide an event object.",
      );
    }
    if (!element) {
      throw new Error(
        `Unable to fire a "${event.type}" event - please provide a DOM element.`,
      );
    }
    return element.dispatchEvent(event);
  });
}

// Attach a per-event method to both `createEvent` and `fireEvent`, mirroring the
// upstream loop. The DOM event name is the lowercased map key.
for (const key of Object.keys(eventMap) as EventType[]) {
  const entry = eventMap[key];
  const { EventType, defaultInit } = entry;
  const eventName = key.toLowerCase();
  createEvent[key] = (node, init) =>
    createEventBase(eventName, node, init, { EventType, defaultInit });
  fireEvent[key] = (node, init) =>
    fireEventBase(node, createEvent[key](node, init));
}

// Wire up alias methods (e.g. `doubleClick` -> `dblClick`) so they forward to
// the canonical handler. Matching upstream, only `fireEvent` gets alias methods;
// they live outside the static `FireEvent` key set (which must stay equal to
// `EventType`) and are reached through dynamic indexing. They are collected here
// and attached with `Object.assign` so the writes don't require alias keys to be
// part of `FireEvent`.
const fireEventAliases: Record<EventAlias, FireEventMethod> = {
  doubleClick: (node, init) => fireEvent[eventAliasMap.doubleClick](node, init),
};
Object.assign(fireEvent, fireEventAliases);
