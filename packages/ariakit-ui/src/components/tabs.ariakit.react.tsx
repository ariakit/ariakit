import * as ak from "@ariakit/react";
import { useEvent, useMergeRefs } from "@ariakit/react-utils";
import {
  disabledFromProps,
  getActiveElement,
  getWindow,
  isSelfTarget,
} from "@ariakit/utils";
import type { VariantProps } from "clava";
import { cx, splitProps } from "clava";
import { XIcon } from "lucide-react";
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ComponentProps } from "react";
import {
  appendOptionalChild,
  createOptionalRender,
  createRender,
  getChildrenText,
  prependOptionalSeparator,
} from "../react-utils/create-render.react.ts";
import { frame } from "../styles/frame.ts";
import {
  tab,
  tabBar,
  tabRemove,
  tabLabel,
  tabList,
  tabListCarousel,
  tabPanels,
  tabRow,
  tabRowButton,
  tabRowFrame,
  tabSeparator,
  tabSlot,
  tabs,
} from "../styles/tabs.ts";
import {
  getViewportClearOffset,
  scrollIntoClearRange,
} from "../utils/carousel-clear.ts";
import { observeTabDrag } from "../utils/tab-drag.ts";
import { observeTabReorderKeys, setTabStatus } from "../utils/tab-reorder.ts";
import {
  Carousel,
  CarouselButton,
  CarouselViewport,
} from "./carousel.ariakit.react.tsx";
import type {
  CarouselButtonRender,
  CarouselProps,
} from "./carousel.ariakit.react.tsx";

// Whether a tab list is in a TabRow, which then holds its scroll buttons.
const TabRowContext = createContext(false);

// Whether the tab list around a tab mounted before the tab did. Such a tab was
// added to the list, so it enters with a transition.
const TabListMountedContext = createContext(false);

// Whether the tab around a label shows a close mark. Its label then takes the
// free room by default, such as the room of the minimum width of the tab, so
// the text starts at the start of the tab and the mark stays at its end.
const TabMarkContext = createContext(false);

/** The longest transition of an element, with its delay, in milliseconds. */
function getTransitionTime(element: HTMLElement) {
  const style = getWindow(element).getComputedStyle(element);
  const parse = (value: string) =>
    value.split(",").map((time) => {
      const number = Number.parseFloat(time) || 0;
      return time.trim().endsWith("ms") ? number : number * 1000;
    });
  const durations = parse(style.transitionDuration);
  const delays = parse(style.transitionDelay);
  let time = 0;
  durations.forEach((duration, index) => {
    if (!duration) return;
    const delay = delays[index % delays.length] ?? 0;
    time = Math.max(time, duration + delay);
  });
  return time;
}

interface UseTabRemoveParams {
  store?: ak.TabStore;
  onRemove?: () => void;
}

/**
 * Closes a tab on request. The tab that takes its place gets the selection and
 * the focus that the tab had at once. Then the tab leaves with its transition,
 * and `onRemove` runs.
 */
function useTabRemove({ store, onRemove }: UseTabRemoveParams) {
  const ref = useRef<HTMLButtonElement>(null);
  const [leaving, setLeaving] = useState(false);
  const onRemoveEvent = useEvent(onRemove);

  const remove = () => {
    if (!onRemove) return;
    if (leaving) return;
    const element = ref.current;
    if (!element) return;
    const state = store?.getState();
    const items = state?.renderedItems.filter(
      (item) => item.id === element.id || (!item.disabled && !item.dimmed),
    );
    const index = items?.findIndex((item) => item.id === element.id) ?? -1;
    // The next tab takes the place of the closed one, or the previous tab when
    // the last one closes.
    const next = items?.[index + 1] ?? items?.[index - 1];
    // While another tab still leaves, the app can't know yet that this tab is
    // the only one left, so the tab waits for that tab to close first.
    const anotherLeaves = state?.renderedItems.some((item) =>
      item.element?.hasAttribute("data-leave"),
    );
    if (!next && anotherLeaves) return;
    if (next && index >= 0) {
      const focused = getActiveElement(element) === element;
      if (state?.selectedId === element.id) {
        store?.setSelectedId(next.id);
      }
      // Like an arrow key, a move selects the tab only with selectOnMove.
      if (focused) {
        store?.move(next.id);
      }
    }
    setLeaving(true);
  };

  useEffect(() => {
    if (!leaving) return;
    const finish = () => {
      onRemoveEvent();
      // A tab that stays after onRemove shows again.
      setLeaving(false);
    };
    const element = ref.current;
    const time = element ? getTransitionTime(element) : 0;
    // Without a transition, such as with reduced motion, the tab closes at
    // once.
    if (!time) {
      finish();
      return;
    }
    const timer = setTimeout(finish, time);
    return () => clearTimeout(timer);
  }, [leaving, onRemoveEvent]);

  return { ref, leaving, remove };
}

/** The strip around a tab, which scrolls the tabs. */
function getStrip(element: HTMLElement) {
  return element.closest<HTMLElement>("[role='tablist']");
}

/** The selected tab of a strip, among its own tabs. */
function getSelectedTab(strip: HTMLElement) {
  for (const child of strip.children) {
    if (child.getAttribute("role") !== "tab") continue;
    if (child.getAttribute("aria-selected") !== "true") continue;
    return child;
  }
  return null;
}

