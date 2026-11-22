import * as ak from "@ariakit/react";
import { useMergeRefs, useSafeLayoutEffect } from "@ariakit/react-utils";
import { getWindow, isSafari } from "@ariakit/utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  glider,
  gliderBox,
  gliderCopy,
  gliderGroup,
  gliderLayer,
  gliderMover,
  gliderScale,
  gliderScaleProbe,
  gliderTrack,
  gliderWindow,
} from "../styles/glider.ts";

type GliderGroupVariants = VariantProps<typeof gliderGroup>;

type GliderState = "idle" | "hover" | "selected";

// The selector of the ui-selected variant in ui.css.
const selectedSelector = `:is(${[
  ":checked",
  "label:has(input:checked)",
  '[aria-checked="true"]',
  '[aria-selected="true"]',
  '[data-selected="true"]',
  '[aria-current]:not([aria-current=""], [aria-current="false"])',
].join(",")})`;

const disabledSelector =
  ':is(:disabled, [aria-disabled="true"], label:has(input:disabled))';

// Items paint their own state in these modes, so the glider stays off.
const offQuery = "(forced-colors: active), (prefers-reduced-motion: reduce)";

const stateAttributes = [
  "aria-checked",
  "aria-selected",
  "aria-current",
  "data-selected",
];

const svgNamespace = "http://www.w3.org/2000/svg";

// A copy is only a picture of an item. These attributes would make it take the
// place of the item for labels, forms, focus, and assistive technologies.
const identityAttributes = [
  "id",
  "for",
  "name",
  "href",
  "role",
  "tabindex",
  "aria-controls",
  "aria-describedby",
  "aria-labelledby",
  "data-focus-visible",
  "data-active-item",
  "data-glider-masked",
];

// A copy is not in the place of its item, so a rule that needs that place does
// not match it, such as a rule for the direct children of the group. The copy
// takes these values from its item instead.
const placeProperties = [
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "column-gap",
  "row-gap",
  "justify-content",
  "align-items",
  "text-align",
  "min-width",
  "max-width",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
];

// The values that only the content of an item needs. The copy has its own place
// and its own size.
const contentProperties = [
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
];

const gliderScaleClass = gliderScale.htmlObj().class;
const gliderScaleProbeClass = gliderScaleProbe.htmlObj().class;
const gliderTrackClass = gliderTrack.htmlObj().class;
const gliderMoverClass = gliderMover.htmlObj().class;
const gliderBoxClass = gliderBox.htmlObj().class;
const gliderWindowClass = gliderWindow.htmlObj().class;
const gliderLayerClass = gliderLayer.htmlObj().class;
const gliderIdleLayerClass = gliderLayer.htmlObj({ $behind: true }).class;
const gliderCopyClass = gliderCopy.htmlObj().class;

interface ItemRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function isElement(target: EventTarget | null): target is Element {
  if (!target) return false;
  return "closest" in target;
}

/**
 * The element around the items. An element with no box of its own, such as the
 * list of a navigation, can't place the glider.
 */
function getGroup(root: HTMLElement | null) {
  let group = root?.parentElement;
  while (group) {
    const { display } = getWindow(group).getComputedStyle(group);
    if (display !== "contents") break;
    group = group.parentElement;
  }
  return group;
}

/**
 * The element around the group whose followers follow the selected box of the
 * group. A group in a follower, such as a segmented control in the panel of
 * folder tabs, is not the strip of that scope, so it has no followers.
 */
function getScope(group: HTMLElement) {
  const scope = group.closest<HTMLElement>(".glider-scope");
  if (!scope) return group;
  const follower = group.closest(".glider-follower");
  if (follower && scope.contains(follower)) return group;
  return scope;
}

function getItems(group: HTMLElement, root: HTMLElement) {
  const controls = group.querySelectorAll<HTMLElement>(".control");
  return Array.from(controls).filter((control) => {
    if (root.contains(control)) return false;
    // A control inside another control is content, not an item.
    return !control.parentElement?.closest(".control");
  });
}

/**
 * How many screen pixels a CSS pixel takes in the glider, from CSS zoom or a
 * transform on the group or its ancestors. The probe has a fixed CSS size, so
 * its box on the screen gives the scale.
 */
function getScale(probe: HTMLElement, rect: DOMRect) {
  return {
    x: rect.width / probe.offsetWidth || 1,
    y: rect.height / probe.offsetHeight || 1,
  };
}

/**
 * The box of an element from the start of the group's scrollable content, in
 * CSS pixels of the glider. The scale probe sits at that start, so it scrolls
 * with the items.
 */
function getRect(probe: HTMLElement, element: HTMLElement): ItemRect {
  const probeRect = probe.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  // The boxes from getBoundingClientRect() include CSS zoom and transforms, but
  // the CSS lengths that the glider writes do not.
  const scale = getScale(probe, probeRect);
  return {
    x: (rect.left - probeRect.left) / scale.x,
    y: (rect.top - probeRect.top) / scale.y,
    width: rect.width / scale.x,
    height: rect.height / scale.y,
  };
}

interface InlineOffsets {
  start: number;
  end: number;
}

/**
 * The parts beside the group in a row with the `glider-row` class, such as the
 * controls beside the strip of a tab row. The scroll button areas of a carousel
 * row lie over the ends of the group, not beside it, and a part that the page
 * doesn't lay out has no place in the row.
 */
