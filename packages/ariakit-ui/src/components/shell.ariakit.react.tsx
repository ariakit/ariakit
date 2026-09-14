import * as ak from "@ariakit/react";
import { useMergeRefs, useSafeLayoutEffect } from "@ariakit/react-utils";
import { getWindow } from "@ariakit/utils";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { PanelLeftIcon } from "lucide-react";
import * as React from "react";
import {
  createOptionalRender,
  createRender,
} from "../react-utils/create-render.react.ts";
import {
  getShellBlurStep,
  shell,
  shellBleed,
  shellFooter,
  shellFooterCenter,
  shellFooterEnd,
  shellFooterStart,
  shellHeader,
  shellHeaderCenter,
  shellHeaderEnd,
  shellHeaderStart,
  shellMain,
  shellSidebar,
  shellSidebarBackdrop,
  shellSidebarBody,
  shellSidebarToggle,
} from "../styles/shell.ts";
import { ButtonSlot } from "./button.ariakit.react.tsx";

export interface ShellProps
  extends ak.RoleProps<"div">, VariantProps<typeof shell> {}

/**
 * Assembles a header, up to two sidebars per side, a main area and a footer
 * from optional parts, in one CSS grid. The root declares the geometry once and
 * every part reads it. Parts must be direct children and place themselves by
 * kind and side, so DOM order is free for reading order. A nested shell takes
 * the main cell of the shell around it.
 * @example
 * const navigation = useDialogStore({ defaultOpen: true });
 * <Shell $startWidth={64} $endWidth={48}>
 *   <ShellHeader
 *     start={<ShellSidebarToggle store={navigation} />}
 *     center="Title"
 *   />
 *   <ShellSidebar store={navigation} aria-label="Documentation" render={<nav />}>
 *     …
 *   </ShellSidebar>
 *   <ShellMain $centered>…</ShellMain>
 *   <ShellSidebar $side="end" aria-label="On this page" render={<aside />}>
 *     …
 *   </ShellSidebar>
 *   <ShellFooter />
 * </Shell>
 */
export function Shell(props: ShellProps) {
  const [variantProps, rest] = splitProps(props, shell);
  return <ak.Role.div {...shell.jsx(variantProps)} {...rest} />;
}

export interface ShellHeaderPartProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellHeaderStart> {}

// The three part recipes declare the same variants, so one of them types all of
// them.
type BarPartRecipe = typeof shellHeaderStart;

/**
 * Renders a bar part from its recipe. The header and the footer parts differ
 * only in their names, which the bar props and the reference keep apart.
 */
function renderPartCell(recipe: BarPartRecipe, props: ShellHeaderPartProps) {
  const [variantProps, rest] = splitProps(props, recipe);
  const variants = recipe.getVariants(variantProps);
  return (
    <ak.Role.div
      data-shrink={variants.$shrink || undefined}
      data-grow={variants.$grow || undefined}
      {...recipe.jsx(variantProps)}
      {...rest}
    />
  );
}

/**
 * The start part of a bar: a flex cell at the bar's start edge that keeps its
 * content minimum unless it says it can shrink.
 */
export function ShellHeaderStart(props: ShellHeaderPartProps) {
  return renderPartCell(shellHeaderStart, props);
}

/**
 * The center part of a bar: a flex cell on the bar's middle while both sides
 * fit, moved over when a side needs more than its half.
 */
export function ShellHeaderCenter(props: ShellHeaderPartProps) {
  return renderPartCell(shellHeaderCenter, props);
}

/**
 * The end part of a bar: a flex cell at the bar's end edge that keeps its
 * content minimum unless it says it can shrink.
 */
export function ShellHeaderEnd(props: ShellHeaderPartProps) {
  return renderPartCell(shellHeaderEnd, props);
}

/**
 * The three parts of a bar. Each takes its content, the part's props, or an
 * element of the part component with its own variants: `ShellHeaderStart` and
 * the others in a header, `ShellFooterStart` and the others in a footer.
 */
