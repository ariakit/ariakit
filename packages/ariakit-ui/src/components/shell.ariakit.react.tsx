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
  shellIntro,
  shellMain,
  shellSidebar,
  shellSidebarBody,
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
 *     $open={open}
 *     aria-label="Documentation"
 *     render={<nav />}
 *   >
 *     …
 *   </ShellSidebar>
 *   <ShellIntro $centered>…</ShellIntro>
 *   <ShellMain $centered>…</ShellMain>
 *   <ShellSidebar
 *     $side="end"
 *     $width="sm"
 *     $from="body"
 *     aria-label="On this page"
 *     render={<aside />}
 *   >
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

export interface ShellIntroProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellIntro> {}

/**
 * A heading area between the header and main. It shares main's content columns
 * and breakout lines and spans to the shell's end edge. A sidebar with
 * `$from="body"` starts below it.
 */
export function ShellIntro(props: ShellIntroProps) {
  const [variantProps, rest] = splitProps(props, shellIntro);
  return <ak.Role.div {...shellIntro.jsx(variantProps)} {...rest} />;
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
    VariantProps<typeof shellSidebarBody> {}

/**
 * A side panel that folds with a drawer motion. The body receives `render`, the
 * id, ARIA attributes, class names, and frame variants. Use `nav` for
 * navigation or `aside` for a complementary panel, and name the landmark with
 * `aria-label`. When the fold ends, the body leaves the tab order and the
 * accessibility tree. The body draws a real border on the side that faces main.
 *
 * `$open` controls the state, and `$collapse` hides the panel below a named
 * container width even while it is open. A consumer button controls `$open` and
 * reports that same state with `aria-expanded`.
 * @example
 * const [open, setOpen] = useState(true);
 * const sidebarId = useId();
 * <Button
 *   aria-expanded={open}
 *   aria-controls={sidebarId}
 *   onClick={() => setOpen(!open)}
 * >
 *   Navigation
 * </Button>
 * <ShellSidebar
 *   id={sidebarId}
 *   $open={open}
 *   $width="md"
 *   aria-label="Main"
 *   render={<nav />}
 * >
 *   …
 * </ShellSidebar>
 */
export function ShellSidebar(props: ShellSidebarProps) {
  // The first recipe receives className and style, which belong to the body.
  const [variantProps, columnProps, rest] = splitProps(
    props,
    shellSidebarBody,
    shellSidebar,
  );
  return (
    <div {...shellSidebar.jsx(columnProps)}>
      <ak.Role.div {...shellSidebarBody.jsx(variantProps)} {...rest} />
    </div>
  );
}
