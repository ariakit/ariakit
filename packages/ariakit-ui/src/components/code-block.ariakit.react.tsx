import * as ak from "@ariakit/react";
import {
  useEvent,
  useMergeRefs,
  useSafeLayoutEffect,
} from "@ariakit/react-utils";
import { getWindow } from "@ariakit/utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import * as React from "react";
import {
  createOptionalRender,
  createRender,
  getChildrenText,
  isRenderable,
  prependOptionalSeparator,
} from "../react-utils/create-render.react.ts";
import {
  codeBlock,
  codeBlockCode,
  codeBlockCollapse,
  codeBlockCopy,
  codeBlockExpand,
  codeBlockHeader,
  codeBlockSkeleton,
  codeBlockSkeletonToken,
  codeBlockTab,
  codeBlockTabSeparator,
  codeBlockTitle,
} from "../styles/code-block.ts";
import { tabLabel, tabListCarousel } from "../styles/tabs.ts";
import type { ButtonProps } from "./button.ariakit.react.tsx";
import { Button, ButtonLabel, ButtonSlot } from "./button.ariakit.react.tsx";
import type { CarouselButtonRender } from "./carousel.ariakit.react.tsx";
import {
  Carousel,
  CarouselButton,
  CarouselViewport,
} from "./carousel.ariakit.react.tsx";
import type { CopyButtonProps } from "./copy-button.ariakit.react.tsx";
import { CopyButton } from "./copy-button.ariakit.react.tsx";
import type { SkeletonProps } from "./skeleton.ariakit.react.tsx";
import { Skeleton, SkeletonLine } from "./skeleton.ariakit.react.tsx";
import type {
  TabListProps,
  TabPanelProps,
  TabProviderProps,
} from "./tabs.ariakit.react.tsx";
import {
  TabLabel,
  TabPanel,
  TabProvider,
  TabSlot,
} from "./tabs.ariakit.react.tsx";

interface CodeBlockCodeInfo {
  /** The id of the code, which the expand and collapse buttons control. */
  id: string;
  lineCount: number;
}

interface CodeBlockContextValue {
  /** The id that a title in this block takes when it has none of its own. */
  defaultTitleId: string;
  /** The id of the title that names the scroll area, if the block has one. */
  titleId?: string;
  setTitleId: (id?: string) => void;
  /**
   * The text of each title and file tab, by id. A copy button names the title
   * or the tab that names its code.
   */
  labels: ReadonlyMap<string, string>;
  setLabel: (id: string, text?: string) => void;
  /** The lines that collapsed code shows, if the block collapses long code. */
  maxLines?: number;
  expanded: boolean;
  /** Changes the state from a button, which also moves the focus. */
  toggleExpanded: (expanded: boolean) => void;
  expandElement: React.ReactNode;
  collapseElement: React.ReactNode;
  /** The code that shows, for buttons written as children of the block. */
  code?: CodeBlockCodeInfo;
  setCode: (code?: CodeBlockCodeInfo) => void;
  codeRef: React.RefObject<HTMLElement | null>;
  expandRef: React.RefObject<HTMLElement | null>;
  collapseRef: React.RefObject<HTMLElement | null>;
}

const CodeBlockContext = React.createContext<CodeBlockContextValue | null>(
  null,
);

// The code passes its id and line count to the buttons that it renders, so they
// have them in the server HTML too.
const CodeBlockCodeContext = React.createContext<CodeBlockCodeInfo | null>(
  null,
);

// The code passes the text of its title or tab to its copy button.
const CodeBlockCopyNameContext = React.createContext<string | undefined>(
  undefined,
);

export interface CodeBlockProps
  extends
    Omit<ak.RoleProps<"div">, "title">,
    Pick<
      TabProviderProps,
      | "rtl"
      | "selectedId"
      | "setSelectedId"
      | "defaultSelectedId"
      | "selectOnMove"
    >,
    VariantProps<typeof codeBlock> {
  /**
   * A title in the header, such as a file name, as content, a `CodeBlockTitle`
   * element, or `CodeBlockTitle` props. It also names the scroll area of the
   * code, and the label of its copy button names it too.
   */
  title?: React.ReactNode | CodeBlockTitleProps;
  /**
   * Collapses code with more lines than this to its first lines, and fades out
   * the last ones. A click on the collapsed code or on the expand button over
   * it shows all lines, and the focus moves to the code. A collapse button in a
   * row under the code shows fewer lines again, and the focus moves back to the
   * expand button. Collapsed code is inert, so the tab order and screen readers
   * skip it. With file tabs, a shorter file shows all lines.
   */
  maxLines?: number;
  /**
   * Whether long code shows all lines. Pass it with `setExpanded` to control
   * the state, such as to expand every block on a page.
   */
  expanded?: boolean;
  /**
   * Whether long code shows all lines at first.
   * @default false
   */
  defaultExpanded?: boolean;
  /**
   * Called when the expand or the collapse button changes the state.
   */
  setExpanded?: (expanded: boolean) => void;
  /**
   * The button over collapsed code that shows all lines, as a label, an
   * element, or `CodeBlockExpand` props. `false` omits it, so a
   * `CodeBlockExpand` can be a child of the block instead.
   */
  expand?: boolean | string | React.ReactElement | CodeBlockExpandProps;
  /**
   * The button under expanded code that shows fewer lines, as a label, an
   * element, or `CodeBlockCollapse` props. `false` omits it, so a
   * `CodeBlockCollapse` can be a child of the block instead.
   */
  collapse?: boolean | string | React.ReactElement | CodeBlockCollapseProps;
}