function getRowParts(group: HTMLElement) {
  const row = group.parentElement;
  if (!row?.classList.contains("glider-row")) return [];
  return Array.from(row.children).filter((part) => {
    if (part === group) return false;
    if (part.classList.contains("carousel-button-area")) return false;
    return part.getClientRects().length > 0;
  });
}

interface RowInsets {
  left: number;
  right: number;
}

/**
 * How far the group is from the left and the right of the row around it, in CSS
 * pixels of the glider. On each side, the row ends at the outermost part on
 * that side, or at the group when no part is there. The group can reach under a
 * part beside it, so an inset can be negative, such as next to a part that
 * folds to no width.
 */
function getRowInsets(group: HTMLElement, probe: HTMLElement): RowInsets {
  const groupRect = group.getBoundingClientRect();
  const middle = groupRect.left + groupRect.width / 2;
  let left: number | null = null;
  let right: number | null = null;
  for (const part of getRowParts(group)) {
    const rect = part.getBoundingClientRect();
    if (rect.left + rect.width / 2 < middle) {
      left = Math.min(left ?? rect.left, rect.left);
    } else {
      right = Math.max(right ?? rect.right, rect.right);
    }
  }
  // The parts are on the screen, and the insets are in CSS pixels of the
  // glider.
  const scale = getScale(probe, probe.getBoundingClientRect());
  return {
    left: left == null ? 0 : (groupRect.left - left) / scale.x,
    right: right == null ? 0 : (right - groupRect.right) / scale.x,
  };
}

/**
 * How far a box is from the start and from the end of the group's scrollable
 * content, along the inline axis.
 */
function getInlineOffsets(group: HTMLElement, rect: ItemRect): InlineOffsets {
  const { direction } = getWindow(group).getComputedStyle(group);
  const overflow = group.scrollWidth - group.clientWidth;
  const left = rect.x;
  const right = group.clientWidth - rect.x - rect.width;
  // The content of a right-to-left group grows past its left side.
  if (direction === "rtl") return { start: right, end: left + overflow };
  return { start: left, end: right + overflow };
}

/** Whether two boxes share an area, with the first one grown to hold both. */
function isOnPath(from: ItemRect, to: ItemRect, rect: ItemRect) {
  const left = Math.min(from.x, to.x);
  const top = Math.min(from.y, to.y);
  const right = Math.max(from.x + from.width, to.x + to.width);
  const bottom = Math.max(from.y + from.height, to.y + to.height);
  if (rect.x >= right) return false;
  if (rect.x + rect.width <= left) return false;
  if (rect.y >= bottom) return false;
  return rect.y + rect.height > top;
}

/**
 * Whether an element paints a surface that hides what is behind it. A gradient
 * counts as a surface.
 */
function hasOpaqueSurface(element: HTMLElement) {
  const style = getWindow(element).getComputedStyle(element);
  if (style.backgroundImage !== "none") return true;
  const color = style.backgroundColor;
  if (color === "transparent") return false;
  // Modern color functions put the alpha after a slash.
  const [, slashAlpha] = color.split("/");
  if (slashAlpha != null) return Number.parseFloat(slashAlpha) >= 1;
  const legacyAlpha = color.match(/^rgba\(.*,\s*([\d.]+)\)$/)?.[1];
  if (legacyAlpha != null) return Number.parseFloat(legacyAlpha) >= 1;
  return true;
}

/** Makes an element show a state, whatever the state of its source. */
function forceState(element: HTMLElement, state: GliderState) {
  for (const attribute of stateAttributes) {
    element.removeAttribute(attribute);
  }
  element.classList.toggle("ui-hovered", state === "hover");
  if (state === "selected") {
    element.setAttribute("data-selected", "true");
  }
  // A checked input in a label selects the label, and a second checked radio
  // with the same name would uncheck the real one.
  for (const input of element.querySelectorAll("input")) {
    input.removeAttribute("name");
    input.removeAttribute("checked");
    input.checked = state === "selected";
  }
}

/** Whether an element shows keyboard focus, as the ui-focus-visible variant. */
function isFocusVisible(element: HTMLElement) {
  return element.matches(":focus-visible, [data-focus-visible]");
}

function hasStyle(node: Element): node is HTMLElement | SVGElement {
  return "style" in node;
}

interface CreateCopyParams {
  /** The item to copy. It must be in the state of the copy. */
  element: HTMLElement;
  /** The place and the size of the copy. */
  rect: ItemRect;
  state: GliderState;
  /**
   * The item whose look the copy takes. The content of a copy in a box must fit
   * the surface of the box, which has the look of the item that the box travels
   * to. Without it, the copy keeps the look of its item.
   */
  look?: HTMLElement;
}

/**
 * A copy of an item with its content, at the place of the item. The copy takes
 * from the item the values that depend on the place of the item.
 */
