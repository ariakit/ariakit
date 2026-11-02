import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import * as React from "react";
import {
  LandmarkContext,
  useNestedLandmarks,
} from "../react-utils/landmark.react.ts";
import {
  shell,
  shellContent,
  shellPopout,
  shellFeature,
  shellWide,
  shellFull,
  shellFooter,
  shellCenter,
  shellEnd,
  shellStart,
  shellHeader,
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
 * <Shell>
 *   <ShellHeader>
 *     <ShellStart>Docs</ShellStart>
 *   </ShellHeader>
 *   <ShellMain>
 *     <ShellMainBody><h1>Getting started</h1></ShellMainBody>
 *   </ShellMain>
 *   <ShellFooter>
 *     <ShellCenter>Ariakit</ShellCenter>
 *   </ShellFooter>
 * </Shell>
 */
export function Shell(props: ShellProps) {
  const [variantProps, rest] = splitProps(props, shell);
  return <ak.Role.div {...shell.jsx(variantProps)} {...rest} />;
}

export interface ShellPartProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellStart> {}

// All bar parts share these variants.
type BarPartRecipe = typeof shellStart;

/** Renders a header, footer, or main header part with its recipe. */
function renderPartCell(recipe: BarPartRecipe, props: ShellPartProps) {
  const [variantProps, rest] = splitProps(props, recipe);
  return <ak.Role.div {...recipe.jsx(variantProps)} {...rest} />;
}

/**
 * The start part of a `ShellHeader`, `ShellFooter`, or `ShellMainHeader`: a
 * flex cell at the start edge that keeps its content minimum unless it says it
 * can shrink. For a sidebar, use `ShellSidebar` with `$side="start"`.
 * @example
 * <Shell>
 *   <ShellHeader>
 *     <ShellStart $shrink>Docs</ShellStart>
 *   </ShellHeader>
 * </Shell>
 */
export function ShellStart(props: ShellPartProps) {
  return renderPartCell(shellStart, props);
}

/**
 * The center part of a `ShellHeader`, `ShellFooter`, or `ShellMainHeader`: a
 * flex cell on the part's middle while both sides fit, moved over when a side
 * needs more than its half. This isn't main's column. To align with that
 * column, use `ShellContent` instead. Render one of them, because they share a
 * track.
 * @example
 * <Shell>
 *   <ShellHeader>
 *     <ShellCenter $grow>Docs</ShellCenter>
 *   </ShellHeader>
 * </Shell>
 */
export function ShellCenter(props: ShellPartProps) {
  return renderPartCell(shellCenter, props);
}

/**
 * The end part of a `ShellHeader`, `ShellFooter`, or `ShellMainHeader`: a flex
 * cell at the end edge that keeps its content minimum unless it says it can
 * shrink. For a sidebar, use `ShellSidebar` with `$side="end"`.
 * @example
 * <Shell>
 *   <ShellHeader>
 *     <ShellEnd>Account</ShellEnd>
 *   </ShellHeader>
 * </Shell>
 */
export function ShellEnd(props: ShellPartProps) {
  return renderPartCell(shellEnd, props);
}

export interface ShellHeaderProps
  extends ak.RoleProps<"header">, VariantProps<typeof shellHeader> {}

/**
 * The top bar of a shell, sticky by default, as tall as its height token. Its
 * parts, `ShellStart`, `ShellCenter` and `ShellEnd`, sit at the start, on the
 * middle and at the end. Render them in that order: a part after a later one
 * wraps to a new row. To align content with main's column, render
 * `ShellContent` or a wider band instead of `ShellCenter`. It aligns while it
 * has room, and the edge next to a wide side part moves to make room.
 *
 * Use `portal` for overlays to escape the bar's stacking context. Portalled
 * elements no longer inherit the shell's tokens.
 * @example
 * <Shell>
 *   <ShellHeader $blur>
 *     <ShellStart>Docs</ShellStart>
 *     <ShellEnd><a href="/help">Help</a></ShellEnd>
 *   </ShellHeader>
 * </Shell>
 */
export function ShellHeader(props: ShellHeaderProps) {
  const [variantProps, rest] = splitProps(props, shellHeader);
  return <ak.Role.header {...shellHeader.jsx(variantProps)} {...rest} />;
}

export interface ShellFooterProps
  extends ak.RoleProps<"footer">, VariantProps<typeof shellFooter> {}

/**
 * The bottom bar of a shell, as tall as its content. It is static by default,
 * and a sticky sidebar body ends above it at the end of the page. Set `$sticky`
 * to keep it at the bottom of the viewport, such as for a message composer;
 * sticky sidebars and scrolled-to elements then end above it. Its parts are
 * `ShellStart`, `ShellCenter` and `ShellEnd`, in that order. To align content
 * with main's column, render `ShellContent` or a wider band instead of
 * `ShellCenter`.
 * @example
 * <Shell>
 *   <ShellFooter>
 *     <ShellStart>Ariakit</ShellStart>
 *     <ShellEnd><a href="/help">Help</a></ShellEnd>
 *   </ShellFooter>
 * </Shell>
 */
export function ShellFooter(props: ShellFooterProps) {
  const [variantProps, rest] = splitProps(props, shellFooter);
  return <ak.Role.footer {...shellFooter.jsx(variantProps)} {...rest} />;
}

export interface ShellMainIntroProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellMainIntro> {}

/**
 * An introduction inside `ShellMain`, before `ShellMainBody`. Its content
 * aligns with the body, and its surface spans the adjacent end columns whose
 * sidebars start at the body. Direct element children use the centered content
 * column; named main bands can select a wider span. `$py` sets the space above
 * and below it. By default, this space grows with the width of the intro, so
 * open sidebars beside it reduce the space. It sets no text styles, so banners,
 * images, and controls keep their size unless `ShellMain` sets `$size`. Put a
 * title in `Prose`.
 * @example
 * <Shell>
 *   <ShellMain>
 *     <ShellMainIntro>
 *       <Prose>
 *         <Heading>Getting started</Heading>
 *         <HeadingDescription>Set up a project.</HeadingDescription>
 *       </Prose>
 *     </ShellMainIntro>
 *     <ShellMainBody><p>Install Ariakit.</p></ShellMainBody>
 *   </ShellMain>
 * </Shell>
 */
export function ShellMainIntro(props: ShellMainIntroProps) {
  const [variantProps, rest] = splitProps(props, shellMainIntro);
  return <ak.Role.div {...shellMainIntro.jsx(variantProps)} {...rest} />;
}

export interface ShellMainProps
  extends ak.RoleProps<"main">, VariantProps<typeof shellMain> {
  /**
   * Whether the part renders a `main` landmark. When omitted, it does unless it
   * is inside another `ShellMain`, in which case it renders a `div`. A name on
   * a nested part stays on the `div`, although ARIA doesn't allow names there.
   * Set `false` where the outer `ShellMain` is outside this React tree, such as
   * in an Astro island. Forcing `true` inside another main breaks the HTML rule
   * of one `main` per document.
   */
  landmark?: boolean;
}

/**
 * Contains optional `ShellMainHeader`, `ShellMainIntro`, and `ShellMainBody`
 * parts. Uses subgrid; do not add size containment. A nested shell's main part
 * renders a `div`, so the page keeps one main landmark.
 *
 * `$p` sets a shared gutter. Use a CSS length for responsive padding, such as
 * `$p="var(--page-gutter)"` with
 * `className="[--page-gutter:1rem] @3xl/shell:[--page-gutter:2rem]"`. The query
 * uses the nearest shell width. A part's own `$p` overrides this value. `$py`
 * sets the space above the intro, or above the body without an intro, and below
 * the body. By default, the body uses its gutter and the intro uses its own
 * `$py`; `$py="none"` removes the space. `$maxWidth` sets the shared content
 * width limit. Use a number or CSS length to align columns across text sizes.
 * Percentages depend on each part's width and can misalign wider headers or
 * intros. Parts can override `$maxWidth`.
 *
 * `$size` sets the text size of main and a 42em column, so line length stays
 * the same at every size. `Prose` follows it, and bars and sidebars keep the
 * shell's size. Other text and unsized controls in main grow with it, so use it
 * for reading pages. A nested shell doesn't take the size. With `$size`, define
 * a variable for `$p`, `$py`, or `$maxWidth` in rem or as a plain length:
 * Firefox resolves a variable that reads an em-based variable, such as
 * `--spacing()`, against the parent's text.
 * @example
 * <Shell>
 *   <ShellMain $p={4}>
 *     <ShellMainHeader><div>Docs</div></ShellMainHeader>
 *     <ShellMainIntro><h1>Getting started</h1></ShellMainIntro>
 *     <ShellMainBody><p>Install Ariakit.</p></ShellMainBody>
 *   </ShellMain>
 * </Shell>
 */
export function ShellMain({ landmark, ...props }: ShellMainProps) {
  const [variantProps, rest] = splitProps(props, shellMain);
  const landmarks = React.useContext(LandmarkContext);
  // Parts inside are nested even when this one skips the landmark, because the
  // main landmark then lives outside this React tree.
  const nestedLandmarks = useNestedLandmarks(landmarks, { main: true });
  const isLandmark = landmark ?? !landmarks.main;
  return (
    <LandmarkContext.Provider value={nestedLandmarks}>
      <ak.Role.main
        // A render prop from the caller still decides the element.
        render={isLandmark ? undefined : <div />}
        {...shellMain.jsx(variantProps)}
        {...rest}
      />
    </LandmarkContext.Provider>
  );
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
 * text in an element such as `div`. Use `ShellStart`, `ShellCenter`, and
 * `ShellEnd` to place parts at its edges and on its middle, like in
 * `ShellHeader`. Children between the side parts still aim for the content
 * column.
 * @example
 * <Shell>
 *   <ShellMain>
 *     <ShellMainHeader $sticky={false}><div>Docs</div></ShellMainHeader>
 *     <ShellMainBody><p>Install Ariakit.</p></ShellMainBody>
 *   </ShellMain>
 * </Shell>
 */
export function ShellMainHeader(props: ShellMainHeaderProps) {
  const [variantProps, rest] = splitProps(props, shellMainHeader);
  return <ak.Role.header {...shellMainHeader.jsx(variantProps)} {...rest} />;
}

export interface ShellMainBodyProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellMainBody> {}

/**
 * The main content grid. Direct element children use the centered content
 * column. Content that adapts to its width can declare its own query container,
 * so a sidebar fold restyles only that content in WebKit. Use `ShellPopout`,
 * `ShellFeature`, `ShellWide`, or `ShellFull` as a direct child to select a
 * wider span. Children are grid items; use `Prose` for text with collapsing
 * margins.
 *
 * Fragment links clear the configured sticky headers. For keyboard focus, also
 * set scroll padding on the page's scroll port to their total height, for
 * example `html { scroll-padding-block-start: 128px }` for two default headers.
 * Content must fit the configured header heights.
 * @example
 * <Shell>
 *   <ShellMain>
 *     <ShellMainBody><p>Install Ariakit.</p></ShellMainBody>
 *   </ShellMain>
 * </Shell>
 */
export function ShellMainBody(props: ShellMainBodyProps) {
  const [variantProps, rest] = splitProps(props, shellMainBody);
  return <ak.Role.div {...shellMainBody.jsx(variantProps)} {...rest} />;
}

export interface ShellContentProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellContent> {}

/**
 * Selects the centered content column inside a main header, intro, body, or
 * wider main band. Direct element children fill this column. As a direct child
 * of `ShellHeader` or `ShellFooter`, it aims for the same column of main: it
 * aligns while it has room, and the edge next to a wide `ShellStart` or
 * `ShellEnd` moves to make room. On small pages, it stops at the bar's inset.
 * Use `$size` on `ShellMain` to share a column width with the bars, or
 * `$maxWidth` and `$gutter` on the bar to match custom values on `ShellMain`.
 * @example
 * <Shell>
 *   <ShellMain>
 *     <ShellMainBody>
 *       <ShellFull $layer="brand">
 *         <ShellContent><p>Centered content</p></ShellContent>
 *       </ShellFull>
 *     </ShellMainBody>
 *   </ShellMain>
 * </Shell>
 */
export function ShellContent(props: ShellContentProps) {
  const [variantProps, rest] = splitProps(props, shellContent);
  return <ak.Role.div {...shellContent.jsx(variantProps)} {...rest} />;
}

export interface ShellPopoutProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellPopout> {}

/**
 * Extends past the content column into the popout tracks. Direct element
 * children fill its width. Use `ShellContent` inside to return to the content
 * column. It must be a direct child of a main header, intro, body, or wider
 * main band. As a direct child of `ShellHeader` or `ShellFooter`, it aligns
 * with the same span of main while it has room. A band in a bar, or in a main
 * header with side parts, can't hold other bands.
 * @example
 * <Shell>
 *   <ShellMain>
 *     <ShellMainBody>
 *       <ShellPopout><p>Wide content</p></ShellPopout>
 *     </ShellMainBody>
 *   </ShellMain>
 * </Shell>
 */
export function ShellPopout(props: ShellPopoutProps) {
  const [variantProps, rest] = splitProps(props, shellPopout);
  return <ak.Role.div {...shellPopout.jsx(variantProps)} {...rest} />;
}

export interface ShellFeatureProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellFeature> {}

/**
 * Extends past the popout tracks into the feature tracks. Direct element
 * children fill its width. Use a narrower main band inside to select its
 * columns. It must be a direct child of a main header, intro, body, or wide or
 * full band. As a direct child of `ShellHeader` or `ShellFooter`, it aligns
 * with the same span of main while it has room. A band in a bar, or in a main
 * header with side parts, can't hold other bands.
 * @example
 * <Shell>
 *   <ShellMain>
 *     <ShellMainBody>
 *       <ShellFeature><p>Featured content</p></ShellFeature>
 *     </ShellMainBody>
 *   </ShellMain>
 * </Shell>
 */
export function ShellFeature(props: ShellFeatureProps) {
  const [variantProps, rest] = splitProps(props, shellFeature);
  return <ak.Role.div {...shellFeature.jsx(variantProps)} {...rest} />;
}

export interface ShellWideProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellWide> {}

/**
 * Extends past the feature tracks to the widest span centered on the content
 * column. An open sidebar shifts the content to keep it centered in the shell;
 * this band leaves that offset out, while `ShellFull` covers it. Without the
 * offset, both bands match. Direct element children fill its width. Use a
 * narrower main band inside to select its columns. It must be a direct child of
 * a main header, intro, body, or full band. As a direct child of `ShellHeader`
 * or `ShellFooter`, it aligns with the same span of main while it has room. A
 * band in a bar, or in a main header with side parts, can't hold other bands.
 * @example
 * <Shell>
 *   <ShellSidebar>
 *     <ShellSidebarBody>Navigation</ShellSidebarBody>
 *   </ShellSidebar>
 *   <ShellMain>
 *     <ShellMainBody>
 *       <ShellWide><p>Centered wide content</p></ShellWide>
 *     </ShellMainBody>
 *   </ShellMain>
 * </Shell>
 */
export function ShellWide(props: ShellWideProps) {
  const [variantProps, rest] = splitProps(props, shellWide);
  return <ak.Role.div {...shellWide.jsx(variantProps)} {...rest} />;
}

export interface ShellFullProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellFull> {}

/**
 * Fills a main header, intro, or body's width, including the outer gutters. As
 * a direct child of `ShellHeader` or `ShellFooter`, it fills the space between
 * `ShellStart` and `ShellEnd`. Direct element children fill its width.
 * Elsewhere in main, use a narrower main band to select its columns. A band in
 * a bar, or in a main header with side parts, can't hold other bands, so render
 * `ShellContent` directly in that part for that column. Keep main bands to two
 * nested levels: deeper subgrids can hang Safari. Inline padding and auto
 * margins shift the shared columns; put padding on a child element instead.
 * @example
 * <Shell>
 *   <ShellMain>
 *     <ShellMainBody>
 *       <ShellFull $layer="brand"><p>Full-width content</p></ShellFull>
 *     </ShellMainBody>
 *   </ShellMain>
 * </Shell>
 */
export function ShellFull(props: ShellFullProps) {
  const [variantProps, rest] = splitProps(props, shellFull);
  return <ak.Role.div {...shellFull.jsx(variantProps)} {...rest} />;
}

export interface ShellSidebarProps
  extends
    ak.RoleProps<"div">,
    VariantProps<typeof shellSidebar>,
    VariantProps<typeof shellSidebarPanel> {
  /**
   * Opens the sidebar when its `$show` condition matches. Defaults to `true`.
   */
  open?: boolean;
  /**
   * Renders the panel as a `nav` or `aside` landmark. Name it with `aria-label`
   * or `aria-labelledby`. Renders a `div` when omitted. A `"nav"` value also
   * makes nested `Nav` components skip their own landmark; `render` changes the
   * element but not that.
   */
  landmark?: "nav" | "aside";
}

function getSidebarPanelRender(landmark: ShellSidebarProps["landmark"]) {
  if (landmark === "nav") return <nav />;
  if (landmark === "aside") return <aside />;
  return;
}

/**
 * A drawer panel. Receives `render`, ID, ARIA attributes, classes, and frame
 * variants. Set `landmark` to `"nav"` or `"aside"` and name the panel; a
 * `"nav"` panel holds its `Nav` rows without a second navigation landmark.
 * Closed panels leave the tab order and accessibility tree. The border faces
 * main. Use `ShellSidebarBody` for scrolling; the panel does not scroll. It
 * starts beside the main header; use `$from="intro"` or `$from="body"` to start
 * below it.
 *
 * `open` controls state. `$show` selects shell widths: `"3xl"` (default) means
 * at least 48rem, `"max-3xl"` means below 48rem, `true` means all widths, and
 * `false` hides it. A control button must report `open` with `aria-expanded`.
 * Match its visibility to the sidebar: `@max-3xl/shell:hidden` by default,
 * `@3xl/shell:hidden` for `$show="max-3xl"`, or always visible for
 * `$show={true}`.
 * @example
 * import { useState } from "react";
 *
 * function Example() {
 *   const [open, setOpen] = useState(true);
 *   return (
 *     <Shell>
 *       <ShellHeader>
 *         <ShellStart>
 *           <button
 *             type="button"
 *             aria-expanded={open}
 *             aria-controls="docs-nav"
 *             onClick={() => setOpen(!open)}
 *           >
 *             Docs
 *           </button>
 *         </ShellStart>
 *       </ShellHeader>
 *       <ShellSidebar
 *         id="docs-nav"
 *         open={open}
 *         $show={true}
 *         landmark="nav"
 *         aria-label="Docs"
 *       >
 *         <ShellSidebarBody><a href="/install">Install</a></ShellSidebarBody>
 *       </ShellSidebar>
 *     </Shell>
 *   );
 * }
 */
export function ShellSidebar({
  open = true,
  landmark,
  ...props
}: ShellSidebarProps) {
  // The first recipe receives className and style, which belong to the panel.
  const [variantProps, columnProps, rest] = splitProps(
    props,
    shellSidebarPanel,
    shellSidebar,
  );
  const landmarks = React.useContext(LandmarkContext);
  const nestedLandmarks = useNestedLandmarks(landmarks, {
    navigation: landmark === "nav",
  });
  // A data-open prop replaces open on the panel. The column mirrors it so it
  // renders in place before its panel arrives in streamed HTML.
  const dataOpen: unknown = Object.hasOwn(rest, "data-open")
    ? Reflect.get(rest, "data-open")
    : open
      ? ""
      : undefined;
  return (
    <div data-open={dataOpen} {...shellSidebar.jsx(columnProps)}>
      <LandmarkContext.Provider value={nestedLandmarks}>
        <ak.Role.div
          // A render prop from the caller still decides the element.
          render={getSidebarPanelRender(landmark)}
          data-open={dataOpen}
          {...shellSidebarPanel.jsx(variantProps)}
          {...rest}
        />
      </LandmarkContext.Provider>
    </div>
  );
}

export interface ShellSidebarHeaderProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellSidebarHeader> {}

/**
 * A fixed header inside the sidebar panel. It shares `ShellHeader`'s outer
 * height by default; a local `$height` includes the local border.
 * @example
 * <Shell>
 *   <ShellSidebar landmark="nav" aria-label="Docs">
 *     <ShellSidebarHeader>Getting started</ShellSidebarHeader>
 *     <ShellSidebarBody><a href="/install">Install</a></ShellSidebarBody>
 *   </ShellSidebar>
 * </Shell>
 */
export function ShellSidebarHeader(props: ShellSidebarHeaderProps) {
  const [variantProps, rest] = splitProps(props, shellSidebarHeader);
  return <ak.Role.div {...shellSidebarHeader.jsx(variantProps)} {...rest} />;
}

export interface ShellSidebarBodyProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellSidebarBody> {}

/**
 * The scrollable center between a sidebar's optional header and footer.
 * @example
 * <Shell>
 *   <ShellSidebar landmark="nav" aria-label="Docs">
 *     <ShellSidebarBody><a href="/install">Install</a></ShellSidebarBody>
 *   </ShellSidebar>
 * </Shell>
 */
export function ShellSidebarBody(props: ShellSidebarBodyProps) {
  const [variantProps, rest] = splitProps(props, shellSidebarBody);
  return <ak.Role.div {...shellSidebarBody.jsx(variantProps)} {...rest} />;
}

export interface ShellSidebarFooterProps
  extends ak.RoleProps<"div">, VariantProps<typeof shellSidebarFooter> {}

/**
 * A fixed footer after the sidebar's scrollable body.
 * @example
 * <Shell>
 *   <ShellSidebar landmark="nav" aria-label="Docs">
 *     <ShellSidebarBody><a href="/install">Install</a></ShellSidebarBody>
 *     <ShellSidebarFooter><a href="/help">Help</a></ShellSidebarFooter>
 *   </ShellSidebar>
 * </Shell>
 */
export function ShellSidebarFooter(props: ShellSidebarFooterProps) {
  const [variantProps, rest] = splitProps(props, shellSidebarFooter);
  return <ak.Role.div {...shellSidebarFooter.jsx(variantProps)} {...rest} />;
}