// A string is the label of the button, and true is the default button.
function getButtonShorthand<P extends { label?: unknown }>(
  value?: boolean | string | React.ReactElement | P,
) {
  if (value == null) return {};
  if (value === true) return {};
  if (typeof value === "string") return { label: value };
  return value;
}

const TAB_PROVIDER_KEYS = [
  "rtl",
  "selectedId",
  "setSelectedId",
  "defaultSelectedId",
  "selectOnMove",
] as const;

// A tab prop makes the block share tab state, even when its value is undefined,
// so a controlled value can start empty without remounting the block. A static
// block creates no tab store.
function hasTabProviderProps(props: CodeBlockProps) {
  return TAB_PROVIDER_KEYS.some((key) => Object.hasOwn(props, key));
}

function isDocumentOrShadowRoot(node: Node): node is Document | ShadowRoot {
  return "activeElement" in node;
}

// The focused element in the document or the shadow root of the node.
function getFocusedElement(node: Node) {
  const root = node.getRootNode();
  if (!isDocumentOrShadowRoot(root)) return null;
  return root.activeElement;
}

interface ToggleFocus {
  origin: Element | null;
  cleanup: () => void;
}

// Remembers the element that has the focus when a button toggles the block,
// until the state changes. Another press of a pointer or a key, or a turn of
// the wheel, means that the user moved on, such as after a toggle that the page
// ignored, so a later state from outside doesn't move the focus or scroll.
function trackToggleFocus(block: HTMLElement, onCancel: () => void) {
  const controller = new AbortController();
  const cancel = () => {
    controller.abort();
    onCancel();
  };
  const options = { capture: true, signal: controller.signal };
  const doc = block.ownerDocument;
  doc.addEventListener("pointerdown", cancel, options);
  doc.addEventListener("keydown", cancel, options);
  doc.addEventListener("wheel", cancel, { ...options, passive: true });
  const toggleFocus: ToggleFocus = {
    origin: getFocusedElement(block),
    cleanup: () => controller.abort(),
  };
  return toggleFocus;
}

// The text of the title that the shorthand prop renders, so the label of the
// copy button names it in the server HTML too. Other elements that render a
// CodeBlockTitle register its text after it mounts.
function getTitleText(title: React.ReactNode) {
  if (!React.isValidElement<CodeBlockTitleProps>(title)) return;
  if (title.type !== CodeBlockTitle) return;
  return getChildrenText(title.props.children);
}

/**
 * Renders a block of code. `title` renders a header with a title that looks
 * like a selected folder tab on the code. A static block like this shows only
 * the edges of the title and the code. For file tabs in the header, pass
 * `defaultSelectedId` or `selectedId`, which share the tab state, and write a
 * `CodeBlockTabList` as the first child and a `CodeBlockPanel` for each file.
 * The `copy` prop of the code renders a copy button in the top end corner of
 * the code, and its label names the title, such as "Copy counter.tsx".
 * `maxLines` collapses long code to its first lines. The block fits on the
 * screen, below the sticky bars of a shell, and the code scrolls down inside.
 * @example
 * const code = highlight(source, "tsx");
 * <CodeBlock title="counter.tsx">
 *   <CodeBlockCode html={code.html} copy={code.text} />
 * </CodeBlock>
 * @example
 * <CodeBlock title="use-users.ts" maxLines={12}>
 *   <CodeBlockCode html={code.html} copy={code.text} $lineNumbers />
 * </CodeBlock>
 * @example
 * <CodeBlock defaultSelectedId="toggle.tsx">
 *   <CodeBlockTabList aria-label="Files">
 *     <CodeBlockTab id="toggle.tsx">toggle.tsx</CodeBlockTab>
 *     <CodeBlockTab id="toggle.css" separator>
 *       toggle.css
 *     </CodeBlockTab>
 *   </CodeBlockTabList>
 *   <CodeBlockPanel tabId="toggle.tsx" html={tsx.html} copy={tsx.text} />
 *   <CodeBlockPanel tabId="toggle.css" html={css.html} copy={css.text} />
 * </CodeBlock>
 */