/**
 * Puts a hidden copy of a tab that enters in its place, without its enter
 * styles, so the copy takes the room of the grown tab.
 */
function placeGrownCopy(element: HTMLElement) {
  // A deep copy of an element is an element of the same kind, which the DOM
  // types don't express.
  const copy = element.cloneNode(true) as HTMLElement;
  copy.removeAttribute("id");
  copy.removeAttribute("data-enter");
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;
  copy.style.visibility = "hidden";
  element.parentElement?.insertBefore(copy, element);
  return copy;
}

/**
 * Measures the strip of a tab that enters as it is when the tabs that enter
 * have grown in: how far the strip scrolls to show the grown tab, and its
 * scroll width and its width then. Other tabs can still grow, such as after
 * quick presses on a button that opens tabs. Hidden copies take the room of the
 * grown tabs, and the tabs leave the flow for the measure. Their place isn't in
 * their transitions, so they keep growing. The copies leave, and the tabs come
 * back, before the browser paints.
 */
function getGrownStrip(element: HTMLElement, strip: HTMLElement) {
  const entering = Array.from(strip.children).filter(
    (child): child is HTMLElement => {
      if (child === element) return true;
      if (child.getAttribute("role") !== "tab") return false;
      return child.hasAttribute("data-enter");
    },
  );
  const copies = entering.map(placeGrownCopy);
  const inlineStyles = entering.map((tab) => ({
    tab,
    position: tab.style.position,
    insetInlineStart: tab.style.insetInlineStart,
  }));
  for (const tab of entering) {
    tab.style.position = "absolute";
    tab.style.insetInlineStart = "0px";
  }
  const copy = copies[entering.indexOf(element)];
  const offset = copy
    ? getViewportClearOffset(strip, copy.getBoundingClientRect())
    : 0;
  const { scrollWidth, clientWidth } = strip;
  for (const { tab, position, insetInlineStart } of inlineStyles) {
    tab.style.position = position;
    tab.style.insetInlineStart = insetInlineStart;
  }
  for (const item of copies) {
    item.remove();
  }
  return { offset, scrollWidth, clientWidth, entering };
}

// The reveal that runs in each strip. Effects run in tree order, so a selected
// tab that enters earlier in the strip than a tab that still reveals starts its
// reveal before that tab stops its own. The new reveal then stops the old one
// first, which gives the strip back its own end padding.
const stripReveals = new WeakMap<HTMLElement, () => void>();

/**
 * Brings a tab that enters into view of its strip while it grows in, so the
 * strip scrolls first and the tab grows where it shows. The strip can't scroll
 * past its content, and the tab starts with no width, so the strip keeps the
 * room that the tab doesn't take yet at its end. The strip then ends its scroll
 * range where the grown tab ends it, and the scroll button of that end hides as
 * it does when the tab has grown. Returns a function that stops the scroll.
 */
function revealEnteringTab(element: HTMLElement) {
  const strip = getStrip(element);
  if (!strip) return;
  stripReveals.get(strip)?.();
  const win = getWindow(element);
  // The scroll position of a right-to-left strip goes from 0 down.
  const rtl = win.getComputedStyle(strip).direction === "rtl";
  let grown = getGrownStrip(element, strip);
  if (!grown.offset) return;
  const reducedMotion = win.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reducedMotion) {
    scrollIntoClearRange(strip, element, "instant");
    return;
  }
  // The strip goes as far as the grown tabs let it, so it doesn't move back
  // when the room goes.
  const getTarget = (offset: number) => {
    const range = grown.scrollWidth - grown.clientWidth;
    const target = strip.scrollLeft + offset;
    if (rtl) return Math.min(0, Math.max(-range, target));
    return Math.max(0, Math.min(range, target));
  };
  const from = strip.scrollLeft;
  let to = getTarget(grown.offset);
  // The room is what the strip lacks for the scroll width of the grown tab. The
  // end padding of the strip counts in its scroll width.
  const inlinePaddingEnd = strip.style.paddingInlineEnd;
  const paddingEnd =
    Number.parseFloat(win.getComputedStyle(strip).paddingInlineEnd) || 0;
  let room = 0;
  const keepRoom = () => {
    const content = strip.scrollWidth - room;
    const next = Math.max(0, grown.scrollWidth - content);
    if (Math.abs(next - room) < 0.5) return;
    room = next;
    strip.style.paddingInlineEnd = `${paddingEnd + room}px`;
  };
  // A strip that changes its width while the tab grows, such as beside a
  // sidebar that opens, measures the grown tab again, or the scroll would take
  // the strip back to where the tab was before. The measure counts the room in
  // the end padding as scroll width, so the room comes off.
  let width = strip.clientWidth;
  const followWidth = () => {
    if (strip.clientWidth === width) return;
    width = strip.clientWidth;
    const next = getGrownStrip(element, strip);
    grown = { ...next, scrollWidth: next.scrollWidth - room };
    to = getTarget(next.offset);
  };
  // A browser that can't animate a width to auto shows the whole tab at once.
  // The tab grows in the 200ms of tabMotion elsewhere.
  const growTime = getTransitionTime(element) || 200;
  // The strip gets there in half the time, so the room for the tab shows before
  // the tab fills it.
  const scrollTime = growTime / 2;
  // The transition of the tab takes the time of the frame that renders it,
  // which is the current frame or a later one. The scroll starts at the time of
  // the current frame, so it leads the tab by the time since that frame. After
  // quick presses, the strip can be far behind the tab, and a clock that
  // started with this effect, or with the transition, could let the tab grow
  // past the strip on its first frames.
  const frameTime = win.document.timeline.currentTime;
  const startTime =
    typeof frameTime === "number" ? frameTime : win.performance.now();
  // A new transition takes its start time on the next frame, which a long task
  // can delay, such as the render of a large panel, so a fixed time could end
  // before the tabs grow. The strip keeps the room while the tabs that it
  // measured still enter. A tab ends its enter on a timer, which the long task
  // delays too, and the tab then shows whole, also if it hasn't grown yet.
  const isGrowing = () =>
    grown.entering.some((tab) => {
      if (!tab.isConnected) return false;
      return tab.hasAttribute("data-enter");
    });
  let frame = 0;
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    win.cancelAnimationFrame(frame);
    strip.style.paddingInlineEnd = inlinePaddingEnd;
    if (stripReveals.get(strip) === stop) {
      stripReveals.delete(strip);
    }
  };
  stripReveals.set(strip, stop);
  const step = () => {
    const elapsed = win.performance.now() - startTime;
    followWidth();
    keepRoom();
    const progress = Math.min(1, elapsed / scrollTime);
    // An ease out, like the growth of the tab.
    const eased = 1 - (1 - progress) ** 3;
    // A strip with smooth scroll behavior would start a new smooth scroll on
    // each frame.
    strip.scrollTo({ left: from + (to - from) * eased, behavior: "instant" });
    if (progress < 1 || isGrowing()) {
      frame = win.requestAnimationFrame(step);
      return;
    }
    stop();
    // A tab before this one can still grow, such as after quick presses on a
    // button that opens tabs, so the strip can end short of this tab.
    scrollIntoClearRange(strip, element, "smooth");
  };
  step();
  return stop;
}