function createCopy({ element, rect, state, look }: CreateCopyParams) {
  // cloneNode keeps the element type of the source.
  const copy = element.cloneNode(true) as HTMLElement;
  if (look) {
    copy.className = look.className;
    copy.style.cssText = look.style.cssText;
  }
  const sources = [element, ...element.querySelectorAll("*")];
  const view = getWindow(element);
  [copy, ...copy.querySelectorAll("*")].forEach((node, index) => {
    for (const attribute of identityAttributes) {
      // In SVG, href points to the graphic that an element such as use draws.
      if (attribute === "href" && node.namespaceURI === svgNamespace) continue;
      node.removeAttribute(attribute);
    }
    const source = sources[index];
    if (!source) return;
    if (!hasStyle(node)) return;
    const style = view.getComputedStyle(source);
    const properties =
      node === copy
        ? placeProperties
        : [...placeProperties, ...contentProperties];
    for (const property of properties) {
      node.style.setProperty(property, style.getPropertyValue(property));
    }
  });
  forceState(copy, state);
  // An item can show its focus on its surface, which the box paints. Then its
  // content has the colors that fit that surface.
  if (look && isFocusVisible(look)) {
    copy.setAttribute("data-focus-visible", "");
  }
  copy.className = `${copy.className} ${gliderCopyClass}`;
  copy.style.left = `${rect.x}px`;
  copy.style.top = `${rect.y}px`;
  copy.style.width = `${rect.width}px`;
  copy.style.height = `${rect.height}px`;
  return copy;
}

/**
 * The longest transition time of an element in milliseconds. The browser
 * resolves each computed duration to seconds, `calc()` included.
 */
function getTransitionTime(element: HTMLElement) {
  const { transitionDuration } = getWindow(element).getComputedStyle(element);
  const times = transitionDuration
    .split(",")
    .map((value) => Number.parseFloat(value) * 1000)
    .filter((time) => !Number.isNaN(time));
  return Math.max(0, ...times);
}

function createElement(parent: HTMLElement, className: string) {
  const element = parent.ownerDocument.createElement("span");
  element.className = className;
  parent.append(element);
  return element;
}

interface GliderTrack {
  element: HTMLElement;
  /** The element that moves the box. */
  mover: HTMLElement;
  /** The elements that travel: the mover of the box first. */
  movers: HTMLElement[];
  box: HTMLElement;
  /** The elements that read the place of the box: the box first. */
  followers: HTMLElement[];
  /** The followers that have the place of the box. */
  placed: WeakSet<HTMLElement>;
  state: GliderState;
  /** The item and the place that the box copies, to skip equal updates. */
  key: string | null;
  /**
   * When the first frame after the last shift ran, from `performance.now()`.
   * The travel of the shift starts on the screen at about that time. In Chrome,
   * it starts after the work of that frame. So after a long frame, a new travel
   * that starts before Chrome reports the start time starts ahead of the box:
   * about a third of the way after 30ms of work, with the default travel time.
   */
  shownAt: number | null;
  /** The frame request that sets `shownAt`. */
  shownRequest: number;
}

function createTrack(root: HTMLElement, state: GliderState) {
  const element = createElement(root, gliderTrackClass);
  element.setAttribute("data-hidden", "");
  const mover = createElement(element, gliderMoverClass);
  const box = createElement(mover, gliderBoxClass);
  const track: GliderTrack = {
    element,
    mover,
    movers: [mover],
    box,
    followers: [box],
    placed: new WeakSet(),
    state,
    key: null,
    shownAt: null,
    shownRequest: 0,
  };
  return track;
}

function hideTrack(track: GliderTrack) {
  track.element.setAttribute("data-hidden", "");
  track.key = null;
}

// The items that enter and leave, such as tabs that grow in and close, have
// these attributes, like Ariakit disclosure content.
const SETTLING_SELECTOR = "[data-enter], [data-leave]";

/**
 * Reads where the box of a track shows, such as its place or its rect. The
 * travel of the shift runs on the compositor, which keeps moving the box while
 * a long task, such as a render, holds the page. Chrome and Firefox then
 * compute the shift at the time of the last frame, so a new travel that started
 * from it would show the box go back. The travel of the mover catches up for
 * the read. The size of the box travels on the main thread, which shows the
 * time of its last frame.
 */
function readShown<T>(track: GliderTrack, read: () => T): T {
  // Safari computes the shift at the time of the compositor, but a new current
  // time would count the long task again and move the box too far.
  if (isSafari()) return read();
  const now = getWindow(track.element).performance.now();
  const caughtUp: Array<[animation: Animation, currentTime: number]> = [];
  for (const animation of track.mover.getAnimations()) {
    if (animation.playState !== "running") continue;
    if (!("transitionProperty" in animation)) continue;
    if (animation.transitionProperty !== "translate") continue;
    const { startTime, currentTime } = animation;
    if (typeof currentTime !== "number") continue;
    // The travel starts on the screen with its first frame, but the browser can
    // report its start time a frame or more later. The start time is on the
    // timeline of the document, which shares its origin with performance.now().
    const start = typeof startTime === "number" ? startTime : track.shownAt;
    // A travel that waits for its first frame, such as after a long task,
    // doesn't move on the screen either.
    if (start == null) continue;
    const elapsed = now - start;
    if (currentTime >= elapsed) continue;
    caughtUp.push([animation, currentTime]);
    animation.currentTime = elapsed;
  }
  try {
    return read();
  } finally {
    // A new current time also moves the start time of the travel in Chrome and
    // Firefox, so a travel that goes on, such as when the box keeps its place,
    // would then run ahead of the screen and of the window of the box. A new
    // travel replaces it anyway.
    for (const [animation, currentTime] of caughtUp) {
      animation.currentTime = currentTime;
    }
  }
}