export function CodeBlock(props: CodeBlockProps) {
  const {
    ref,
    title,
    maxLines,
    expanded: expandedProp,
    defaultExpanded = false,
    setExpanded,
    expand,
    collapse,
    children,
    rtl,
    selectedId,
    setSelectedId,
    defaultSelectedId,
    selectOnMove,
    ...blockProps
  } = props;
  const [variantProps, rest] = splitProps(blockProps, codeBlock);
  const defaultTitleId = React.useId();
  const [registeredTitleId, setTitleId] = React.useState<string>();
  const [registeredLabels, setLabels] = React.useState<
    ReadonlyMap<string, string>
  >(() => new Map());
  const [code, setCode] = React.useState<CodeBlockCodeInfo>();
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    React.useState(defaultExpanded);
  const expanded = expandedProp ?? uncontrolledExpanded;
  const blockRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = useMergeRefs(blockRef, ref);
  const codeRef = React.useRef<HTMLElement>(null);
  const expandRef = React.useRef<HTMLElement>(null);
  const collapseRef = React.useRef<HTMLElement>(null);
  const toggleFocus = React.useRef<ToggleFocus | null>(null);
  const titleElement = createOptionalRender(CodeBlockTitle, title);
  // The buttons go in the context, so they change only with their props.
  const expandElement = React.useMemo(
    () =>
      createOptionalRender(
        CodeBlockExpand,
        expand === false ? false : getButtonShorthand(expand),
      ),
    [expand],
  );
  const collapseElement = React.useMemo(
    () =>
      createOptionalRender(
        CodeBlockCollapse,
        collapse === false ? false : getButtonShorthand(collapse),
      ),
    [collapse],
  );

  const setLabel = React.useCallback((id: string, text?: string) => {
    setLabels((labels) => {
      if (labels.get(id) === text) return labels;
      const nextLabels = new Map(labels);
      if (text == null) {
        nextLabels.delete(id);
      } else {
        nextLabels.set(id, text);
      }
      return nextLabels;
    });
  }, []);

  const toggleExpanded = useEvent((nextExpanded: boolean) => {
    toggleFocus.current?.cleanup();
    toggleFocus.current = null;
    const block = blockRef.current;
    if (block) {
      toggleFocus.current = trackToggleFocus(block, () => {
        toggleFocus.current = null;
      });
    }
    setUncontrolledExpanded(nextExpanded);
    setExpanded?.(nextExpanded);
  });

  // The button that the user pressed goes away, so the focus moves to the code
  // that now shows, or back to the expand button. The block scrolls into view,
  // as a collapse can leave the page scrolled past it, and an expanded block
  // fits on the screen. A state from outside, such as a button that expands
  // every block on the page, doesn't move the focus. A controlled page can
  // apply a toggle later, such as in a transition, so the focus waits for the
  // state to change.
  useSafeLayoutEffect(() => {
    const pending = toggleFocus.current;
    if (!pending) return;
    pending.cleanup();
    toggleFocus.current = null;
    const block = blockRef.current;
    if (!block) return;
    // The focus is still where it was, such as on a dialog around the block
    // that a click on the collapsed code focused, or it fell to the body with
    // the pressed button. Otherwise, something else moved the focus, and it
    // stays.
    const stayed = getFocusedElement(block) === pending.origin;
    // A shadow root has no focused element when the focus is outside it, so the
    // document tells whether the focus fell to the body.
    const doc = block.ownerDocument;
    const fell = !doc.activeElement || doc.activeElement === doc.body;
    if (!stayed && !fell) return;
    const target = expanded ? codeRef.current : expandRef.current;
    target?.focus({ preventScroll: true });
    if (!expanded) {
      block.scrollIntoView({ block: "nearest" });
      return;
    }
    // The collapse button comes into view smoothly. A block that fits on the
    // screen comes into view whole. Without a height limit, the block can be
    // taller than the screen, so only the button does. One smooth scroll would
    // stop another.
    const win = getWindow(block);
    const reduced = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fits = block.offsetHeight <= win.innerHeight;
    const scrollTarget = fits ? block : (collapseRef.current ?? block);
    scrollTarget.scrollIntoView({
      block: "nearest",
      behavior: reduced ? "instant" : "smooth",
    });
  }, [expanded]);

  React.useEffect(() => () => toggleFocus.current?.cleanup(), []);

  // A title from the shorthand prop names the scroll area and the copy button
  // in the server HTML too. A title written as a part registers its id and its
  // text after it mounts, like a file tab registers its text.
  const titleId =
    registeredTitleId ?? (titleElement ? defaultTitleId : undefined);
  const shorthandTitleText = getTitleText(titleElement);
  const labels = React.useMemo(() => {
    if (shorthandTitleText == null) return registeredLabels;
    if (registeredLabels.has(defaultTitleId)) return registeredLabels;
    return new Map(registeredLabels).set(defaultTitleId, shorthandTitleText);
  }, [registeredLabels, shorthandTitleText, defaultTitleId]);
  const context = React.useMemo(
    () => ({
      defaultTitleId,
      titleId,
      setTitleId,
      labels,
      setLabel,
      maxLines,
      expanded,
      toggleExpanded,
      expandElement,
      collapseElement,
      code,
      setCode,
      codeRef,
      expandRef,
      collapseRef,
    }),
    [
      defaultTitleId,
      titleId,
      labels,
      setLabel,
      maxLines,
      expanded,
      toggleExpanded,
      expandElement,
      collapseElement,
      code,
    ],
  );
  const block = (
    <CodeBlockContext.Provider value={context}>
      <ak.Role.div
        // A title alone in the header sits in the corner, like a file folder.
        {...codeBlock.jsx({
          $p: titleElement ? 0 : undefined,
          ...variantProps,
        })}
        {...rest}
        ref={mergedRef}
      >
        {titleElement && <CodeBlockHeader>{titleElement}</CodeBlockHeader>}
        {children}
      </ak.Role.div>
    </CodeBlockContext.Provider>
  );
  if (!hasTabProviderProps(props)) return block;
  return (
    <TabProvider
      rtl={rtl}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      defaultSelectedId={defaultSelectedId}
      selectOnMove={selectOnMove}
    >
      {block}
    </TabProvider>
  );
}