/**
 * Whether a tab was added to a tab list that was already there, for the time of
 * its enter transition. A tab that is selected as it enters, such as a new tab
 * that a button opens, comes into view of its strip while it grows in.
 */
function useTabEntering(
  ref: React.RefObject<HTMLElement | null>,
  store: ak.TabStore | undefined,
  id: string,
) {
  const listMounted = useContext(TabListMountedContext);
  const [entering, setEntering] = useState(listMounted);
  const revealedRef = useRef(false);
  const stopRevealRef = useRef<(() => void) | undefined>(undefined);
  // Like Ariakit tabs, each tab follows only whether it is selected, so a new
  // selection renders only the two tabs that it changes.
  const selected = ak.useStoreState(store, (state) => state?.selectedId === id);
  useEffect(() => {
    if (!entering) return;
    const element = ref.current;
    const time = element ? getTransitionTime(element) : 0;
    const timer = setTimeout(() => setEntering(false), time);
    return () => clearTimeout(timer);
  }, [entering, ref]);
  // A tab that a button opens can get the selection in a later update than the
  // one that adds it, such as when the store takes a controlled selection, so
  // this runs again with the selection. The end of the enter doesn't stop the
  // scroll, which ends at the same time, but another selection does.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!selected) {
      stopRevealRef.current?.();
      stopRevealRef.current = undefined;
      // The tab can get the selection back while it still enters, such as after
      // quick selections between new tabs, and it comes into view again.
      revealedRef.current = false;
      return;
    }
    if (!entering) return;
    if (revealedRef.current) return;
    revealedRef.current = true;
    stopRevealRef.current = revealEnteringTab(element);
  }, [entering, ref, selected]);
  // StrictMode runs this cleanup and the effects above again as the tab mounts,
  // so a tab that is selected as it mounts still comes into view.
  useEffect(
    () => () => {
      stopRevealRef.current?.();
      stopRevealRef.current = undefined;
      revealedRef.current = false;
    },
    [],
  );
  return entering;
}

/**
 * Keeps the selected tab whole in view while its strip shrinks, such as beside
 * a sidebar that opens, when it was whole in view before. A tab that the strip
 * scrolled away from stays where it is.
 */
function useSelectedTabInView(strip: HTMLElement | null) {
  useEffect(() => {
    if (!strip) return;
    const win = getWindow(strip);
    // The selected tab when it last showed whole.
    let clearTab: Element | null = null;
    // A tab under a fade still shows whole. A shrink then scrolls it clear.
    const showsWhole = (tab: Element) => {
      const rect = tab.getBoundingClientRect();
      const left = strip.getBoundingClientRect().left + strip.clientLeft;
      const right = left + strip.clientWidth;
      return rect.left >= left - 1 && rect.right <= right + 1;
    };
    // The width of the strip at the last resize callback.
    let width = strip.offsetWidth;
    const update = () => {
      const tab = getSelectedTab(strip);
      clearTab = tab && showsWhole(tab) ? tab : null;
    };
    // The browser sends scroll events before resize callbacks in a frame, so a
    // scroll event can come after the strip shrinks and before its resize
    // callback. The strip then cuts the tab, which the callback still has to
    // scroll clear.
    const updateAtSameWidth = () => {
      if (strip.offsetWidth !== width) return;
      update();
    };
    const resizeObserver = new win.ResizeObserver(() => {
      width = strip.offsetWidth;
      const tab = getSelectedTab(strip);
      if (tab && tab === clearTab) {
        scrollIntoClearRange(strip, tab, "instant");
      }
      update();
    });
    const mutationObserver = new win.MutationObserver(updateAtSameWidth);
    resizeObserver.observe(strip, { box: "border-box" });
    mutationObserver.observe(strip, {
      attributes: true,
      attributeFilter: ["aria-selected"],
      subtree: true,
    });
    strip.addEventListener("scroll", updateAtSameWidth, { passive: true });
    update();
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      strip.removeEventListener("scroll", updateAtSameWidth);
    };
  }, [strip]);
}

