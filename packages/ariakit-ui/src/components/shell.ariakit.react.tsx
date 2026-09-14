import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { PanelLeftIcon } from "lucide-react";
import * as React from "react";
import {
  createOptionalRender,
  createRender,
} from "../react-utils/create-render.react.ts";
import {
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
 * const navigation = useDisclosureStore({ defaultOpen: true });
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
  return <ak.Role.div {...recipe.jsx(variantProps)} {...rest} />;
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
  return (
    <ak.Role.header {...shellHeader.jsx(variantProps)} {...rest}>
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
  return (
    <ak.Role.footer {...shellFooter.jsx(variantProps)} {...rest}>
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
  return <ak.Role.main {...shellMain.jsx(variantProps)} {...rest} />;
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
 * The body of a sidebar: the element that scrolls and sticks below the header.
 * `ShellSidebar` renders one; the `body` prop customizes it.
 */
export function ShellSidebarBody(props: ShellSidebarBodyProps) {
  const [variantProps, rest] = splitProps(props, shellSidebarBody);
  return <div {...shellSidebarBody.jsx(variantProps)} {...rest} />;
}

export interface ShellSidebarProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellSidebar> {
  /**
   * The store that owns the open state: a disclosure store, or a dialog store,
   * which is one. It defaults to the store of the nearest `DialogProvider` or
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
 * A side panel of a shell: a column that folds with a drawer motion. A closed
 * sidebar takes no space and is out of the tab order and the accessibility tree
 * once its motion ends. The column is the content its toggle controls; `render`
 * sets its element, `nav` for a primary navigation or `aside` for a
 * complementary panel, and `aria-label` names the landmark.
 *
 * Two toggles sharing one store: only the last one used reports the state,
 * while the other keeps `aria-expanded="false"`, so a shell with both a header
 * toggle and a rail toggle drives that attribute itself.
 * @example
 * <DisclosureProvider defaultOpen>
 *   <ShellHeader start={<ShellSidebarToggle />} />
 *   <ShellSidebar aria-label="Main" render={<nav />}>
 *     …
 *   </ShellSidebar>
 * </DisclosureProvider>
 */
export function ShellSidebar({
  store: storeProp,
  open,
  defaultOpen,
  onOpenChange,
  body,
  children,
  ...props
}: ShellSidebarProps) {
  const context = ak.useDisclosureContext();
  const providedStore = storeProp ?? context;
  // A store from a prop or a provider can still be controlled through `open`,
  // as Ariakit's own Dialog is, but it is created elsewhere, so the sidebar's
  // own default of open applies only to a store of its own. An explicit
  // `defaultOpen` reaches Ariakit with either store, and Ariakit throws on the
  // conflict in development.
  const store = ak.useDisclosureStore({
    store: providedStore,
    open,
    setOpen: onOpenChange,
    defaultOpen: defaultOpen ?? (providedStore ? undefined : true),
  });
  const [variantProps, rest] = splitProps(props, shellSidebar);
  const bodyElement = createRender(ShellSidebarBody, body);
  return (
    <ak.DisclosureContent
      store={store}
      // Never display: none. The column folds on a transition and hides its
      // content through visibility once the motion ends, so the content stays
      // in the DOM in both states.
      hidden={false}
      {...shellSidebar.jsx(variantProps)}
      {...rest}
    >
      <ak.Role.div render={bodyElement}>{children}</ak.Role.div>
    </ak.DisclosureContent>
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