export interface CodeBlockHeaderProps
  extends ak.RoleProps<"div">, VariantProps<typeof codeBlockHeader> {}

/**
 * Renders the header above the code, for a title. Its strip is transparent, so
 * the title stands on the page.
 * @example
 * <CodeBlock>
 *   <CodeBlockHeader>
 *     <CodeBlockTitle>counter.tsx</CodeBlockTitle>
 *   </CodeBlockHeader>
 *   <CodeBlockCode html={code.html} />
 * </CodeBlock>
 */
export function CodeBlockHeader(props: CodeBlockHeaderProps) {
  const [variantProps, rest] = splitProps(props, codeBlockHeader);
  return <ak.Role.div {...codeBlockHeader.jsx(variantProps)} {...rest} />;
}

export interface CodeBlockTabListProps
  extends
    ak.TabListProps,
    VariantProps<typeof codeBlockHeader>,
    Pick<TabListProps, "buttons" | "previousButton" | "nextButton"> {}

/**
 * Names a strip scroll button "Previous tabs" or "Next tabs", like the buttons
 * of `TabList`, unless it has its own label.
 */
function getTabListButton(button: CarouselButtonRender, label: string) {
  if (button === false) return false;
  return createRender(CarouselButton, button === true ? {} : button, {
    "aria-label": label,
  });
}

/**
 * Renders file tabs as the strip above the code. Pass `defaultSelectedId` or
 * `selectedId` to the `CodeBlock`, and write a `CodeBlockPanel` for each file,
 * with the text to copy in its `copy` prop. Like `TabList`, a strip that
 * overflows scrolls sideways, fades its tabs at the ends, and shows "Previous
 * tabs" and "Next tabs" buttons with a fine pointer, outside the element with
 * the `tablist` role.
 * @example
 * <CodeBlock defaultSelectedId="toggle.tsx">
 *   <CodeBlockTabList aria-label="Files">
 *     <CodeBlockTab id="toggle.tsx">toggle.tsx</CodeBlockTab>
 *     <CodeBlockTab id="toggle.css" separator>
 *       toggle.css
 *     </CodeBlockTab>
 *   </CodeBlockTabList>
 *   <CodeBlockPanel tabId="toggle.tsx" html={tsx.html} copy={tsx.text} />
 *   <CodeBlockPanel tabId="toggle.css" html={css.html} copy={css.text} />
 * </CodeBlock>
 */
export function CodeBlockTabList({
  buttons = true,
  previousButton = true,
  nextButton = true,
  ref,
  ...props
}: CodeBlockTabListProps) {
  const [variantProps, rest] = splitProps(props, codeBlockHeader);
  // The carousel root holds the strip and the buttons beside it, takes the row
  // of the header in the block, and hides with the strip.
  return (
    <Carousel
      recipe={tabListCarousel}
      buttons={buttons}
      previousButton={getTabListButton(previousButton, "Previous tabs")}
      nextButton={getTabListButton(nextButton, "Next tabs")}
      hidden={rest.hidden}
    >
      <CarouselViewport
        ref={ref}
        recipe={codeBlockHeader}
        {...variantProps}
        render={<ak.TabList {...rest} />}
      />
    </Carousel>
  );
}

// Registers the text of a title or a file tab in the block, so the copy button
// of the code that it names can name it too.
function useLabel(id?: string, text?: string) {
  const setLabel = React.useContext(CodeBlockContext)?.setLabel;
  React.useEffect(() => {
    if (!setLabel) return;
    if (!id) return;
    if (text == null) return;
    setLabel(id, text);
    return () => setLabel(id);
  }, [setLabel, id, text]);
}

// The name of the file says what the icon shows, so screen readers skip it.
function renderIcon(icon: React.ReactNode) {
  if (!isRenderable(icon)) return null;
  return <TabSlot aria-hidden>{icon}</TabSlot>;
}

export interface CodeBlockTabProps
  extends ak.TabProps, VariantProps<typeof codeBlockTab> {
  /**
   * An icon before the file name, such as the logo of its language. It goes in
   * a tab slot, and screen readers skip it.
   */
  icon?: React.ReactNode;
  /**
   * A separator before the tab, as `true`, an element, or
   * `CodeBlockTabSeparator` props. It renders as a sibling of the tab, hidden
   * from assistive technologies. Pass `!!index` when mapping files to separate
   * each tab from the one before it.
   */
  separator?: boolean | React.ReactElement | CodeBlockTabSeparatorProps;
}

/**
 * Renders a folder tab for a file in a `CodeBlockTabList`. Text children go in
 * a label that truncates, after the `icon`.
 * @example
 * <CodeBlockTab id="toggle-tsx" icon={<ReactIcon />}>
 *   toggle.tsx
 * </CodeBlockTab>
 * @example
 * <CodeBlockTabList aria-label="Files">
 *   {files.map((file, index) => (
 *     <CodeBlockTab key={file.name} id={file.name} separator={!!index}>
 *       {file.name}
 *     </CodeBlockTab>
 *   ))}
 * </CodeBlockTabList>
 */
