import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import { createOptionalRender } from "../react-utils/create-render.react.ts";
import {
  shell,
  shellBreakout,
  shellFooter,
  shellFooterCenter,
  shellFooterEnd,
  shellFooterStart,
  shellHeader,
  shellHeaderCenter,
  shellHeaderEnd,
  shellHeaderStart,
  shellMainIntro,
  shellMain,
  shellMainBody,
  shellMainHeader,
  shellSidebar,
  shellSidebarPanel,
  shellSidebarHeader,
  shellSidebarBody,
  shellSidebarFooter,
} from "../styles/shell.ts";

export interface ShellProps
  extends ak.RoleProps<"div">, VariantProps<typeof shell> {}

/**
 * Assembles a header, up to two sidebars per side, a main area and a footer
 * from optional parts, in one CSS grid. Each sidebar declares its width and the
 * header declares its height. Parts must be direct children and place
 * themselves by kind and side, so DOM order is free for reading order. A nested
 * shell takes the main cell of the shell around it.
 * @example
 * const [open, setOpen] = useState(true);
 * const sidebarId = useId();
 * <Shell>
 *   <ShellHeader
 *     start={
 *       <Button
 *         className="@max-3xl/shell:hidden"
 *         aria-expanded={open}
 *         aria-controls={sidebarId}
 *         onClick={() => setOpen(!open)}
 *       >
 *         Navigation
 *       </Button>
 *     }
 *     center="Title"
 *   />
 *   <ShellSidebar
 *     id={sidebarId}
 *     open={open}
 *     aria-label="Documentation"
 *     render={<nav />}
 *   >
 *     <ShellSidebarBody>…</ShellSidebarBody>
 *   </ShellSidebar>
 *   <ShellMain>
 *     <ShellMainHeader $centered>…</ShellMainHeader>
 *     <ShellMainIntro $centered>…</ShellMainIntro>
 *     <ShellMainBody $centered>…</ShellMainBody>
 *   </ShellMain>
 *   <ShellSidebar
 *     $side="end"
 *     $width="sm"
 *     $from="body"
 *     aria-label="On this page"
 *     render={<aside />}
 *   >
 *     <ShellSidebarBody>…</ShellSidebarBody>
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
 *   start={<Logo />}
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

export interface ShellMainIntroProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellMainIntro> {}

/**
 * An introduction inside `ShellMain`, before `ShellMainBody`. Its content
 * aligns with the body, and its surface spans the adjacent end columns whose
 * sidebars start at the body. Use `$centered` to center its content.
 */
export function ShellMainIntro(props: ShellMainIntroProps) {
  const [variantProps, rest] = splitProps(props, shellMainIntro);
  return <ak.Role.div {...shellMainIntro.jsx(variantProps)} {...rest} />;
}

export interface ShellMainProps
  extends ak.RoleProps<"main">, VariantProps<typeof shellMain> {}

/**
 * The main landmark contains `ShellMainHeader`, `ShellMainIntro`, and
 * `ShellMainBody`. Each part is optional. It shares the shell's grid through
 * subgrid, so do not add size containment. In a nested main landmark, render
 * this part as a `div` to keep one main landmark on the page.
 *
 * `$p` sets a shared gutter. Use a CSS length for responsive padding, such as
 * `$p="var(--page-gutter)"` with
 * `className="[--page-gutter:1rem] @3xl/shell:[--page-gutter:2rem]"`. The query
 * uses the nearest shell width. A part's own `$p` overrides this value.
 * @example
 * <ShellMain $p={4}>
 *   <ShellMainHeader $centered><div>Page actions</div></ShellMainHeader>
 *   <ShellMainIntro $centered><h1>Page title</h1></ShellMainIntro>
 *   <ShellMainBody $centered><p>Page content</p></ShellMainBody>
 * </ShellMain>
 */
export function ShellMain(props: ShellMainProps) {
  const [variantProps, rest] = splitProps(props, shellMain);
  return <ak.Role.main {...shellMain.jsx(variantProps)} {...rest} />;
}

export interface ShellMainHeaderProps
  extends ak.RoleProps<"header">, VariantProps<typeof shellMainHeader> {}

/**
 * A main header that sticks below the shell header by default. Its outer height
 * matches `ShellHeader` unless `$height` sets a local preset. Borders are
 * contained inside that height. Its surface spans adjacent end columns whose
 * sidebars start at the intro or body; content stays aligned with the body. Use
 * `$sticky={false}` for a static header. Direct element children occupy the
 * content column; wrap text in an element such as `div`.
 */
export function ShellMainHeader(props: ShellMainHeaderProps) {
  const [variantProps, rest] = splitProps(props, shellMainHeader);
  return <ak.Role.header {...shellMainHeader.jsx(variantProps)} {...rest} />;
}

export interface ShellMainBodyProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellMainBody> {}

