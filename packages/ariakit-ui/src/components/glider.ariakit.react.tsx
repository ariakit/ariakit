import * as ak from "@ariakit/react";
import { useMergeRefs, useSafeLayoutEffect } from "@ariakit/react-utils";
import { getWindow } from "@ariakit/utils";
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

function getItems(group: HTMLElement, root: HTMLElement) {
  const controls = group.querySelectorAll<HTMLElement>(".control");
  return Array.from(controls).filter((control) => {
    if (root.contains(control)) return false;
    // A control inside another control is content, not an item.
    return !control.parentElement?.closest(".control");
  });
}

/** The box of an element from the start of the group's scrollable content. */
function getRect(group: HTMLElement, element: HTMLElement): ItemRect {
  const groupRect = group.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - groupRect.left - group.clientLeft + group.scrollLeft,
    y: rect.top - groupRect.top - group.clientTop + group.scrollTop,
    width: rect.width,
    height: rect.height,
  };
}

interface InlineOffsets {
  start: number;
  end: number;
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
  state: GliderState;
  /** The item and the place that the box copies, to skip equal updates. */
  key: string | null;
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
    state,
    key: null,
  };
  return track;
}

function hideTrack(track: GliderTrack) {
  track.element.setAttribute("data-hidden", "");
  track.key = null;
}