export function CodeBlockTab({
  id: idProp,
  icon,
  separator,
  children,
  ...props
}: CodeBlockTabProps) {
  const [variantProps, rest] = splitProps(props, codeBlockTab);
  // The panel of the tab names it with this id, and so does its copy button.
  const defaultId = React.useId();
  const id = idProp ?? defaultId;
  const text = getChildrenText(children);
  useLabel(id, text);
  const label = text == null ? children : <TabLabel text={text} />;
  return prependOptionalSeparator(
    CodeBlockTabSeparator,
    separator,
    <ak.Tab {...codeBlockTab.jsx(variantProps)} {...rest} id={id}>
      {renderIcon(icon)}
      {label}
    </ak.Tab>,
  );
}

export interface CodeBlockTabSeparatorProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof codeBlockTabSeparator> {}

/**
 * Renders a pipe between file tabs in a `CodeBlockTabList`. It hides next to
 * the selected, hovered, or focused tab, and screen readers skip it. Pass it,
 * or its props, to the `separator` prop of `CodeBlockTab` so it renders before
 * the tab.
 * @example
 * <CodeBlockTabList aria-label="Files">
 *   <CodeBlockTab id="toggle.tsx">toggle.tsx</CodeBlockTab>
 *   <CodeBlockTab
 *     id="toggle.css"
 *     separator={<CodeBlockTabSeparator $kind="slash" />}
 *   >
 *     toggle.css
 *   </CodeBlockTab>
 * </CodeBlockTabList>
 */
export function CodeBlockTabSeparator(props: CodeBlockTabSeparatorProps) {
  const [variantProps, rest] = splitProps(props, codeBlockTabSeparator);
  return (
    <div aria-hidden {...codeBlockTabSeparator.jsx(variantProps)} {...rest} />
  );
}

export interface CodeBlockTitleProps
  extends ak.RoleProps<"div">, VariantProps<typeof codeBlockTitle> {
  /**
   * An icon before the title, such as the logo of the language of the file. It
   * goes in a tab slot, and screen readers skip it.
   */
  icon?: React.ReactNode;
}

/**
 * Renders the title of a code block, such as a file name, as a selected folder
 * tab. It's not a tab, and it names the scroll area of the code in the same
 * block. Long titles are truncated, after the `icon`.
 * @example
 * <CodeBlockHeader>
 *   <CodeBlockTitle icon={<ReactIcon />}>counter.tsx</CodeBlockTitle>
 * </CodeBlockHeader>
 */
export function CodeBlockTitle({
  icon,
  children,
  ...props
}: CodeBlockTitleProps) {
  const context = React.useContext(CodeBlockContext);
  const [variantProps, rest] = splitProps(props, codeBlockTitle);
  const id = rest.id ?? context?.defaultTitleId;
  const setTitleId = context?.setTitleId;
  const text = getChildrenText(children);
  React.useEffect(() => {
    if (!setTitleId) return;
    setTitleId(id);
    return () => setTitleId(undefined);
  }, [setTitleId, id]);
  useLabel(id, text);
  return (
    <ak.Role.div
      {...codeBlockTitle.jsx(variantProps)}
      data-selected="true"
      {...rest}
      id={id}
    >
      {renderIcon(icon)}
      {/* Without data-text, the label keeps the normal weight of a tab. The
          title is the only tab, so it doesn't need a heavier weight. */}
      {text == null ? children : <span {...tabLabel.jsx()}>{text}</span>}
    </ak.Role.div>
  );
}

export interface CodeBlockCopyProps extends Omit<CopyButtonProps, "label"> {
  /**
   * The accessible name and the tooltip of the button, or a function that takes
   * the name of the code, such as for another language. The name is the text of
   * the title of the block, or of the tab of a panel, so each button on a page
   * has its own name.
   * @default (name) => (name ? `Copy ${name}` : "Copy code")
   */
  label?: string | ((name?: string) => string);
}

function getCopyLabel(name?: string) {
  if (!name) return "Copy code";
  return `Copy ${name}`;
}

/**
 * Renders a small `CopyButton` in a frame in the top end corner of the code.
 * The `copy` prop of `CodeBlockCode` and `CodeBlockPanel` renders it after the
 * code, so it follows the code in the tab order, and only the code that shows
 * has one. Its label names the title or the tab, such as "Copy counter.tsx".
 * Write it as a child of the block only to place it after other content. Its
 * frame covers the corner of the code.
 * @example
 * <CodeBlockPanel
 *   tabId="toggle.css"
 *   html={css.html}
 *   copy={{
 *     value: css.text,
 *     label: (name) => (name ? `Copiar ${name}` : "Copiar código"),
 *   }}
 * />
 */
export function CodeBlockCopy({
  label = getCopyLabel,
  ...props
}: CodeBlockCopyProps) {
  const context = React.useContext(CodeBlockContext);
  const codeName = React.useContext(CodeBlockCopyNameContext);
  // A button written as a child of the block names the title.
  const titleId = context?.titleId;
  const name = codeName ?? (titleId ? context?.labels.get(titleId) : undefined);
  const text = typeof label === "function" ? label(name) : label;
  return (
    <div {...codeBlockCopy.jsx()}>
      {/* The frame sets the text size and the padding of the button. */}
      <CopyButton
        label={text}
        $size="auto"
        $p="var(--code-block-copy-p)"
        {...props}
      />
    </div>
  );
}