interface UseTabReorderParams {
  strip: HTMLElement | null;
  store?: ak.TabStore;
  onReorder?: (ids: string[]) => void;
}

/**
 * Lets people move the tabs of a strip to a new place, with a drag and with the
 * keyboard, when the tab list has `onReorder`. The app keeps the order of the
 * tabs, and changes it in `onReorder`. Returns the live region that speaks each
 * move to screen reader users, for the tab list to render. The region goes in a
 * portal, because an element with the `tablist` role holds only tabs, and the
 * selectors of a tab row count the parts beside the strip.
 */
function useTabReorder({ strip, store, onReorder }: UseTabReorderParams) {
  const statusRef = useRef<HTMLDivElement>(null);
  const onReorderEvent = useEvent(onReorder);
  const reorderable = !!onReorder;
  useEffect(() => {
    if (!strip) return;
    if (!reorderable) return;
    const params = {
      strip,
      onReorder: (ids: string[]) => onReorderEvent(ids),
      announce: (text: string) => setTabStatus(statusRef.current, text),
    };
    const stopKeys = observeTabReorderKeys(params);
    const stopDrag = observeTabDrag({
      ...params,
      // A tab takes the selection when its drag starts. The click that would
      // select it doesn't come after a drag.
      onDragStart: (tab) => store?.setSelectedId(tab.id),
    });
    return () => {
      stopKeys();
      stopDrag();
    };
  }, [strip, store, reorderable, onReorderEvent]);
  if (!reorderable) return null;
  return (
    <ak.Portal>
      <div ref={statusRef} role="status" className="sr-only" />
    </ak.Portal>
  );
}

export interface TabsProps
  extends
    ak.RoleProps,
    Pick<
      TabProviderProps,
      | "rtl"
      | "selectedId"
      | "setSelectedId"
      | "defaultSelectedId"
      | "selectOnMove"
    >,
    VariantProps<typeof tabs> {}

/**
 * Shares tab state and renders a frame for the tab list and panels.
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={{ overview: "Overview", activity: "Activity" }}
 *   />
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview">Overview</Tab>
 *     <Tab id="activity">Activity</Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function Tabs({
  rtl,
  selectedId,
  setSelectedId,
  defaultSelectedId,
  selectOnMove,
  ...props
}: TabsProps) {
  const [variantProps, rest] = splitProps(props, tabs);
  return (
    <TabProvider
      rtl={rtl}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      defaultSelectedId={defaultSelectedId}
      selectOnMove={selectOnMove}
    >
      <ak.Role {...tabs.jsx(variantProps)} {...rest} />
    </TabProvider>
  );
}

export interface TabProviderProps extends ak.TabProviderProps {}

/**
 * Shares tab selection and keyboard navigation state without a wrapper element.
 * Use `Tabs` to include the styled parent for the tab list and panels.
 */
export function TabProvider(props: TabProviderProps) {
  return (
    // A tab list of these tabs is in a row only when a TabRow below this
    // provider holds it, not when the provider itself is in the row of other
    // tabs, such as in a popover of a row button.
    <TabRowContext.Provider value={false}>
      <ak.TabProvider {...props} />
    </TabRowContext.Provider>
  );
}

export interface TabProps extends ak.TabProps, VariantProps<typeof tab> {
  /**
   * A bar that marks the tab while selected, as `true`, an element, or `TabBar`
   * props. Rendered after the children. Use it with `flat` or `bevel` tabs.
   * Children of a `render` element replace it, so pass them to the tab instead.
   */
  bar?: boolean | React.ReactElement | TabBarProps;
  /**
   * A separator before the tab, as `true`, an element, or `TabSeparator` props.
   * It renders as a sibling of the tab, hidden from assistive technologies.
   * Pass `!!index` when mapping tabs to separate each tab from the one before
   * it. Filter out the tabs that don't render first, so the first tab that
   * renders has index 0.
   */
  separator?: boolean | React.ReactElement | TabSeparatorProps;
  /**
   * Makes the tab one that can close. The tab shows a `TabRemove` mark, and it
   * closes with a press on the mark and with the Delete and Backspace keys. The
   * tab that takes its place gets the selection and the keyboard focus of the
   * closed tab at once: the next tab, or the previous one after the last tab.
   * Then the tab leaves, and this function runs. Remove the tab and its panel
   * from your state here. Without another tab, nothing takes the selection or
   * the focus, so move them yourself, or leave out `onRemove` for the last tab.
   * A disabled tab doesn't close and shows no mark.
   */
  onRemove?: () => void;
  /**
   * The close mark of a tab with `onRemove`, as an element or `TabRemove`
   * props. `false` omits it, and the tab still closes from the keyboard.
   * Rendered after the children.
   */
  remove?: boolean | React.ReactElement | TabRemoveProps;
}