export interface ShellBarPartsProps {
  /**
   * The start part: its content, part props, or a part element.
   */
  start?: React.ReactNode | ShellHeaderPartProps;
  /**
   * The center part: its content, part props, or a part element.
   */
  center?: React.ReactNode | ShellHeaderPartProps;
  /**
   * The end part: its content, part props, or a part element.
   */
  end?: React.ReactNode | ShellHeaderPartProps;
}

type BarPart = React.ElementType<ShellHeaderPartProps>;

/**
 * Renders a bar part from its prop. Only an element of a part component is the
 * part itself; any other element, like a fragment or a link, is content that
 * needs the part around it to take its grid cell.
 */
function renderBarPart(
  Part: BarPart,
  value?: React.ReactNode | ShellHeaderPartProps,
) {
  const isElement = React.isValidElement(value);
  const isPart =
    isElement && typeof value.type === "function" && BAR_PARTS.has(value.type);
  return createOptionalRender(
    Part,
    isElement && !isPart ? { children: value } : value,
  );
}

export interface ShellHeaderProps
  extends
    ak.RoleProps<"header">,
    VariantProps<typeof shellHeader>,
    ShellBarPartsProps {}

/**
 * The top bar of a shell, sticky by default, as tall as its height token. Its
 * three parts sit at the start, on the middle and at the end.
 *
 * A popover, menu or combobox list rendered in place inside the bar lives in
 * the bar's stacking context and can be painted over by a later part, so
 * overlays inside chrome should use `portal`; a portalled element leaves the
 * shell's subtree and no longer inherits the shell's tokens.
 * @example
 * <ShellHeader
 *   $blur
 *   start={<><ShellSidebarToggle store={navigation} /><Logo /></>}
 *   center={<ShellHeaderCenter $grow><Search /></ShellHeaderCenter>}
 *   end={<ShellHeaderEnd $shrink><UserMenu /></ShellHeaderEnd>}
 * />
 */
export function ShellHeader({
  start,
  center,
  end,
  children,
  ...props
}: ShellHeaderProps) {
  const [variantProps, rest] = splitProps(props, shellHeader);
  const variants = shellHeader.getVariants(variantProps);
  return (
    <ak.Role.header
      data-sticky={variants.$sticky || undefined}
      data-blur={getShellBlurStep(variants.$blur)}
      data-stack-center={variants.$stackCenter || undefined}
      {...shellHeader.jsx(variantProps)}
      {...rest}
    >
      {renderBarPart(ShellHeaderStart, start)}
      {renderBarPart(ShellHeaderCenter, center)}
      {renderBarPart(ShellHeaderEnd, end)}
      {children}
    </ak.Role.header>
  );
}

export interface ShellFooterProps
  extends
    ak.RoleProps<"footer">,
    VariantProps<typeof shellFooter>,
    ShellBarPartsProps {}

/**
 * The bottom bar of a shell. It is always static and as tall as its content,
 * and a sticky sidebar body ends above it at the end of the page. It has no
 * `$sticky` variant.
 */
export function ShellFooter({
  start,
  center,
  end,
  children,
  ...props
}: ShellFooterProps) {
  const [variantProps, rest] = splitProps(props, shellFooter);
  const variants = shellFooter.getVariants(variantProps);
  return (
    <ak.Role.footer
      data-blur={getShellBlurStep(variants.$blur)}
      {...shellFooter.jsx(variantProps)}
      {...rest}
    >
      {renderBarPart(ShellFooterStart, start)}
      {renderBarPart(ShellFooterCenter, center)}
      {renderBarPart(ShellFooterEnd, end)}
      {children}
    </ak.Role.footer>
  );
}