// Text children replace the label, and the icon stays. Other children replace
// the whole content.
function renderButtonContent(
  children: React.ReactNode,
  label: string,
  icon: React.ReactNode,
) {
  const text = children == null ? label : getChildrenText(children);
  if (text == null) return children;
  return (
    <>
      <ButtonLabel>{text}</ButtonLabel>
      <ButtonSlot>{icon}</ButtonSlot>
    </>
  );
}

// The code that renders the button passes its id and line count. A button
// written as a child of the block gets them from the code that shows.
function useCodeInfo(context: CodeBlockContextValue | null) {
  const codeInfo = React.useContext(CodeBlockCodeContext);
  return codeInfo ?? context?.code;
}

function getExpandLabel(lineCount: number) {
  return `Show all ${lineCount} lines`;
}

export interface CodeBlockExpandProps extends Omit<ButtonProps, "recipe"> {
  /**
   * The text of the button, or a function that takes the line count of the
   * code, such as for another language. Text children replace it.
   * @default (lineCount) => `Show all ${lineCount} lines`
   */
  label?: string | ((lineCount: number) => string);
}

/**
 * Renders the button that shows all lines of collapsed code, over the clear
 * part at the bottom of the fade. A click anywhere on the collapsed code
 * presses it too. The block renders it for `maxLines`, so write it only with
 * `expand={false}`, as a child of the block after the code.
 * @example
 * <CodeBlock title="use-users.ts" maxLines={12} expand={false}>
 *   <CodeBlockCode html={code.html} />
 *   <CodeBlockExpand>Show the whole file</CodeBlockExpand>
 * </CodeBlock>
 */
export function CodeBlockExpand({
  ref,
  label = getExpandLabel,
  children,
  ...props
}: CodeBlockExpandProps) {
  const context = React.useContext(CodeBlockContext);
  const codeInfo = useCodeInfo(context);
  const mergedRef = useMergeRefs(context?.expandRef, ref);
  if (!context) return null;
  if (!codeInfo) return null;
  if (context.expanded) return null;
  const text = typeof label === "function" ? label(codeInfo.lineCount) : label;
  return (
    // The button is the way in for the keyboard and screen readers. A click on
    // the button, or a key press that activates it, comes here too.
    <div
      {...codeBlockExpand.jsx()}
      onClick={(event) => {
        if (event.defaultPrevented) return;
        context.toggleExpanded(true);
      }}
    >
      <Button
        aria-controls={codeInfo.id}
        aria-expanded={false}
        $size="sm"
        {...props}
        ref={mergedRef}
      >
        {renderButtonContent(children, text, <ChevronDownIcon />)}
      </Button>
    </div>
  );
}

export interface CodeBlockCollapseProps extends Omit<ButtonProps, "recipe"> {
  /**
   * The text of the button. Text children replace it.
   * @default "Show fewer lines"
   */
  label?: string;
}

/**
 * Renders the button that collapses expanded code, under the code. It's half a
 * step lighter than the page, like the code, with an edge. The block renders it
 * for `maxLines`, so write it only with `collapse={false}`, as a child of the
 * block after the code.
 * @example
 * <CodeBlock title="use-users.ts" maxLines={12} collapse={false}>
 *   <CodeBlockCode html={code.html} />
 *   <CodeBlockCollapse>Show the first lines</CodeBlockCollapse>
 * </CodeBlock>
 */
export function CodeBlockCollapse({
  ref,
  label = "Show fewer lines",
  onClick,
  children,
  ...props
}: CodeBlockCollapseProps) {
  const context = React.useContext(CodeBlockContext);
  const codeInfo = useCodeInfo(context);
  const mergedRef = useMergeRefs(context?.collapseRef, ref);
  if (!context) return null;
  if (!codeInfo) return null;
  if (!context.expanded) return null;
  return (
    <div {...codeBlockCollapse.jsx()}>
      <Button
        aria-controls={codeInfo.id}
        aria-expanded
        $size="sm"
        $lighten={0.5}
        $border
        {...props}
        ref={mergedRef}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          context.toggleExpanded(false);
        }}
      >
        {renderButtonContent(children, label, <ChevronUpIcon />)}
      </Button>
    </div>
  );
}

export interface CodeBlockCodeProps
  extends ak.RoleProps<"pre">, VariantProps<typeof codeBlockCode> {
  /**
   * The HTML of the lines, such as the `html` of `highlight`. It renders as is,
   * so it must come from a trusted highlighter that escapes the code, as Shiki
   * does. Without it, text children render as plain lines with the same layout,
   * such as while the code loads or when it can't be highlighted.
   */
  html?: string;
  /**
   * A copy button in the top end corner of the code, as the text to copy, an
   * element, or `CodeBlockCopy` props. The text is the `value` of the button,
   * such as the `text` of `highlight`. The default label names the title of the
   * block or the tab of the panel, such as "Copy counter.tsx", or is "Copy
   * code" without one. Only the code that shows renders it.
   */
  copy?: string | React.ReactElement | CodeBlockCopyProps;
}

function countLines(html: string) {
  // Shiki puts a line feed between lines and escapes none inside them.
  let count = 1;
  for (const char of html) {
    if (char === "\n") {
      count++;
    }
  }
  return count;
}