/**
 * Renders a tab that selects its associated panel. Plain text and numbers go in
 * a `TabLabel` automatically, so the label turns heavier while the tab is
 * selected without moving the tabs after it.
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview">Overview</Tab>
 *     <Tab id="activity">Activity</Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 * @example
 * <TabList aria-label="Project">
 *   {pages.map((page, index) => (
 *     <Tab key={page.id} id={page.id} separator={!!index}>
 *       {page.label}
 *     </Tab>
 *   ))}
 * </TabList>
 * @example
 * <TabList aria-label="Files">
 *   {files.map((file) => (
 *     <Tab key={file.id} id={file.id} onRemove={() => removeFile(file.id)}>
 *       {file.name}
 *     </Tab>
 *   ))}
 * </TabList>
 */
export function Tab({
  bar,
  separator,
  remove = true,
  onRemove,
  children,
  ref: refProp,
  ...props
}: TabProps) {
  const [variantProps, rest] = splitProps(props, tab);
  const context = ak.useTabContext();
  const defaultId = useId();
  const id = rest.id ?? defaultId;
  const tabRemoval = useTabRemove({ store: rest.store ?? context, onRemove });
  const entering = useTabEntering(tabRemoval.ref, rest.store ?? context, id);
  const ref = useMergeRefs(tabRemoval.ref, refProp);
  const barElement = createOptionalRender(TabBar, bar === true ? {} : bar);
  // A disabled tab takes no press, so it doesn't close from the keyboard
  // either. Like Ariakit, aria-disabled="true" counts as disabled.
  const removable = !!onRemove && !disabledFromProps(rest);
  const removeElement =
    removable &&
    createOptionalRender(TabRemove, remove === true ? {} : remove, {
      // A press on the mark keeps the focus where it is.
      onMouseDown: (event) => event.preventDefault(),
      // The prevented click then reaches the tab, which doesn't select itself
      // before it closes.
      onClick: (event) => {
        event.preventDefault();
        tabRemoval.remove();
      },
    });
  const text = getChildrenText(children);
  const label = text == null ? children : <TabLabel text={text} />;
  const removeProps: ak.TabProps = {
    onKeyDown: (event) => {
      rest.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      // A key press from an element inside the tab, such as a field in a
      // portal, edits that element and doesn't close the tab.
      if (!isSelfTarget(event)) return;
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      event.preventDefault();
      // Each close moves the focus to the next tab, so a key that repeats while
      // it's held would close the tabs one after another.
      if (event.repeat) return;
      tabRemoval.remove();
    },
  };
  return prependOptionalSeparator(
    TabSeparator,
    separator,
    <ak.Tab
      {...tab.jsx(variantProps)}
      data-enter={entering || undefined}
      data-leave={tabRemoval.leaving || undefined}
      {...rest}
      id={id}
      {...(removable ? removeProps : undefined)}
      // A tab that leaves takes no selection and no focus.
      disabled={tabRemoval.leaving || rest.disabled}
      accessibleWhenDisabled={
        tabRemoval.leaving ? false : rest.accessibleWhenDisabled
      }
      ref={ref}
    >
      <TabMarkContext.Provider value={!!removeElement}>
        {appendOptionalChild(
          appendOptionalChild(label, barElement),
          removeElement || null,
        )}
      </TabMarkContext.Provider>
    </ak.Tab>,
  );
}

export interface TabRemoveProps
  extends ComponentProps<"span">, VariantProps<typeof tabRemove> {}

/**
 * Renders the close mark of a tab with `onRemove`. `Tab` renders one after its
 * children, so pass it, or its props, to the `remove` prop of `Tab` to change
 * it. The mark is hidden from assistive technologies, because a tab can't hold
 * a button: the tab closes with the Delete and Backspace keys instead. Children
 * replace the icon.
 * @example
 * <Tab id="index" onRemove={removeIndex} remove={{ $ink: 80 }}>
 *   index.ts
 * </Tab>
 */
export function TabRemove({ children, ...props }: TabRemoveProps) {
  const [variantProps, rest] = splitProps(props, tabRemove);
  return (
    <span aria-hidden {...tabRemove.jsx(variantProps)} {...rest}>
      {children ?? <XIcon />}
    </span>
  );
}

export interface TabListProps
  extends ak.TabListProps, VariantProps<typeof tabList> {
  /**
   * Tabs to render before `children`. Accepts content, `Tab` props, or elements
   * that replace tabs. Record keys supply default tab IDs. Text labels are
   * wrapped in `TabLabel`.
   */
  tabs?:
    | Array<React.ReactNode | TabProps>
    | Record<string, React.ReactNode | TabProps>;
  /**
   * Renders scroll buttons before and after a strip or a segmented list with
   * padding, outside the element with the `tablist` role. They show with a fine
   * pointer while the list can scroll toward their side. A segmented list
   * without padding doesn't scroll, so it has none. Defaults to `true`.
   */
  buttons?: boolean;
  /**
   * The button before the list, as `true`, an element, or `CarouselButton`
   * props. `false` omits it. Defaults to a button named "Previous tabs".
   */
  previousButton?: CarouselButtonRender;
  /**
   * The button after the list, as `true`, an element, or `CarouselButton`
   * props. `false` omits it. Defaults to a button named "Next tabs".
   */
  nextButton?: CarouselButtonRender;
  /**
   * Lets people move the tabs of the list to a new place: with a drag, with a
   * long press and a drag on a touch screen, and with Ctrl+Shift (Command+Shift
   * on Apple devices) and the Left and Right Arrow keys, or the Home and End
   * keys. Called once after each move with the IDs of the tabs in their new
   * order. Change the order of your tabs here: the list doesn't change it
   * itself. Give each tab an `id`. A disabled tab doesn't move, and the other
   * tabs can pass it. A screen reader speaks the new place of the tab.
   */
  onReorder?: (ids: string[]) => void;
}