/**
 * The main content grid. The `shell-main-body` query container follows the
 * available body width. `$centered` keeps the content on the shell's center;
 * `$centered="main"` centers it within the body. Direct children are grid
 * items; use `Prose` for text with collapsing margins.
 *
 * Fragment links clear the configured sticky headers. For keyboard focus, also
 * set scroll padding on the page's scroll port to their total height, for
 * example `html { scroll-padding-block-start: 130px }` for two default headers.
 * Content must fit the configured header heights.
 */
export function ShellMainBody(props: ShellMainBodyProps) {
  const [variantProps, rest] = splitProps(props, shellMainBody);
  return <ak.Role.div {...shellMainBody.jsx(variantProps)} {...rest} />;
}

export interface ShellBreakoutProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellBreakout> {}

/**
 * A band that spans main's or the intro's popout, feature, or full lines. Its
 * children return to the content column. A narrower breakout can nest inside a
 * wider one; keep nesting to two levels because deeper subgrids can hang
 * Safari. Inline padding and auto margins would shift the shared columns.
 */
export function ShellBreakout(props: ShellBreakoutProps) {
  const [variantProps, rest] = splitProps(props, shellBreakout);
  return <ak.Role.div {...shellBreakout.jsx(variantProps)} {...rest} />;
}

export interface ShellSidebarProps
  extends
    ak.RoleProps<"div">,
    VariantProps<typeof shellSidebar>,
    VariantProps<typeof shellSidebarPanel> {
  /**
   * Opens the sidebar unless its collapse breakpoint applies. Defaults to
   * `true`. Sets `data-open` on the panel, which can also be set directly.
   */
  open?: boolean;
}

/**
 * A side panel that folds with a drawer motion. The panel receives `render`,
 * the id, ARIA attributes, class names, and frame variants. Use `nav` for
 * navigation or `aside` for a complementary panel, and name the landmark with
 * `aria-label`. A closed panel leaves the tab order and the accessibility tree.
 * The panel draws a real border on the side that faces main. Put scrollable
 * content in `ShellSidebarBody`, even when there is no header or footer. The
 * panel itself does not scroll.
 *
 * `open` controls the state, and `$collapse` hides the panel below a named
 * container width even while it is open. A consumer button controls `open` and
 * reports that same state with `aria-expanded`. Hide the button below the same
 * collapse step in the sidebar's shell container. For the default `3xl` step,
 * use `className="@max-3xl/shell:hidden"`. With `$collapse={false}`, the button
 * can stay visible at every width.
 * @example
 * const [open, setOpen] = useState(true);
 * const sidebarId = useId();
 * <Button
 *   className="@max-3xl/shell:hidden"
 *   aria-expanded={open}
 *   aria-controls={sidebarId}
 *   onClick={() => setOpen(!open)}
 * >
 *   Navigation
 * </Button>
 * <ShellSidebar
 *   id={sidebarId}
 *   open={open}
 *   $width="md"
 *   aria-label="Main"
 *   render={<nav />}
 * >
 *   <ShellSidebarBody>…</ShellSidebarBody>
 * </ShellSidebar>
 */
export function ShellSidebar({ open = true, ...props }: ShellSidebarProps) {
  // The first recipe receives className and style, which belong to the panel.
  const [variantProps, columnProps, rest] = splitProps(
    props,
    shellSidebarPanel,
    shellSidebar,
  );
  return (
    <div {...shellSidebar.jsx(columnProps)}>
      <ak.Role.div
        data-open={open ? "" : undefined}
        {...shellSidebarPanel.jsx(variantProps)}
        {...rest}
      />
    </div>
  );
}

export interface ShellSidebarHeaderProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellSidebarHeader> {}

/**
 * A fixed header inside the sidebar panel. It shares `ShellHeader`'s outer
 * height by default; a local `$height` includes the local border.
 */
export function ShellSidebarHeader(props: ShellSidebarHeaderProps) {
  const [variantProps, rest] = splitProps(props, shellSidebarHeader);
  return <ak.Role.div {...shellSidebarHeader.jsx(variantProps)} {...rest} />;
}

export interface ShellSidebarBodyProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellSidebarBody> {}

/** The scrollable center between a sidebar's optional header and footer. */
export function ShellSidebarBody(props: ShellSidebarBodyProps) {
  const [variantProps, rest] = splitProps(props, shellSidebarBody);
  return <ak.Role.div {...shellSidebarBody.jsx(variantProps)} {...rest} />;
}

export interface ShellSidebarFooterProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellSidebarFooter> {}

/** A fixed footer after the sidebar's scrollable body. */
export function ShellSidebarFooter(props: ShellSidebarFooterProps) {
  const [variantProps, rest] = splitProps(props, shellSidebarFooter);
  return <ak.Role.div {...shellSidebarFooter.jsx(variantProps)} {...rest} />;
}
