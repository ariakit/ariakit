import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { nav, navGroup, navIcon, navLink, navList } from "../styles/nav.ts";
import { isCurrentPage } from "../utils/is-current-page.ts";

export interface NavProps
  extends ComponentProps<"nav">, VariantProps<typeof nav> {}

/**
 * Renders a `<nav>` landmark holding the spacing variables nav rows read.
 * As a thin html component, it does not wrap children in a NavList like the
 * ariakit flavor does; compose one explicitly.
 */
export function Nav(props: NavProps) {
  const [variantProps, rest] = splitProps(props, nav.html.propKeys);
  return <nav {...nav.html(variantProps)} {...rest} />;
}

export interface NavListProps
  extends ComponentProps<"ul">, VariantProps<typeof navList> {}

/**
 * Renders a `<ul>` stacking nav rows in a grid.
 */
export function NavList(props: NavListProps) {
  const [variantProps, rest] = splitProps(props, navList.html.propKeys);
  return <ul {...navList.html(variantProps)} {...rest} />;
}

export interface NavLinkProps
  extends ComponentProps<"a">, VariantProps<typeof navLink> {
  currentUrl?: string | URL;
}

/**
 * Renders an `<a>` nav row, usually inside a NavList item. It must be
 * inside Nav, which provides the gap variable sizing its hit area. Pass
 * `currentUrl` so the link pointing at the current page gets
 * `aria-current="page"` and the current highlight.
 */
export function NavLink(props: NavLinkProps) {
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["currentUrl"],
    navLink.html.propKeys,
  );
  return (
    <a
      aria-current={
        isCurrentPage(localProps.currentUrl, rest.href) ? "page" : undefined
      }
      {...navLink.html(variantProps)}
      {...rest}
    />
  );
}

export interface NavGroupProps
  extends ComponentProps<"div">, VariantProps<typeof navGroup> {}

/**
 * Renders a `role="group"` `<div>` stacking related nav rows in a grid.
 */
export function NavGroup(props: NavGroupProps) {
  const [variantProps, rest] = splitProps(props, navGroup.html.propKeys);
  return <div role="group" {...navGroup.html(variantProps)} {...rest} />;
}

export interface NavGroupLabelProps extends ComponentProps<"div"> {}

/**
 * Renders a bare `<div>` labeling the enclosing NavGroup. Unlike the
 * ariakit flavor, it does not wire the group's `aria-labelledby`; pass an
 * `id` here and reference it on NavGroup yourself.
 */
export function NavGroupLabel(props: NavGroupLabelProps) {
  return <div {...props} />;
}

export interface NavIconProps
  extends ComponentProps<"span">, VariantProps<typeof navIcon> {}

/**
 * Renders the icon slot of a nav row, sized by the Nav icon-size variable.
 * It keeps the line height while the sidebar is expanded so the label
 * aligns, and squares to the icon size when the sidebar collapses.
 */
export function NavIcon(props: NavIconProps) {
  const [variantProps, rest] = splitProps(props, navIcon.html.propKeys);
  return <span {...navIcon.html(variantProps)} {...rest} />;
}