/**
 * Names a strip scroll button "Previous tabs" or "Next tabs", unless it has its
 * own label. Without one, it would take the generic label of a carousel row.
 */
function getTabListButton(button: CarouselButtonRender, label: string) {
  if (button === false) return false;
  return createRender(CarouselButton, button === true ? {} : button, {
    "aria-label": label,
  });
}

/**
 * The key of a tab from the array of the `tabs` prop. Prefixes prevent
 * collisions between the kinds of keys. Children.toArray clones still cause
 * missing-key warnings in react-dom 19. A tab with an `id` keeps its element
 * when `onReorder` changes the order of the array, so the focus stays on it.
 */
function getArrayTabKey(element: React.ReactElement<TabProps>, index: number) {
  if (element.key != null) return `key:${element.key}`;
  if (element.props.id != null) return `id:${element.props.id}`;
  return `index:${index}`;
}

/**
 * Renders one entry of the `tabs` prop. Text, alone or as the `children` of a
 * props object, goes in a `TabLabel` through `Tab`, like the text of a tab
 * written as JSX. Nullish and boolean entries, such as `canEdit && "Settings"`,
 * render no tab.
 */
function renderTab(tab: React.ReactNode | TabProps, props?: TabProps) {
  // createRender turns null into a default element, so empty entries must
  // return here. Otherwise they render unnamed tabs.
  if (tab == null) return null;
  if (typeof tab === "boolean") return null;
  return createRender(Tab, tab, props);
}

/**
 * Renders a named tab list from children, an array, or a record of tabs. A
 * strip that overflows scrolls sideways, fades its tabs at the ends, and shows
 * "Previous tabs" and "Next tabs" buttons with a fine pointer. A wrapper holds
 * the strip and the buttons, which sit outside the element with the `tablist`
 * role. In a `TabRow`, the row takes the place of that wrapper, and it also
 * holds the controls beside the strip. With `$kind="segmented"`, it stands on
 * its own as a segmented control, outside `Tabs`, and the tabs of the `tabs`
 * prop take the same kind. Tabs written as children need their own `$kind`. A
 * segmented list with padding scrolls in the same way, and its wrapper paints
 * the surface of the list and takes `className` and `style`.
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={{ overview: "Overview", activity: "Activity" }}
 *   />
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={[
 *       { id: "overview", children: "Overview" },
 *       { id: "activity", children: "Activity" },
 *     ]}
 *   />
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 * @example
 * <TabList
 *   aria-label="Files"
 *   onReorder={(ids) => {
 *     setFiles(files.toSorted((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)));
 *   }}
 * >
 *   {files.map((file) => (
 *     <Tab key={file.id} id={file.id}>{file.name}</Tab>
 *   ))}
 * </TabList>
 */
export function TabList({
  tabs,
  children,
  buttons = true,
  previousButton = true,
  nextButton = true,
  onReorder,
  ref,
  ...props
}: TabListProps) {
  const [variantProps, rest] = splitProps(props, tabList);
  const inRow = useContext(TabRowContext);
  const context = ak.useTabContext();
  // The tabs that render after the list has its element were added to it.
  const [list, setList] = useState<HTMLElement | null>(null);
  const listRef = useMergeRefs(ref, setList);
  useSelectedTabInView(list);
  const reorderStatus = useTabReorder({
    strip: list,
    store: rest.store ?? context,
    onReorder,
  });
  const segmented = variantProps.$kind === "segmented";
  // The tabs of the shorthand have no props of their own to set the kind.
  const kindProps: TabProps | undefined = segmented
    ? { $kind: "segmented" }
    : undefined;
  const items = (
    <TabListMountedContext.Provider value={!!list}>
      {Array.isArray(tabs)
        ? tabs.map((tab, index) => {
            const element = renderTab(tab, kindProps);
            if (!element) return null;
            return (
              <Fragment key={getArrayTabKey(element, index)}>
                {element}
              </Fragment>
            );
          })
        : Object.entries(tabs ?? {}).map(([id, tab]) => (
            <Fragment key={id}>{renderTab(tab, { ...kindProps, id })}</Fragment>
          ))}
      {children}
      {reorderStatus}
    </TabListMountedContext.Provider>
  );
  const buttonProps = {
    buttons,
    previousButton: getTabListButton(previousButton, "Previous tabs"),
    nextButton: getTabListButton(nextButton, "Next tabs"),
  };
  const variants = tabList.getVariants(variantProps);
  if (segmented && variants.$p === "none") {
    return (
      <ak.TabList ref={listRef} {...tabList.jsx(variantProps)} {...rest}>
        {items}
      </ak.TabList>
    );
  }
  if (segmented) {
    // A segmented list with padding scrolls in a carousel row too. Its fades
    // would fade its surface, so the carousel paints the surface with the frame
    // of the list, and the list covers the carousel. The fade of the list is
    // not the layer fade of the surface.
    const [{ $fade, ...surfaceProps }] = splitProps(variants, frame);
    const { className, style, ...listProps } = variantProps;
    return (
      <Carousel
        $kind="row"
        {...surfaceProps}
        $size={variants.$size}
        $bleed="var(--ak-frame-padding)"
        {...buttonProps}
        // The buttons sit at the start and the end of the list, and hide with
        // it.
        dir={rest.dir}
        hidden={rest.hidden}
        className={cx(
          variants.$layout === "stretch" ? "w-full" : "ui-base:w-fit",
          className,
        )}
        style={style}
      >
        <CarouselViewport
          ref={listRef}
          recipe={tabList}
          {...listProps}
          render={<ak.TabList {...rest} />}
        >
          {items}
        </CarouselViewport>
      </Carousel>
    );
  }
  if (inRow) {
    // The row is the carousel root, so the strip and its buttons sit beside the
    // other controls of the row. The row stays when the list hides, so the
    // buttons of the list leave with it.
    return (
      <CarouselViewport
        ref={listRef}
        recipe={tabList}
        {...variantProps}
        {...buttonProps}
        buttons={rest.hidden ? false : buttons}
        render={<ak.TabList {...rest} />}
      >
        {items}
      </CarouselViewport>
    );
  }
  // A strip is a carousel row: the carousel root holds the strip and the
  // buttons beside it, outside the element with the tablist role, and hides
  // with it.
  return (
    <Carousel recipe={tabListCarousel} {...buttonProps} hidden={rest.hidden}>
      <CarouselViewport
        ref={listRef}
        recipe={tabList}
        {...variantProps}
        render={<ak.TabList {...rest} />}
      >
        {items}
      </CarouselViewport>
    </Carousel>
  );
}