interface MoveTrackParams {
  track: GliderTrack;
  target: HTMLElement;
  rect: ItemRect;
  animated: boolean;
  offsets?: InlineOffsets;
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
}: MoveTrackParams) {
  const { element, movers, box, followers, state } = track;
  const { x, y, width, height } = rect;
  const stateClass = state === "hover" ? "ui-hovered" : "";
  const className = `${target.className} ${gliderBoxClass} ${stateClass}`;
  const style = target.style.cssText;
  // An item can draw its focus state on its surface, which the box paints.
  const focused = isFocusVisible(target);
  const { start = 0, end = 0 } = offsets ?? {};
  const place = [x, y, width, height, start, end, followers.length];
  const key = [className, style, focused, ...place].join("|");
  if (key === track.key) return false;
  const wasHidden = track.key == null;
  track.key = key;
  // The box takes the look of the item from its classes and its state.
  box.className = className;
  box.style.cssText = style;
  box.toggleAttribute("data-focus-visible", focused);
  if (state === "selected") {
    box.setAttribute("data-selected", "true");
  }
  // A track that was not shown has no place to travel from.
  const instant = wasHidden || !animated;
  element.toggleAttribute("data-instant", instant);
  for (const follower of followers) {
    follower.toggleAttribute("data-glider-instant", instant);
    follower.style.setProperty("--glider-start", `${start}px`);
    follower.style.setProperty("--glider-end", `${end}px`);
  }
  for (const mover of movers) {
    mover.style.setProperty("--glider-x", `${x}px`);
    mover.style.setProperty("--glider-y", `${y}px`);
    mover.style.setProperty("--glider-width", `${width}px`);
    mover.style.setProperty("--glider-height", `${height}px`);
  }
  // The first box replaces the surface of its item with no fade, so hydration
  // does not flash.
  if (!animated) {
    element.removeAttribute("data-hidden");
  }
  if (instant) {
    // Apply the place before the animation comes back.
    element.getBoundingClientRect();
    element.removeAttribute("data-instant");
    for (const follower of followers) {
      follower.removeAttribute("data-glider-instant");
    }
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
  const scope = group.closest<HTMLElement>(".glider-scope") ?? group;
  const scopeFollowers = new Set<HTMLElement>();
  const observedItems = new Set<HTMLElement>();
  const addedClasses = new Set<string>();
  let selectedItem: HTMLElement | null = null;
  let hoveredItem: HTMLElement | null = null;
  // The item that the selected box travels to. Its idle copy shows its content
  // until the box arrives.
  let maskedItem: HTMLElement | null = null;
  let travelTimeout = 0;
  let groupWidth = 0;
  let groupHeight = 0;

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

  // After the travel, the selected item shows its own content again, and the
  // box goes back behind the items. Nothing changes on the screen.
  const endTravel = () => {
    view.clearTimeout(travelTimeout);
    selectedTrack.element.removeAttribute("data-traveling");
    selectedLayer.replaceChildren();
    idleLayer.replaceChildren();
    if (!maskedItem) return;
    maskedItem.removeAttribute("data-glider-masked");
    maskedItem = null;
    dropOwnMutations();
  };

  // While the selected box travels, it covers the items under it, and its
  // window shows a copy of those items in the selected state. So the content of
  // an item changes state at the edge of the box. The item that the box travels
  // to shows an idle copy of its content until the box arrives.
  const startTravel = (from: ItemRect, target: HTMLElement, to: ItemRect) => {
    // The timeout ends a travel that sends no transitionend event, such as one
    // that a new place for the box interrupts.
    const duration = getTransitionTime(selectedMover);
    travelTimeout = view.setTimeout(endTravel, duration + 100);
    // A box that shows the items behind it can't cover their content, so the
    // items change their own content at once.
    if (!hasOpaqueSurface(selectedTrack.box)) return;
    const path = new Map<HTMLElement, ItemRect>();
    for (const element of getItems(group, root)) {
      const rect = getRect(group, element);
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
      const { width, height } = element.getBoundingClientRect();
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
    const idleRect = getRect(group, target);
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

  // The elements of nested scopes follow their own gliders.
  const findFollowers = () => {
    const elements = scope.querySelectorAll<HTMLElement>(".glider-follower");
    const followers = Array.from(elements).filter((element) => {
      return element.closest(".glider-scope") === scope;
    });
    for (const follower of followers) {
      scopeFollowers.add(follower);
      follower.setAttribute("data-glider-following", "");
    }
    selectedTrack.followers = [selectedTrack.box, ...followers];
  };

  const showHover = (animated: boolean) => {
    if (!hoverTrack) return;
    if (!hoveredItem) {
      hideTrack(hoverTrack);
      return;
    }
    const rect = getRect(group, hoveredItem);
    moveTrack({ track: hoverTrack, target: hoveredItem, rect, animated });
  };

  const sync = (animated: boolean) => {
    // The framework can write the class attribute of the group in any update.
    addGroupClasses();
    const items = getItems(group, root);
    observeItems(items);
    const previousItem = selectedItem;
    selectedItem =
      items.find((element) => element.matches(selectedSelector)) ?? null;
    const travels =
      animated &&
      !!previousItem &&
      !!selectedItem &&
      selectedItem !== previousItem;
    if (!animated || selectedItem !== previousItem) {
      endTravel();
    }
    if (selectedItem) {
      // The box can be between two items when the selection changes again.
      const from = travels ? getRect(group, selectedTrack.box) : null;
      const to = getRect(group, selectedItem);
      const offsets = getInlineOffsets(group, to);
      findFollowers();
      moveTrack({
        track: selectedTrack,
        target: selectedItem,
        rect: to,
        animated,
        offsets,
      });
      // The window has the corners of the box, which has the corners of the
      // item.
      const { borderRadius } = view.getComputedStyle(selectedItem);
      selectedWindow.style.borderRadius = borderRadius;
      if (from) {
        startTravel(from, selectedItem, to);
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
    showHover(animated);
  };

  const resizeObserver = new view.ResizeObserver(() => {
    const { width, height } = group.getBoundingClientRect();
    // The boxes follow a group that changes size, and travel when only the
    // items change size.
    const resized = width !== groupWidth || height !== groupHeight;
    groupWidth = width;
    groupHeight = height;
    sync(!resized);
  });
  resizeObserver.observe(group);

  // Observing an item again would report its size again.
  const observeItems = (items: HTMLElement[]) => {
    for (const element of observedItems) {
      if (items.includes(element)) continue;
      observedItems.delete(element);
      resizeObserver.unobserve(element);
    }
    for (const element of items) {
      if (observedItems.has(element)) continue;
      observedItems.add(element);
      resizeObserver.observe(element);
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

  const mutationObserver = new view.MutationObserver((records) => {
    const external = records.some((record) => !root.contains(record.target));
    if (!external) return;
    scheduleSync();
  });
  // The glider changes how items look during a travel. Those changes are not
  // changes of the group.
  const dropOwnMutations = () => {
    mutationObserver.takeRecords();
  };
  mutationObserver.observe(group, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== selectedMover) return;
    if (!event.propertyName.startsWith("--glider-")) return;
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

  sync(false);

  return () => {
    destroyed = true;
    mutationObserver.disconnect();
    resizeObserver.disconnect();
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
      follower.style.removeProperty("--glider-start");
      follower.style.removeProperty("--glider-end");
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
 * text, icons, and badges change at the edge of the box. It stays off with
 * forced colors and with reduced motion. To change the travel time, set
 * `--glider-duration` on an element around the group, so other parts that
 * follow the box, such as the panel of folder tabs, take the same time.
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
