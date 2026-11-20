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
  tabSeparator,
  tabSlot,
  tabs,
} from "../styles/tabs.ts";
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

/**
 * Whether a tab was added to a tab list that was already there, for the time of
 * its enter transition.
 */
function useTabEntering(ref: React.RefObject<HTMLElement | null>) {
  const listMounted = useContext(TabListMountedContext);
  const [entering, setEntering] = useState(listMounted);
  useEffect(() => {
    if (!entering) return;
    const element = ref.current;
    const time = element ? getTransitionTime(element) : 0;
    const timer = setTimeout(() => setEntering(false), time);
    return () => clearTimeout(timer);
  }, [entering, ref]);
  return entering;
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
  const tabRemoval = useTabRemove({ store: rest.store ?? context, onRemove });
  const entering = useTabEntering(tabRemoval.ref);
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
      {...(removable ? removeProps : undefined)}
      // A tab that leaves takes no selection and no focus.
      disabled={tabRemoval.leaving || rest.disabled}
      accessibleWhenDisabled={
        tabRemoval.leaving ? false : rest.accessibleWhenDisabled
      }
      ref={ref}
    >
      {appendOptionalChild(
        appendOptionalChild(label, barElement),
        removeElement || null,
      )}
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
 */
export function TabList({
  tabs,
  children,
  buttons = true,
  previousButton = true,
  nextButton = true,
  ref,
  ...props
}: TabListProps) {
  const [variantProps, rest] = splitProps(props, tabList);
  const inRow = useContext(TabRowContext);
  // The tabs that render after the list has its element were added to it.
  const [list, setList] = useState<HTMLElement | null>(null);
  const listRef = useMergeRefs(ref, setList);
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
            // Prefixes prevent key/index collisions. Children.toArray clones
            // still cause missing-key warnings in react-dom 19.
            const key =
              element.key == null ? `index:${index}` : `key:${element.key}`;
            return <Fragment key={key}>{element}</Fragment>;
          })
        : Object.entries(tabs ?? {}).map(([id, tab]) => (
            <Fragment key={id}>{renderTab(tab, { ...kindProps, id })}</Fragment>
          ))}
      {children}
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
 * controls after it sit at the end of the row.
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
 * Renders tab label text with optional truncation.
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
  const [variantProps, rest] = splitProps(props, tabLabel);
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