// The components a bar prop can name as the part itself. Function declarations,
// so the set can be built before the bars render.
const BAR_PARTS = new Set<React.ElementType>([
  ShellHeaderStart,
  ShellHeaderCenter,
  ShellHeaderEnd,
  ShellFooterStart,
  ShellFooterCenter,
  ShellFooterEnd,
]);

/**
 * The start part of a footer: the same cell as `ShellHeaderStart`, under the
 * footer's name.
 */
export function ShellFooterStart(props: ShellHeaderPartProps) {
  return renderPartCell(shellFooterStart, props);
}

/**
 * The center part of a footer: the same cell as `ShellHeaderCenter`, under the
 * footer's name.
 */
export function ShellFooterCenter(props: ShellHeaderPartProps) {
  return renderPartCell(shellFooterCenter, props);
}

/**
 * The end part of a footer: the same cell as `ShellHeaderEnd`, under the
 * footer's name.
 */
export function ShellFooterEnd(props: ShellHeaderPartProps) {
  return renderPartCell(shellFooterEnd, props);
}

export interface ShellMainProps
  extends ak.RoleProps<"main">, VariantProps<typeof shellMain> {}

/**
 * The main area of a shell. Its content reacts to the width main has through
 * the `shell-main` container, and with `$centered` its content column stays on
 * the shell's center whatever the sidebars are doing. Every direct child is a
 * grid item, so margins do not collapse: use `Prose` as the text container. A
 * fragment link inside lands below a sticky header. The page-level scroll port
 * is outside the shell, so to keep a focused control out from under the header
 * as well, copy the header height onto it, for example
 * `html { scroll-padding-block-start: 3.25rem }`. That padding adds to the
 * margin an anchor already keeps below the header.
 */
export function ShellMain(props: ShellMainProps) {
  const [variantProps, rest] = splitProps(props, shellMain);
  const variants = shellMain.getVariants(variantProps);
  return (
    <ak.Role.main
      data-centered={variants.$centered || undefined}
      {...shellMain.jsx(variantProps)}
      {...rest}
    />
  );
}

export interface ShellBleedProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellBleed> {}

/**
 * A direct child of main that spans its gutters, for a full-width band inside a
 * centered main. Anywhere else it keeps its content size. `Frame` does the same
 * with `$bleed`.
 */
export function ShellBleed(props: ShellBleedProps) {
  const [variantProps, rest] = splitProps(props, shellBleed);
  return <ak.Role.div {...shellBleed.jsx(variantProps)} {...rest} />;
}

export interface ShellSidebarBodyProps
  extends React.ComponentProps<"div">, VariantProps<typeof shellSidebarBody> {}

/**
 * The body of a sidebar: the element that scrolls, sticks below the header and
 * becomes the dialog in overlay mode. `ShellSidebar` renders one; the `body`
 * prop customizes it.
 */
export function ShellSidebarBody(props: ShellSidebarBodyProps) {
  const [variantProps, rest] = splitProps(props, shellSidebarBody);
  return <div {...shellSidebarBody.jsx(variantProps)} {...rest} />;
}

export interface ShellSidebarBackdropProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof shellSidebarBackdrop> {}

/**
 * The backdrop of an overlay sidebar. `ShellSidebar` renders one through the
 * dialog's `backdrop` prop, so a click on it closes the drawer.
 */
export function ShellSidebarBackdrop(props: ShellSidebarBackdropProps) {
  const [variantProps, rest] = splitProps(props, shellSidebarBackdrop);
  const { style, ...jsx } = shellSidebarBackdrop.jsx(variantProps);
  return (
    <div
      {...jsx}
      {...rest}
      // Ariakit writes a fixed position on the dialog backdrop inline, and the
      // backdrop must cover the shell rather than the window.
      style={{ ...style, position: "absolute" }}
    />
  );
}

