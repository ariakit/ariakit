import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
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
  const [variantProps, rest] = splitProps(props, nav);
  return <nav {...nav.jsx(variantProps)} {...rest} />;
}

export interface NavListProps
  extends ComponentProps<"ul">, VariantProps<typeof navList> {}

/**
 * Renders a `<ul>` stacking nav rows in a grid.
 */
export function NavList(props: NavListProps) {
  const [variantProps, rest] = splitProps(props, navList);
  return <ul {...navList.jsx(variantProps)} {...rest} />;
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
export function NavLink({ currentUrl, ...props }: NavLinkProps) {
  const [variantProps, rest] = splitProps(props, navLink);
  return (
    <a
      aria-current={isCurrentPage(currentUrl, rest.href) ? "page" : undefined}
      {...navLink.jsx(variantProps)}
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
  const [variantProps, rest] = splitProps(props, navGroup);
  return <div role="group" {...navGroup.jsx(variantProps)} {...rest} />;
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
  const [variantProps, rest] = splitProps(props, navIcon);
  return <span {...navIcon.jsx(variantProps)} {...rest} />;
}