export interface TabRowProps extends Omit<
  CarouselProps<typeof tabRow>,
  | "recipe"
  | "buttons"
  | "previousButton"
  | "nextButton"
  | "selectedId"
  | "defaultSelectedId"
  | "setSelectedId"
> {}

/**
 * Renders a row for a `TabList` and the controls beside it, such as a button
 * that opens a tab. The controls are outside the element with the `tablist`
 * role, in the Tab order of the page. The tab list takes the width of its tabs
 * and scrolls when the row is full, so a control after it stays next to the
 * last tab. An element with a `grow` class takes the free space, so the
 * controls after it sit at the end of the row. With `$sticky`, the row stays at
 * the top of the page while the page scrolls the panels, and it keeps the edge
 * and the corners of the panels in view.
 * @example
 * <Tabs>
 *   <TabRow>
 *     <TabList aria-label="Files">
 *       <Tab id="index">index.ts</Tab>
 *       <Tab id="utils">utils.ts</Tab>
 *     </TabList>
 *     <TabRowButton aria-label="New file">
 *       <TabSlot><PlusIcon /></TabSlot>
 *     </TabRowButton>
 *   </TabRow>
 *   <TabPanels>
 *     <TabPanel tabId="index">The entry file</TabPanel>
 *     <TabPanel tabId="utils">Shared functions</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabRow(props: TabRowProps) {
  return (
    <TabRowContext.Provider value={true}>
      <Carousel recipe={tabRow} {...props} />
    </TabRowContext.Provider>
  );
}

export interface TabRowButtonProps
  extends ak.ButtonProps, VariantProps<typeof tabRowButton> {
  /**
   * A separator before the button, as `true`, an element, or `TabSeparator`
   * props. It renders as a sibling of the button, hidden from assistive
   * technologies.
   */
  separator?: boolean | React.ReactElement | TabSeparatorProps;
}

/**
 * Renders a button in a `TabRow` that looks like a tab that is not selected. It
 * is not a tab: the Tab key reaches it, and screen readers announce a button.
 * Give it the same `$kind` as the tabs. An icon goes in a `TabSlot`, and an
 * icon-only button needs an `aria-label`.
 * @example
 * <TabRow>
 *   <TabList aria-label="Files">
 *     <Tab id="index">index.ts</Tab>
 *   </TabList>
 *   <TabRowButton aria-label="New file" separator>
 *     <TabSlot><PlusIcon /></TabSlot>
 *   </TabRowButton>
 * </TabRow>
 */
export function TabRowButton({ separator, ...props }: TabRowButtonProps) {
  const [variantProps, rest] = splitProps(props, tabRowButton);
  return prependOptionalSeparator(
    TabSeparator,
    separator,
    <ak.Button {...tabRowButton.jsx(variantProps)} {...rest} />,
  );
}

export interface TabRowFrameProps
  extends ak.RoleProps<"div">, VariantProps<typeof tabRowFrame> {
  /**
   * A separator before the frame, as `true`, an element, or `TabSeparator`
   * props. It renders as a sibling of the frame, hidden from assistive
   * technologies.
   */
  separator?: boolean | React.ReactElement | TabSeparatorProps;
}

/**
 * Renders a static part of a `TabRow`, such as a logo or a title beside the
 * tabs. It has the box of a folder tab that is not selected, so with the same
 * `$p`, its icon and text line up with those of folder tabs and of each folder
 * `TabRowButton`. An icon goes in a `TabSlot`, and the text in a `TabLabel`.
 * Its `separator` prop draws a pipe before it, like the `separator` prop of
 * `TabRowButton`.
 * @example
 * <TabRow>
 *   <TabRowFrame className="font-semibold">
 *     <TabSlot><NotebookIcon /></TabSlot>
 *     <TabLabel>Notes</TabLabel>
 *   </TabRowFrame>
 *   <TabList aria-label="Open notes">
 *     <Tab id="trip">Trip</Tab>
 *   </TabList>
 * </TabRow>
 */