function getLineCount(html: string | undefined, children: React.ReactNode) {
  if (html != null) return countLines(html);
  if (typeof children === "string") return children.split("\n").length;
  // A skeleton has the lines of the code that loads, so the line numbers and
  // the buttons stay the same when the code arrives.
  if (
    React.isValidElement<CodeBlockSkeletonProps>(children) &&
    children.type === CodeBlockSkeleton
  ) {
    return children.props.lines;
  }
  return;
}

// Scrollable code is a tab stop. Collapsed code is not one, even in the server
// HTML before it becomes inert. The expand button moves the focus to the code,
// so code that wraps takes the focus when it can collapse, but it's not a tab
// stop either.
function getCodeTabIndex(
  scrollable: boolean,
  collapsible: boolean,
  collapsed: boolean,
) {
  if (collapsed) return -1;
  if (scrollable) return 0;
  if (collapsible) return -1;
  return;
}

function renderPlainLines(children: React.ReactNode) {
  if (typeof children !== "string") return children;
  // The same markup as highlighted lines, so the padding, the line numbers, and
  // the height stay the same when the highlighted HTML replaces it.
  return children.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {index > 0 && "\n"}
      <span className="line">{line}</span>
    </React.Fragment>
  ));
}

/**
 * Renders the code in a scroll area. A scroll area is a tab stop, so keyboard
 * users can scroll long lines, and the title of the block names it. With
 * `$wrap`, lines wrap instead, and the area is not a tab stop. For file tabs,
 * use `CodeBlockPanel`, which renders it as a tab panel. `copy` renders a copy
 * button after the code. When the block has `maxLines`, the code collapses and
 * renders the expand and collapse buttons after itself, before the copy button.
 * @example
 * <CodeBlockCode html={code.html} copy={code.text} $lineNumbers />
 */
export function CodeBlockCode({
  ref,
  id: idProp,
  html,
  copy,
  children,
  ...props
}: CodeBlockCodeProps) {
  const context = React.useContext(CodeBlockContext);
  const [variantProps, rest] = splitProps(props, codeBlockCode);
  const scrollable = !variantProps.$wrap;
  const lineCount = getLineCount(html, children);
  const blockMaxLines = context?.maxLines;
  // A file in tabs with fewer lines than the block shows has no buttons.
  const collapsible =
    blockMaxLines != null && lineCount != null && lineCount > blockMaxLines;
  const collapsed = collapsible && !context?.expanded;
  // Only the code that shows renders the buttons, not hidden tab panels.
  const shows = !rest.hidden;
  const showsButtons = collapsible && shows;
  const generatedId = React.useId();
  const id = idProp ?? (collapsible ? generatedId : undefined);
  const codeInfo = React.useMemo(
    () => (id && lineCount != null ? { id, lineCount } : null),
    [id, lineCount],
  );
  const elementRef = React.useRef<HTMLPreElement>(null);
  const mergedRef = useMergeRefs(
    elementRef,
    ref,
    showsButtons ? context?.codeRef : undefined,
  );
  const maxLines = variantProps.$maxLines ?? (collapsed ? blockMaxLines : null);
  // $maxLines shows the first lines, and the fade follows them. Code that
  // scrolled down while all lines showed would keep its scroll position, with
  // other lines in view and the fade out of place.
  useSafeLayoutEffect(() => {
    if (maxLines == null) return;
    const element = elementRef.current;
    if (!element) return;
    element.scrollTop = 0;
  }, [maxLines]);
  // Collapsed code is inert, so the tab order and screen readers skip it. The
  // expand button is the way in. The property works in React 18 too, which has
  // no inert prop.
  useSafeLayoutEffect(() => {
    if (!collapsed) return;
    const element = elementRef.current;
    if (!element) return;
    element.inert = true;
    return () => {
      element.inert = false;
    };
  }, [collapsed]);
  const setCode = context?.setCode;
  // Buttons written as children of the block need the id and the line count of
  // the code that shows.
  useSafeLayoutEffect(() => {
    if (!showsButtons) return;
    if (!codeInfo) return;
    if (!setCode) return;
    setCode(codeInfo);
    return () => setCode(undefined);
  }, [showsButtons, codeInfo, setCode]);
  const titleId = context?.titleId;
  // A region needs a name: the title of the block, or a label of its own.
  const named = !!(titleId || rest["aria-label"] || rest["aria-labelledby"]);
  // The copy button names the text that names the code: the tab of a panel or
  // the title of the block. Text is the value to copy, not the content of the
  // button.
  const nameId = rest["aria-labelledby"] ?? titleId;
  const name = nameId ? context?.labels.get(nameId) : undefined;
  const copyElement =
    shows &&
    createOptionalRender(
      CodeBlockCopy,
      typeof copy === "string" ? { value: copy } : copy,
    );
  // Line numbers take the width of the largest number, which is the line count.
  const lineNumbers =
    variantProps.$lineNumbers === true && lineCount != null
      ? lineCount
      : variantProps.$lineNumbers;
  const codeElement = (
    <ak.Role.pre
      dir="ltr"
      tabIndex={getCodeTabIndex(scrollable, collapsible, collapsed)}
      {...(scrollable && named && { role: "region" })}
      {...(scrollable && titleId && { "aria-labelledby": titleId })}
      {...codeBlockCode.jsx({
        ...variantProps,
        $lineNumbers: lineNumbers,
        $maxLines: maxLines ?? undefined,
      })}
      {...rest}
      id={id}
      ref={mergedRef}
    >
      {html != null ? (
        <code dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <code>{renderPlainLines(children)}</code>
      )}
    </ak.Role.pre>
  );
  // The same shape in every state, so the code keeps its element, its scroll
  // position, and the focus when the buttons come and go. The copy button shows
  // over the code, but it comes last in the tab order.
  return (
    <>
      {codeElement}
      {showsButtons && codeInfo && (
        <CodeBlockCodeContext.Provider value={codeInfo}>
          {context?.expandElement}
          {context?.collapseElement}
        </CodeBlockCodeContext.Provider>
      )}
      {copyElement && (
        <CodeBlockCopyNameContext.Provider value={name}>
          {copyElement}
        </CodeBlockCopyNameContext.Provider>
      )}
    </>
  );
}