/**
 * The place where a mover shows now: the place that it has, with the shift of a
 * travel that is still on its way. A mover without a place returns null.
 */
function getShownPlace(mover: HTMLElement) {
  const x = Number.parseFloat(mover.style.getPropertyValue("--glider-x"));
  const y = Number.parseFloat(mover.style.getPropertyValue("--glider-y"));
  if (Number.isNaN(x)) return null;
  if (Number.isNaN(y)) return null;
  // The computed value has one length when the other is zero, and is `none`
  // without a shift.
  const { translate } = getWindow(mover).getComputedStyle(mover);
  const [shiftX = "", shiftY = ""] = translate.split(" ");
  return {
    x,
    y,
    shownX: x + (Number.parseFloat(shiftX) || 0),
    shownY: y + (Number.parseFloat(shiftY) || 0),
  };
}

interface MoveTrackParams {
  track: GliderTrack;
  target: HTMLElement;
  rect: ItemRect;
  animated: boolean;
  offsets?: InlineOffsets;
  /**
   * Whether items enter or leave, so the track moves at once on each frame. It
   * then stays instant until they settle, without a style flush on each frame.
   */
  settling?: boolean;
}

/**
 * Lets the travels of a track come back after it moved at once. The place
 * applies first, so the move doesn't travel.
 */
function endInstant(track: GliderTrack) {
  if (!track.element.hasAttribute("data-instant")) return;
  track.element.getBoundingClientRect();
  track.element.removeAttribute("data-instant");
  for (const follower of track.followers) {
    follower.removeAttribute("data-glider-instant");
  }
}

/**
 * Makes the box a copy of the item's box and moves the track over the item.
 * Returns whether the track changed.
 */
function moveTrack({
  track,
  target,
  rect,
  animated,
  offsets,
  settling = false,
}: MoveTrackParams) {
  const { element, movers, box, followers, placed, state } = track;
  const { x, y, width, height } = rect;
  const stateClass = state === "hover" ? "ui-hovered" : "";
  const className = `${target.className} ${gliderBoxClass} ${stateClass}`;
  const style = target.style.cssText;
  // An item can draw its focus state on its surface, which the box paints.
  const focused = isFocusVisible(target);
  const { start = 0, end = 0 } = offsets ?? {};
  const place = [x, y, width, height, start, end];
  const key = [className, style, focused, ...place].join("|");
  // A new follower, such as a panel that the framework replaced, needs the
  // place of the box even when the box stays where it is.
  const fresh = followers.filter((follower) => !placed.has(follower));
  if (key === track.key && !fresh.length) {
    // A move at once also ends a travel to the same place, such as when items
    // settle while the box travels, because the copies of the travel end too.
    // The style is clean here, so reading the animations doesn't flush it.
    if (!animated && track.mover.getAnimations().length) {
      element.setAttribute("data-instant", "");
      for (const follower of followers) {
        follower.setAttribute("data-glider-instant", "");
      }
      if (!settling) {
        endInstant(track);
      }
    }
    return false;
  }
  const wasHidden = track.key == null;
  track.key = key;
  // A track that was not shown has no place to travel from.
  const instant = wasHidden || !animated;
  // The box travels from the place where it shows now. This reads the style of
  // the mover before the box gets the style of its item, like the flush below.
  const from = instant
    ? null
    : readShown(track, () => getShownPlace(track.mover));
  const shift =
    from && (from.x !== x || from.y !== y)
      ? { x: from.shownX - x, y: from.shownY - y }
      : null;
  if (!instant && fresh.length) {
    // A new follower starts at the place of the box, which can be in the middle
    // of a travel, so it changes with the box. This runs before the box gets
    // the style of its item, which drops its place until the loop below, so the
    // flush does not restart the transitions of the box.
    const boxStyle = getWindow(box).getComputedStyle(box);
    const boxStart = boxStyle.getPropertyValue("--glider-travel-start");
    const boxEnd = boxStyle.getPropertyValue("--glider-travel-end");
    for (const follower of fresh) {
      follower.setAttribute("data-glider-instant", "");
      follower.style.setProperty("--glider-travel-start", boxStart);
      follower.style.setProperty("--glider-travel-end", boxEnd);
    }
    element.getBoundingClientRect();
    for (const follower of fresh) {
      follower.removeAttribute("data-glider-instant");
    }
  }
  // The box takes the look of the item from its classes and its state.
  box.className = className;
  box.style.cssText = style;
  box.toggleAttribute("data-focus-visible", focused);
  if (state === "selected") {
    box.setAttribute("data-selected", "true");
  }
  element.toggleAttribute("data-instant", instant);
  element.toggleAttribute("data-shifting", !!shift);
  for (const follower of followers) {
    follower.toggleAttribute("data-glider-instant", instant);
    follower.style.setProperty("--glider-travel-start", `${start}px`);
    follower.style.setProperty("--glider-travel-end", `${end}px`);
    placed.add(follower);
  }
  for (const mover of movers) {
    mover.style.setProperty("--glider-x", `${x}px`);
    mover.style.setProperty("--glider-y", `${y}px`);
    mover.style.setProperty("--glider-width", `${width}px`);
    mover.style.setProperty("--glider-height", `${height}px`);
    // The movers go to the new place at once. The shift keeps them where they
    // show, and an instant move drops the shift of a travel on its way.
    if (shift) {
      mover.style.setProperty("--glider-shift-x", `${shift.x}px`);
      mover.style.setProperty("--glider-shift-y", `${shift.y}px`);
    } else if (instant) {
      mover.style.setProperty("--glider-shift-x", "0px");
      mover.style.setProperty("--glider-shift-y", "0px");
    }
  }
  if (shift) {
    // Apply the shift before its travel comes back. Then the shift travels to
    // zero, which moves the box from where it shows to its new place.
    const moverStyle = getWindow(element).getComputedStyle(track.mover);
    moverStyle.getPropertyValue("translate");
    element.removeAttribute("data-shifting");
    for (const mover of movers) {
      mover.style.setProperty("--glider-shift-x", "0px");
      mover.style.setProperty("--glider-shift-y", "0px");
    }
    const view = getWindow(element);
    view.cancelAnimationFrame(track.shownRequest);
    track.shownAt = null;
    track.shownRequest = view.requestAnimationFrame(() => {
      track.shownAt = view.performance.now();
    });
  }
  // The first box replaces the surface of its item with no fade, so hydration
  // does not flash.
  if (!animated) {
    element.removeAttribute("data-hidden");
  }
  if (instant && !settling) {
    endInstant(track);
  }
  element.removeAttribute("data-hidden");
  return true;
}

