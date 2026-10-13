import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import { createOptionalRender } from "../react-utils/create-render.react.ts";
import {
  shell,
  shellMainContent,
  shellMainPopout,
  shellMainFeature,
  shellMainFull,
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
 *     <ShellMainHeader>…</ShellMainHeader>
 *     <ShellMainIntro>…</ShellMainIntro>
 *     <ShellMainBody>…</ShellMainBody>
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

// All bar parts share these variants.
type BarPartRecipe = typeof shellHeaderStart;

/** Renders a header or footer part with its recipe. */
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
  /** The start part: its content, part props, or a part element. */
  start?: React.ReactNode | ShellHeaderPartProps;
  /** The center part: its content, part props, or a part element. */
  center?: React.ReactNode | ShellHeaderPartProps;
  /** The end part: its content, part props, or a part element. */
  end?: React.ReactNode | ShellHeaderPartProps;
}

type BarPart = React.ElementType<ShellHeaderPartProps>;

/** Wraps content in a bar part unless it is already a part element. */
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
 * Use `portal` for overlays to escape the bar's stacking context. Portalled
 * elements no longer inherit the shell's tokens.
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

// Function declarations let this set refer to parts defined below.
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
 * sidebars start at the body. Direct element children use the centered content
 * column; named main bands can select a wider span.
 */
export function ShellMainIntro(props: ShellMainIntroProps) {
  const [variantProps, rest] = splitProps(props, shellMainIntro);
  return <ak.Role.div {...shellMainIntro.jsx(variantProps)} {...rest} />;
}

export interface ShellMainProps
  extends ak.RoleProps<"main">, VariantProps<typeof shellMain> {}

/**
 * Contains optional `ShellMainHeader`, `ShellMainIntro`, and `ShellMainBody`
 * parts. Uses subgrid; do not add size containment. Render nested mains as
 * `div` elements to keep one main landmark.
 *
 * `$p` sets a shared gutter. Use a CSS length for responsive padding, such as
 * `$p="var(--page-gutter)"` with
 * `className="[--page-gutter:1rem] @3xl/shell:[--page-gutter:2rem]"`. The query
 * uses the nearest shell width. A part's own `$p` overrides this value.
 * `$maxWidth` sets the shared content width limit. Use a number or CSS length
 * to align columns across text sizes. Percentages depend on each part's width
 * and can misalign wider headers or intros. Parts can override `$maxWidth`.
 * @example
 * <ShellMain $p={4}>
 *   <ShellMainHeader><div>Page actions</div></ShellMainHeader>
 *   <ShellMainIntro><h1>Page title</h1></ShellMainIntro>
 *   <ShellMainBody><p>Page content</p></ShellMainBody>
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
 * `$sticky={false}` for a static header. `$show="3xl"` shows it at shell widths
 * of 48rem and above; `$show="max-3xl"` shows it only below 48rem.
 * `$show={false}` hides it at every width. A hidden header takes no space and
 * has no sticky offset. Direct element children occupy the content column; wrap
 * text in an element such as `div`.
 */
export function ShellMainHeader(props: ShellMainHeaderProps) {
  const [variantProps, rest] = splitProps(props, shellMainHeader);
  return <ak.Role.header {...shellMainHeader.jsx(variantProps)} {...rest} />;
}

export interface ShellMainBodyProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellMainBody> {}

/**
 * The main content grid. The `shell-main-body` query container follows the
 * available body width. Direct element children use the centered content
 * column. Use `ShellMainPopout`, `ShellMainFeature`, or `ShellMainFull` as a
 * direct child to select a wider span. Children are grid items; use `Prose` for
 * text with collapsing margins.
 *
 * Fragment links clear the configured sticky headers. For keyboard focus, also
 * set scroll padding on the page's scroll port to their total height, for
 * example `html { scroll-padding-block-start: 128px }` for two default headers.
 * Content must fit the configured header heights.
 */
export function ShellMainBody(props: ShellMainBodyProps) {
  const [variantProps, rest] = splitProps(props, shellMainBody);
  return <ak.Role.div {...shellMainBody.jsx(variantProps)} {...rest} />;
}

export interface ShellMainContentProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellMainContent> {}

/**
 * Selects the centered content column inside a main header, intro, body, or
 * wider main band. Direct element children fill this column.
 */
export function ShellMainContent(props: ShellMainContentProps) {
  const [variantProps, rest] = splitProps(props, shellMainContent);
  return <ak.Role.div {...shellMainContent.jsx(variantProps)} {...rest} />;
}

export interface ShellMainPopoutProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellMainPopout> {}

/**
 * Extends past the content column into the popout tracks. Direct element
 * children fill its width. Use `ShellMainContent` inside to return to the
 * content column. It must be a direct child of a main header, intro, body, or
 * wider main band.
 */
export function ShellMainPopout(props: ShellMainPopoutProps) {
  const [variantProps, rest] = splitProps(props, shellMainPopout);
  return <ak.Role.div {...shellMainPopout.jsx(variantProps)} {...rest} />;
}

export interface ShellMainFeatureProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellMainFeature> {}

/**
 * Extends past the popout tracks into the feature tracks. Direct element
 * children fill its width. Use a narrower main band inside to select its
 * columns. It must be a direct child of a main header, intro, body, or full
 * band.
 */
export function ShellMainFeature(props: ShellMainFeatureProps) {
  const [variantProps, rest] = splitProps(props, shellMainFeature);
  return <ak.Role.div {...shellMainFeature.jsx(variantProps)} {...rest} />;
}

export interface ShellMainFullProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellMainFull> {}

/**
 * Fills a main header, intro, or body's width, including the outer gutters.
 * Direct element children fill its width. Use a narrower main band inside to
 * select its columns. Keep main bands to two nested levels: deeper subgrids can
 * hang Safari. Inline padding and auto margins shift the shared columns; put
 * padding on a child element instead.
 * @example
 * <ShellMainBody>
 *   <p>Centered content</p>
 *   <ShellMainFull $layer="brand">
 *     <p>Full-width content</p>
 *     <ShellMainContent><p>Centered content in the band</p></ShellMainContent>
 *   </ShellMainFull>
 * </ShellMainBody>
 */
export function ShellMainFull(props: ShellMainFullProps) {
  const [variantProps, rest] = splitProps(props, shellMainFull);
  return <ak.Role.div {...shellMainFull.jsx(variantProps)} {...rest} />;
}

export interface ShellSidebarProps
  extends
    ak.RoleProps<"div">,
    VariantProps<typeof shellSidebar>,
    VariantProps<typeof shellSidebarPanel> {
  /**
   * Opens the sidebar when its `$show` condition matches. Defaults to `true`.
   * Sets `data-open` on the panel, which can also be set directly.
   */
  open?: boolean;
}

/**
 * A drawer panel. Receives `render`, ID, ARIA attributes, classes, and frame
 * variants. Use a named `nav` or `aside` landmark. Closed panels leave the tab
 * order and accessibility tree. The border faces main. Use `ShellSidebarBody`
 * for scrolling; the panel does not scroll. It starts beside the main header;
 * use `$from="intro"` or `$from="body"` to start below it.
 *
 * `open` controls state. `$show` selects shell widths: `"3xl"` (default) means
 * at least 48rem, `"max-3xl"` means below 48rem, `true` means all widths, and
 * `false` hides it. A control button must report `open` with `aria-expanded`.
 * Match its visibility to the sidebar: `@max-3xl/shell:hidden` by default,
 * `@3xl/shell:hidden` for `$show="max-3xl"`, or always visible for
 * `$show={true}`.
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