/**
 * Reads whether CSS has put the column in overlay mode: the column's
 * `--shell-overlay` flag, from the `$overlay` variant or the `$overlayBelow`
 * container query. Read once the column mounts and again whenever the column or
 * its parent, the shell root when the sidebar is a direct child, resizes;
 * observing the column catches a root font-size change. No breakpoint is
 * duplicated in JavaScript, so the component cannot disagree with the
 * stylesheet.
 */
function useOverlayFlag(column: HTMLElement | null) {
  const [overlay, setOverlay] = React.useState(false);
  useSafeLayoutEffect(() => {
    if (!column) return;
    const win = getWindow(column);
    const update = () => {
      const value = win
        .getComputedStyle(column)
        .getPropertyValue("--shell-overlay");
      setOverlay(value.trim() === "1");
    };
    update();
    const observer = new win.ResizeObserver(update);
    observer.observe(column);
    if (column.parentElement) {
      observer.observe(column.parentElement);
    }
    return () => observer.disconnect();
  }, [column]);
  return overlay;
}

export interface ShellSidebarProps
  extends
    ak.RoleProps<"div">,
    Pick<ak.DialogProps, "modal">,
    VariantProps<typeof shellSidebar> {
  /**
   * The store that owns the open state, a dialog or a disclosure store. It
   * defaults to the store of the nearest `DialogProvider` or
   * `DisclosureProvider`. Without a store, the sidebar backs its own with the
   * `open`, `defaultOpen` and `onOpenChange` props, open by default.
   */
  store?: ak.DisclosureStore;
  /**
   * Whether the sidebar is open. It also controls a store from a `store` prop
   * or a provider, as Ariakit's own Dialog does.
   */
  open?: boolean;
  /**
   * Whether the sidebar starts open, when the sidebar owns its own state.
   * Defaults to `true`. With a store from a `store` prop or a provider, pass
   * the default to that store instead: Ariakit throws on the conflict in
   * development.
   */
  defaultOpen?: boolean;
  /**
   * Called when the open state changes, including for a store from a `store`
   * prop or a provider.
   */
  onOpenChange?: (open: boolean) => void;
  /** Custom body element or props to render a `ShellSidebarBody`. */
  body?: React.ReactElement | ShellSidebarBodyProps;
}

/**
 * A side panel of a shell. It folds with a drawer motion, and in overlay mode
 * (`$overlay`, or `$overlayBelow` when the shell is narrower than a step) it
 * floats over main as a modal dialog with a backdrop, from the same element and
 * the same state. A closed sidebar takes no space and is out of the tab order
 * and the accessibility tree once its motion ends.
 *
 * The column renders a `div`. `render` sets the landmark element around the
 * content inside the body, `nav` for a primary navigation or `aside` for a
 * complementary panel, and `aria-label` names it, and names the dialog in
 * overlay mode. Before hydration the overlay renders from CSS alone, with
 * nothing inert; modality arrives with JavaScript.
 *
 * Two toggles sharing one store: only the last one used owns the focus return
 * while the other keeps `aria-expanded="false"`, so a shell with both a header
 * toggle and a rail toggle drives that attribute itself.
 * @example
 * <DialogProvider defaultOpen>
 *   <ShellHeader start={<ShellSidebarToggle />} />
 *   <ShellSidebar $overlayBelow="md" aria-label="Main" render={<nav />}>
 *     …
 *   </ShellSidebar>
 * </DialogProvider>
 */