interface GliderOptions extends Pick<GliderGroupVariants, "$hover"> {
  root: HTMLElement;
  group: HTMLElement;
}

function createGlider({ root, group, ...variants }: GliderOptions) {
  const view = getWindow(group);
  const hover = !!variants.$hover;
  const scaleProbe = createElement(
    createElement(root, gliderScaleClass),
    gliderScaleProbeClass,
  );
  // Paint order: the hover box, the idle copy of the item that the selected box
  // travels to, then the selected box and its window.
  const hoverTrack = hover ? createTrack(root, "hover") : null;
  const idleLayer = createElement(root, gliderIdleLayerClass);
  const selectedTrack = createTrack(root, "selected");
  const selectedWindow = createElement(
    selectedTrack.element,
    gliderWindowClass,
  );
  const selectedLayer = createElement(selectedWindow, gliderLayerClass);
  // The window and its layer travel with the box.
  selectedTrack.movers.push(selectedWindow, selectedLayer);
  const selectedMover = selectedTrack.mover;
  // The elements around the group that follow the selected box.
  const scope = getScope(group);
  const scopeFollowers = new Set<HTMLElement>();
  const observedItems = new Set<HTMLElement>();
  const addedClasses = new Set<string>();
  let selectedItem: HTMLElement | null = null;
  let hoveredItem: HTMLElement | null = null;
  // The item that the selected box travels to. Its idle copy shows its content
  // until the box arrives.
  let maskedItem: HTMLElement | null = null;
  // Whether items entered or left in the last sync.
  let settling = false;
  let travelTimeout = 0;
  let groupWidth = 0;
  let groupHeight = 0;
  let groupPadding = "";

  const groupProps = gliderGroup.htmlObj({
    ...variants,
    $positioned: view.getComputedStyle(group).position === "static",
  });
  const groupClasses = groupProps.class.split(/\s+/).filter(Boolean);
  const groupStyle = Object.entries(groupProps.style);

  // The group keeps the classes that it had before, and gets these again when
  // the framework writes its class attribute.
  const addGroupClasses = () => {
    for (const name of groupClasses) {
      if (group.classList.contains(name)) continue;
      addedClasses.add(name);
      group.classList.add(name);
    }
  };
  addGroupClasses();
  for (const [property, value] of groupStyle) {
    group.style.setProperty(property, String(value));
  }

  // Without copies, the selected item shows its own content again, and the box
  // goes back behind the items. After the travel, nothing changes on the
  // screen.
  const removeCopies = () => {
    selectedTrack.element.removeAttribute("data-traveling");
    selectedLayer.replaceChildren();
    idleLayer.replaceChildren();
    if (!maskedItem) return;
    maskedItem.removeAttribute("data-glider-masked");
    maskedItem = null;
    dropOwnMutations();
  };

  const endTravel = () => {
    view.clearTimeout(travelTimeout);
    removeCopies();
  };

  // While the selected box travels, it covers the items under it, and its
  // window shows a copy of those items in the selected state. So the content of
  // an item changes state at the edge of the box. The item that the box travels
  // to shows an idle copy of its content until the box arrives.
  const showCopies = (from: ItemRect, target: HTMLElement, to: ItemRect) => {
    // A box that shows the items behind it can't cover their content, so the
    // items change their own content at once.
    if (!hasOpaqueSurface(selectedTrack.box)) return;
    const path = new Map<HTMLElement, ItemRect>();
    for (const element of getItems(group, root)) {
      const rect = getRect(scaleProbe, element);
      if (!isOnPath(from, to, rect)) continue;
      path.set(element, rect);
    }
    const selectedCopies = [
      createCopy({
        element: target,
        rect: to,
        state: "selected",
        look: target,
      }),
    ];
    // A copy is not in the place of its item, so it takes the values and the
    // size that need that place from the item. For that, each item looks for a
    // moment like its copy: the target unselected, the others selected. The
    // browser does not paint between these two steps.
    const states = new Map<HTMLElement, string | null>();
    for (const element of path.keys()) {
      const state = element === target ? "false" : "true";
      states.set(element, element.getAttribute("data-selected"));
      element.setAttribute("data-selected", state);
    }
    for (const [element, rect] of path) {
      if (element === target) continue;
      // Items keep their places, because other items look selected too.
      const { width, height } = getRect(scaleProbe, element);
      const copyRect = { ...rect, width, height };
      selectedCopies.push(
        createCopy({
          element,
          rect: copyRect,
          state: "selected",
          look: target,
        }),
      );
    }
    const idleState = target.matches(":hover") ? "hover" : "idle";
    const idleRect = getRect(scaleProbe, target);
    const idleCopy = createCopy({
      element: target,
      rect: idleRect,
      state: idleState,
    });
    for (const [element, state] of states) {
      if (state == null) {
        element.removeAttribute("data-selected");
      } else {
        element.setAttribute("data-selected", state);
      }
    }
    selectedLayer.replaceChildren(...selectedCopies);
    idleLayer.replaceChildren(idleCopy);
    target.setAttribute("data-glider-masked", "");
    maskedItem = target;
    selectedTrack.element.setAttribute("data-traveling", "");
    dropOwnMutations();
  };

  // The timeout ends a travel that sends no transitionend event, such as one
  // that a new place for the box interrupts. The box can still move when the
  // timeout comes, because the item can change its place during the travel, so
  // the timeout waits for that move.
  const waitForTravelEnd = () => {
    const duration = getTransitionTime(selectedMover);
    travelTimeout = view.setTimeout(() => {
      if (selectedMover.getAnimations().length) {
        waitForTravelEnd();
        return;
      }
      endTravel();
    }, duration + 100);
  };

  const startTravel = (from: ItemRect, target: HTMLElement, to: ItemRect) => {
    waitForTravelEnd();
    showCopies(from, target, to);
  };

  // The elements of nested scopes follow their own gliders.
  const findFollowers = () => {
    const elements = scope.querySelectorAll<HTMLElement>(".glider-follower");
    const followers = Array.from(elements).filter((element) => {
      return element.closest(".glider-scope") === scope;
    });
    for (const follower of followers) {
      scopeFollowers.add(follower);
      // The same value would still restyle the follower on each sync.
      if (follower.hasAttribute("data-glider-following")) continue;
      follower.setAttribute("data-glider-following", "");
    }
    selectedTrack.followers = [selectedTrack.box, ...followers];
  };

  const showHover = (animated: boolean) => {
    if (!hoverTrack) return;
    // Like the selected box, the hover box goes to its item at once while the
    // items settle.
    if (!settling) {
      endInstant(hoverTrack);
    }
    if (!hoveredItem) {
      hideTrack(hoverTrack);
      return;
    }
    const rect = getRect(scaleProbe, hoveredItem);
    moveTrack({
      track: hoverTrack,
      target: hoveredItem,
      rect,
      animated: animated && !settling,
      settling,
    });
  };

  // In a row with the glider-row class, the followers also know how far the
  // group is from each end of the row. A part of the row that changes size,
  // mounts, or unmounts can change that, such as a part that folds away with an
  // animation. The followers take the new place at once on each frame, apart
  // from the place of the box, so the box keeps its travel.
  const row = group.parentElement?.classList.contains("glider-row")
    ? group.parentElement
    : null;
  const rowPlaces = new WeakMap<HTMLElement, string>();
  const placeRow = () => {
    if (!row) return;
    const { left, right } = getRowInsets(group, scaleProbe);
    const { direction } = view.getComputedStyle(group);
    const start = direction === "rtl" ? right : left;
    const end = direction === "rtl" ? left : right;
    const place = `${start}|${end}`;
    for (const follower of selectedTrack.followers) {
      // The same value would still restyle the follower on each frame.
      if (rowPlaces.get(follower) === place) continue;
      rowPlaces.set(follower, place);
      follower.style.setProperty("--glider-row-start", `${start}px`);
      follower.style.setProperty("--glider-row-end", `${end}px`);
    }
  };

  const sync = (animated: boolean) => {
    // The framework can write the class attribute of the group in any update.
    addGroupClasses();
    const items = getItems(group, root);
    observeItems(items);
    const previousItem = selectedItem;
    selectedItem =
      items.find((element) => element.matches(selectedSelector)) ?? null;
    // While an item enters or leaves, such as a tab that grows in or one that
    // closes, the items move on each frame, so the selected box goes to its
    // item at once and changes with it. A box that traveled there would go to a
    // place that changes on each frame, and its copies would start again on
    // each one.
    const wasSettling = settling;
    settling = items.some((item) => item.matches(SETTLING_SELECTOR));
    // The items can move once more when they settle, such as when a closed tab
    // leaves the list with the gap beside it, so the boxes go there at once
    // too.
    const boxesAnimated = animated && !settling && !wasSettling;
    // The track stayed instant while the items settled.
    if (!settling) {
      endInstant(selectedTrack);
    }
    // The window has the corners of the box, which has the corners of the item.
    // This reads them before the moves below change any style, so it doesn't
    // flush the style.
    const borderRadius = selectedItem
      ? view.getComputedStyle(selectedItem).borderRadius
      : "";
    const travels =
      boxesAnimated &&
      !!previousItem &&
      !!selectedItem &&
      selectedItem !== previousItem;
    // The items can change while the box travels, such as a count in a badge,
    // so the copies start again from the place of the box. The travel keeps its
    // timeout.
    const refreshes =
      boxesAnimated &&
      !!maskedItem &&
      !!selectedItem &&
      selectedItem === previousItem;
    if (!boxesAnimated || selectedItem !== previousItem) {
      endTravel();
    }
    if (selectedItem) {
      // The box can be between two items when the selection changes again.
      const from =
        travels || refreshes
          ? readShown(selectedTrack, () =>
              getRect(scaleProbe, selectedTrack.box),
            )
          : null;
      const to = getRect(scaleProbe, selectedItem);
      const offsets = getInlineOffsets(group, to);
      findFollowers();
      const moved = moveTrack({
        track: selectedTrack,
        target: selectedItem,
        rect: to,
        animated: boxesAnimated,
        offsets,
        settling,
      });
      // A box that moves takes the style of its item, which drops its row
      // place.
      if (moved) {
        rowPlaces.delete(selectedTrack.box);
      }
      placeRow();
      selectedWindow.style.borderRadius = borderRadius;
      if (from && travels) {
        startTravel(from, selectedItem, to);
      } else if (from && refreshes) {
        removeCopies();
        showCopies(from, selectedItem, to);
      }
      // The focus can reach the item after the travel starts. The copies in the
      // box show the same focus state as the box.
      const focused = isFocusVisible(selectedItem);
      for (const copy of selectedLayer.children) {
        copy.toggleAttribute("data-focus-visible", focused);
      }
    } else {
      hideTrack(selectedTrack);
    }
    if (hoveredItem && !items.includes(hoveredItem)) {
      hoveredItem = null;
    }
    showHover(boxesAnimated);
  };

  const onResize = () => {
    const { width, height } = group.getBoundingClientRect();
    const style = view.getComputedStyle(group);
    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = style;
    const padding = `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;
    // The boxes follow a group that changes size or padding, and travel when
    // only the items change size.
    const resized =
      width !== groupWidth ||
      height !== groupHeight ||
      padding !== groupPadding;
    groupWidth = width;
    groupHeight = height;
    groupPadding = padding;
    sync(!resized);
  };
  const resizeObserver = new view.ResizeObserver(onResize);
  resizeObserver.observe(group);
  // A part of a tab row that mounts beside the strip can change the padding of
  // the strip, which moves the items. The content box reports it when the outer
  // size stays, and the border box when the content size stays. An observer
  // watches only one box of an element.
  const groupBorderObserver = new view.ResizeObserver(onResize);
  groupBorderObserver.observe(group, { box: "border-box" });

  const rowObserver = new view.ResizeObserver(placeRow);
  const observedParts = new Set<Element>();
  // The observer also watches a part that the page doesn't lay out, so the part
  // counts once it gets a box.
  const observeRowParts = () => {
    if (!row) return;
    for (const part of observedParts) {
      if (part.parentElement === row) continue;
      observedParts.delete(part);
      rowObserver.unobserve(part);
    }
    for (const part of row.children) {
      if (part === group) continue;
      if (part.classList.contains("carousel-button-area")) continue;
      if (observedParts.has(part)) continue;
      observedParts.add(part);
      rowObserver.observe(part, { box: "border-box" });
    }
  };
  const rowMutationObserver = new view.MutationObserver(() => {
    observeRowParts();
    placeRow();
  });
  if (row) {
    observeRowParts();
    rowMutationObserver.observe(row, { childList: true });
  }

  // Observing an item again would report its size again. The border box keeps
  // reporting a tab that closes after its content has no width left, while its
  // padding still shrinks.
  const observeItems = (items: HTMLElement[]) => {
    for (const element of observedItems) {
      if (items.includes(element)) continue;
      observedItems.delete(element);
      resizeObserver.unobserve(element);
    }
    for (const element of items) {
      if (observedItems.has(element)) continue;
      observedItems.add(element);
      resizeObserver.observe(element, { box: "border-box" });
    }
  };

  let scheduled = false;
  let destroyed = false;
  const scheduleSync = () => {
    if (scheduled) return;
    scheduled = true;
    view.queueMicrotask(() => {
      scheduled = false;
      // The cleanup can't cancel a sync that is already in the queue.
      if (destroyed) return;
      sync(true);
    });
  };

  // A text change matters only to the copies, which exist during a travel.
  const needsSync = (record: MutationRecord) => {
    if (root.contains(record.target)) return false;
    return record.type !== "characterData" || !!maskedItem;
  };
  const mutationObserver = new view.MutationObserver((records) => {
    if (!records.some(needsSync)) return;
    scheduleSync();
  });
  // The glider changes how items look during a travel. Those changes are not
  // changes of the group.
  const dropOwnMutations = () => {
    mutationObserver.takeRecords();
  };
  mutationObserver.observe(group, {
    attributes: true,
    // The copies show the text of the items, such as a count in a badge.
    characterData: true,
    childList: true,
    subtree: true,
  });

  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== selectedMover) return;
    // The box moves with `translate` and changes its size with the glider
    // properties.
    const { propertyName } = event;
    const isMove = propertyName === "translate";
    if (!isMove && !propertyName.startsWith("--glider-")) return;
    // The properties of the mover can end at different times. For example, a
    // width transition that reverses takes less time than the move.
    if (selectedMover.getAnimations().length) return;
    endTravel();
  };
  selectedMover.addEventListener("transitionend", onTransitionEnd);

  // The idle copy stands for the item that the box travels to, so it shows the
  // hover state only while the pointer is over that item.
  const syncMaskedHover = () => {
    const [copy] = idleLayer.children;
    if (!copy) return;
    copy.classList.toggle("ui-hovered", !!maskedItem?.matches(":hover"));
  };

  const onPointerOver = (event: PointerEvent) => {
    syncMaskedHover();
    if (!hoverTrack) return;
    if (event.pointerType === "touch") return;
    if (!isElement(event.target)) return;
    const control = event.target.closest<HTMLElement>(".control");
    // The box stays on the last item while the pointer is between items.
    if (!control) return;
    const element = getItems(group, root).find((candidate) =>
      candidate.contains(control),
    );
    if (!element) return;
    const next = element.matches(disabledSelector) ? null : element;
    if (next === hoveredItem) return;
    hoveredItem = next;
    showHover(true);
  };
  const onPointerLeave = () => {
    syncMaskedHover();
    hoveredItem = null;
    showHover(true);
  };
  group.addEventListener("pointerover", onPointerOver);
  group.addEventListener("pointerleave", onPointerLeave);
  // A native input changes its checked state without a mutation.
  group.addEventListener("change", scheduleSync);

  // The pointer can be over an item when the glider starts, with no new
  // pointerover event to come. A touch leaves its item in :hover, but a touch
  // does not move the hover box.
  if (hoverTrack && view.matchMedia("(hover: hover)").matches) {
    hoveredItem =
      getItems(group, root).find((element) => {
        if (!element.matches(":hover")) return false;
        return !element.matches(disabledSelector);
      }) ?? null;
  }
  sync(false);

  return () => {
    destroyed = true;
    view.cancelAnimationFrame(selectedTrack.shownRequest);
    if (hoverTrack) {
      view.cancelAnimationFrame(hoverTrack.shownRequest);
    }
    mutationObserver.disconnect();
    resizeObserver.disconnect();
    groupBorderObserver.disconnect();
    rowObserver.disconnect();
    rowMutationObserver.disconnect();
    endTravel();
    group.removeEventListener("pointerover", onPointerOver);
    group.removeEventListener("pointerleave", onPointerLeave);
    group.removeEventListener("change", scheduleSync);
    group.classList.remove(...addedClasses);
    for (const [property] of groupStyle) {
      group.style.removeProperty(property);
    }
    for (const follower of scopeFollowers) {
      follower.removeAttribute("data-glider-following");
      // A follower stays instant while the items settle.
      follower.removeAttribute("data-glider-instant");
      follower.style.removeProperty("--glider-travel-start");
      follower.style.removeProperty("--glider-travel-end");
      follower.style.removeProperty("--glider-row-start");
      follower.style.removeProperty("--glider-row-end");
    }
    root.replaceChildren();
  };
}

export interface GliderProps
  extends
    Omit<ak.RoleProps<"span">, "children">,
    VariantProps<typeof glider>,
    Pick<GliderGroupVariants, "$hover"> {
  /**
   * Turns the glider on after hydration. When it is `false`, each item paints
   * its own selected and hover state, as on the server.
   * @default true
   */
  enabled?: boolean;
}

/**
 * A selection indicator that travels between the items of the group that
 * contains it, such as a segmented `RadioGroup`, a segmented `TabList`, or a
 * `Nav`. Place it after the items. On the server and before hydration, it
 * renders an empty element, and each item paints its own selected and hover
 * state. After hydration, it copies the box of the selected item into a
 * separate element that travels to the next selected item. While the box
 * travels, the content of the items under it shows in the selected state, so
 * text, icons, and badges change at the edge of the box. While an item enters
 * or leaves, such as a tab that grows in or one that closes, the boxes go to
 * their items at once and change with them. It stays off with forced colors and
 * with reduced motion. To change the travel time, set `--glider-duration` on an
 * element around the group, so other parts that follow the box, such as the
 * panel of folder tabs, take the same time.
 * @example
 * <RadioGroup aria-label="View" $kind="segmented">
 *   <RadioCard value="list" $kind="segmented">List</RadioCard>
 *   <RadioCard value="grid" $kind="segmented">Grid</RadioCard>
 *   <Glider $hover />
 * </RadioGroup>
 */
export function Glider({ $hover, enabled = true, ref, ...props }: GliderProps) {
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const [variantProps, rest] = splitProps(props, glider);

  // The copies in the glider can hold native inputs, which must stay out of the
  // tab order. The property works in React 18 too, which has no inert prop.
  useSafeLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.inert = true;
  }, []);

  useSafeLayoutEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const group = getGroup(root);
    if (!root) return;
    if (!group) return;
    const off = getWindow(group).matchMedia(offQuery);
    let destroy: (() => void) | undefined;
    const update = () => {
      destroy?.();
      destroy = off.matches ? undefined : createGlider({ root, group, $hover });
    };
    update();
    off.addEventListener("change", update);
    return () => {
      off.removeEventListener("change", update);
      destroy?.();
    };
  }, [enabled, $hover]);

  return (
    <ak.Role.span
      aria-hidden
      {...glider.jsx(variantProps)}
      {...rest}
      ref={useMergeRefs(rootRef, ref)}
    />
  );
}