export interface CodeBlockPanelProps
  extends
    Omit<TabPanelProps, "render">,
    Pick<CodeBlockCodeProps, "html" | "copy">,
    VariantProps<typeof codeBlockCode> {}

/**
 * Renders the code of a file tab as a `CodeBlockCode`, which is the panel of
 * the tab. The panel is the scroll area of the file, and it takes the tab stop
 * and the name of its tab. `copy` renders a copy button that names the tab,
 * such as "Copy toggle.tsx", while the panel shows. Set `single` for one panel
 * that follows the selected tab, such as when the tabs are views of the same
 * code.
 * @example
 * <CodeBlockPanel tabId="toggle.tsx" html={tsx.html} copy={tsx.text} />
 * @example
 * <CodeBlockPanel single html={selected.html} copy={selected.text} $prompt />
 */
export function CodeBlockPanel(props: CodeBlockPanelProps) {
  // The tab panel passes its own props and the props of the code, such as html,
  // copy, and $lineNumbers, to the code it renders.
  return <TabPanel {...props} render={<CodeBlockCode />} />;
}

type CodeBlockSkeletonTokenKind = NonNullable<
  VariantProps<typeof codeBlockSkeletonToken>["$token"]
>;

function getTokenKind(letter: string): CodeBlockSkeletonTokenKind {
  if (letter === "k") return "keyword";
  if (letter === "f") return "function";
  if (letter === "s") return "string";
  if (letter === "c") return "constant";
  return "text";
}

function parseSkeletonLine(shape: string) {
  const code = shape.trimStart();
  const tokens = code
    ? code.split(" ").map((token) => ({
        kind: getTokenKind(token.charAt(0)),
        length: Number.parseInt(token.slice(1), 10),
      }))
    : [];
  return { indent: shape.length - code.length, tokens };
}

// The shape of a short component: two imports, a function with a state hook,
// and the markup that it returns. Each line is an indent and tokens. A token is
// its kind and its length in characters: k for a keyword, f for a function, s
// for a string, c for a constant, and t for other text. Tokens are at least two
// characters long, because a shorter one looks like a dot, not code. Longer
// code repeats the shape.
const SKELETON_LINES = [
  "k6 t12 k4 s8",
  "k6 t10 k4 s15",
  "",
  "k6 k8 f7 t3",
  "  k5 c18 f11",
  "  k5 c5 s16",
  "",
  "  k6 t2",
  "    f7 c7 t20",
  "      t7",
  "    f9",
  "  t2",
  "t2",
  "",
].map(parseSkeletonLine);

function renderSkeletonLine(index: number) {
  const line = SKELETON_LINES[index % SKELETON_LINES.length];
  if (!line?.tokens.length) return null;
  return (
    <>
      {" ".repeat(line.indent)}
      <span>
        {line.tokens.map((token, tokenIndex) => (
          <SkeletonLine
            key={tokenIndex}
            {...codeBlockSkeletonToken.jsx({
              $token: token.kind,
              $length: token.length,
            })}
          />
        ))}
      </span>
    </>
  );
}

export interface CodeBlockSkeletonProps extends Omit<
  SkeletonProps,
  "render" | "children" | "loading"
> {
  /**
   * The number of lines, such as the line count of the code that loads, so the
   * code takes the same height when it arrives.
   */
  lines: number;
}

/**
 * Renders placeholder lines in the shapes and the colors of highlighted code,
 * as the children of a `CodeBlockCode` or a `CodeBlockPanel` whose code loads.
 * The code then keeps its line numbers and its buttons. Add `aria-busy` to the
 * code, and a status message, while it loads.
 * @example
 * <CodeBlockPanel tabId="toggle.css" aria-busy>
 *   <CodeBlockSkeleton lines={file.lines} />
 * </CodeBlockPanel>
 */
export function CodeBlockSkeleton({ lines, ...props }: CodeBlockSkeletonProps) {
  return (
    <Skeleton {...props} render={<span {...codeBlockSkeleton.jsx()} />}>
      {Array.from({ length: lines }, (_, index) => (
        <React.Fragment key={index}>
          {index > 0 && "\n"}
          <span className="line">{renderSkeletonLine(index)}</span>
        </React.Fragment>
      ))}
    </Skeleton>
  );
}