export function ShellSidebar({
  store: storeProp,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  body,
  render,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ShellSidebarProps) {
  const context = ak.useDisclosureContext();
  const providedStore = storeProp ?? context;
  // A dialog store in every case: the same store drives the dialog the body
  // becomes in overlay mode. A store from a prop or a provider can still be
  // controlled through `open`, as Ariakit's own Dialog is, but it is created
  // elsewhere, so the sidebar's own default of open applies only to a store of
  // its own. An explicit `defaultOpen` reaches Ariakit with either store, and
  // Ariakit throws on the conflict in development.
  const store = ak.useDialogStore({
    store: providedStore,
    open,
    setOpen: onOpenChange,
    defaultOpen: defaultOpen ?? (providedStore ? undefined : true),
  });
  const isOpen = ak.useStoreState(store, "open");
  const [column, setColumn] = React.useState<HTMLDivElement | null>(null);
  const overlay = useOverlayFlag(column);
  const isDialog = overlay && modal;

  const [variantProps, rest] = splitProps(props, shellSidebar);
  const variants = shellSidebar.getVariants(variantProps);
  const bodyElement = createRender(ShellSidebarBody, body);
  const overlayBelow =
    variants.$overlayBelow === "none" ? undefined : variants.$overlayBelow;

  return (
    <ak.Role.div
      data-side={variants.$side}
      data-open={isOpen || undefined}
      data-sticky={variants.$sticky || undefined}
      data-overlay={variants.$overlay || undefined}
      data-overlay-below={overlayBelow}
      {...shellSidebar.jsx(variantProps)}
      {...rest}
      ref={useMergeRefs(setColumn, rest.ref)}
    >
      <ak.Dialog
        store={store}
        // In place in both modes: the body slides inside its column.
        portal={false}
        modal={isDialog}
        role={isDialog ? "dialog" : "none"}
        aria-label={isDialog ? ariaLabel : undefined}
        aria-labelledby={isDialog ? ariaLabelledBy : undefined}
        // The body is never display: none, so a state change transitions and
        // its content leaves the tab order through visibility once the motion
        // ends. Ariakit reads the same flag to lock body scroll, so the lock
        // follows the open state explicitly.
        hidden={false}
        preventBodyScroll={isDialog && isOpen}
        // Ariakit's backdrop prop is what makes a click on it close the dialog;
        // a plain sibling does not. A panel that is never modal has no
        // backdrop: one that closes nothing would only block the page behind
        // it.
        backdrop={modal ? <ShellSidebarBackdrop /> : false}
        hideOnEscape={isDialog}
        hideOnInteractOutside={isDialog}
        // A callback rather than the flag: Ariakit moves focus in when the flag
        // turns on, so a plain boolean would steal focus when the shell narrows
        // past the step with the sidebar already open, or on the first paint of
        // a narrow page. Focus moves in only when the drawer opens.
        autoFocusOnShow={() => isDialog}
        autoFocusOnHide={isDialog}
        focusable={isDialog}
        render={bodyElement}
      >
        <ak.Role.div
          render={render}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
        >
          {children}
        </ak.Role.div>
      </ak.Dialog>
    </ak.Role.div>
  );
}

export interface ShellSidebarToggleProps
  extends ak.DisclosureProps, VariantProps<typeof shellSidebarToggle> {}

/**
 * Opens and closes a sidebar through its store, from a `store` prop or the
 * nearest `DialogProvider` or `DisclosureProvider`. With no children, or only
 * nullish or boolean ones such as a conditional label that is off, it renders a
 * square icon button named "Toggle sidebar".
 */
export function ShellSidebarToggle({
  children,
  ...props
}: ShellSidebarToggleProps) {
  const [variantProps, rest] = splitProps(props, shellSidebarToggle);
  // Nothing to render means the icon and the default name: no children, or only
  // nullish or boolean ones, alone or in a list from conditional labels.
  const iconOnly = React.Children.toArray(children).length === 0;
  const fallbackLabel = iconOnly ? "Toggle sidebar" : undefined;
  return (
    <ak.Disclosure
      {...shellSidebarToggle.jsx(variantProps)}
      {...rest}
      // Set after the spread, so a label prop that is present but undefined
      // keeps the fallback.
      aria-label={rest["aria-label"] ?? fallbackLabel}
    >
      {iconOnly ? (
        <ButtonSlot>
          <PanelLeftIcon />
        </ButtonSlot>
      ) : (
        children
      )}
    </ak.Disclosure>
  );
}