export function TabRowFrame({ separator, ...props }: TabRowFrameProps) {
  const [variantProps, rest] = splitProps(props, tabRowFrame);
  return prependOptionalSeparator(
    TabSeparator,
    separator,
    <ak.Role.div {...tabRowFrame.jsx(variantProps)} {...rest} />,
  );
}

export interface TabSeparatorProps
  extends ComponentProps<"div">, VariantProps<typeof tabSeparator> {}

/**
 * Renders a visual divider between tabs. Pass it, or its props, to the
 * `separator` prop of `Tab` so it renders before the tab, hidden from assistive
 * technologies.
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview">Overview</Tab>
 *     <Tab id="activity" separator>Activity</Tab>
 *     <Tab id="members" separator={<TabSeparator $kind="slash" />}>
 *       Members
 *     </Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *     <TabPanel tabId="members">Team members</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabSeparator(props: TabSeparatorProps) {
  const [variantProps, rest] = splitProps(props, tabSeparator);
  return <div {...tabSeparator.jsx(variantProps)} {...rest} />;
}

export interface TabLabelProps
  extends ComponentProps<"span">, VariantProps<typeof tabLabel> {
  /**
   * The label text, rendered when `children` is omitted. Defaults to the text
   * of `children` that are only text and numbers. A selected tab shows its
   * label in a heavier weight only when the label has this text, because the
   * text reserves the heavier width in advance and keeps the tab size. Keep it
   * equal to the visible text of custom `children`.
   */
  text?: string;
}

/**
 * Renders tab label text with optional truncation. In a tab with a close mark,
 * `$grow` defaults to `true`, so the text starts at the start of the tab and
 * the mark stays at its end.
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview"><TabLabel>Overview</TabLabel></Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *   </TabPanels>
 * </Tabs>
 * @example
 * <Tabs>
 *   <TabList aria-label="Repository">
 *     <Tab id="api">
 *       <TabLabel text="API">
 *         <abbr title="Application programming interface">API</abbr>
 *       </TabLabel>
 *     </Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="api">Endpoints and types</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabLabel({ text, children = text, ...props }: TabLabelProps) {
  const mark = useContext(TabMarkContext);
  const [variantProps, rest] = splitProps(
    { $grow: mark || undefined, ...props },
    tabLabel,
  );
  return (
    <span
      data-text={text ?? getChildrenText(children)}
      {...tabLabel.jsx(variantProps)}
      {...rest}
    >
      {children}
    </span>
  );
}

export interface TabSlotProps
  extends ComponentProps<"span">, VariantProps<typeof tabSlot> {}

/**
 * Renders an icon, badge, or shortcut next to a tab label.
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="activity">
 *       <TabLabel>Activity</TabLabel>
 *       <TabSlot $kind="box">
 *         <Badge $kind="solid">3 new</Badge>
 *       </TabSlot>
 *     </Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="activity">Three recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabSlot(props: TabSlotProps) {
  const [variantProps, rest] = splitProps(props, tabSlot);
  return <span {...tabSlot.jsx(variantProps)} {...rest} />;
}

export interface TabPanelsProps
  extends ComponentProps<"div">, VariantProps<typeof tabPanels> {}

/**
 * Renders the shared surface around tab panels.
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={{ overview: "Overview", activity: "Activity" }}
 *   />
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabPanels(props: TabPanelsProps) {
  const [variantProps, rest] = splitProps(props, tabPanels);
  return <div {...tabPanels.jsx(variantProps)} {...rest} />;
}

export interface TabPanelProps extends ak.TabPanelProps {
  /**
   * Associates one panel with the selected tab. Update its children to match
   * the selected tab. An explicit `tabId` takes precedence. Defaults to
   * `false`.
   */
  single?: boolean;
}

/**
 * Shows the content associated with a tab through its `tabId`.
 * @example
 * <Tabs>
 *   <TabList
 *     aria-label="Project"
 *     tabs={{ overview: "Overview", activity: "Activity" }}
 *   />
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabPanel({ single, ...props }: TabPanelProps) {
  const context = ak.useTabContext();
  const tabId = ak.useStoreState(props.store ?? context, "selectedId");
  return <ak.TabPanel tabId={single ? tabId : undefined} {...props} />;
}

export interface TabBarProps
  extends ComponentProps<"span">, VariantProps<typeof tabBar> {}

/**
 * A thin bar that marks the selected tab. Pass it, or its props, to the `bar`
 * prop of `Tab` so it renders as the last child.
 * @example
 * <Tabs>
 *   <TabList aria-label="Project">
 *     <Tab id="overview" $kind="flat" bar>Overview</Tab>
 *     <Tab id="activity" $kind="flat" bar>Activity</Tab>
 *   </TabList>
 *   <TabPanels>
 *     <TabPanel tabId="overview">Project details</TabPanel>
 *     <TabPanel tabId="activity">Recent changes</TabPanel>
 *   </TabPanels>
 * </Tabs>
 */
export function TabBar(props: TabBarProps) {
  const [variantProps, rest] = splitProps(props, tabBar);
  return <span aria-hidden {...tabBar.jsx(variantProps)} {...rest} />;
}
