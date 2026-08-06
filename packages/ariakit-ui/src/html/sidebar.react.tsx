import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { sidebar, sidebarBody, sidebarSection } from "../styles/sidebar.ts";

export interface SidebarProps
  extends ComponentProps<"div">, VariantProps<typeof sidebar> {}

/**
 * Renders a fixed side panel that hosts SidebarHeader, SidebarBody, and
 * SidebarFooter. This static flavor has no dialog or mobile behavior — drive
 * `$collapsed` and `$fullHeight` yourself, or reach for the ariakit flavor
 * for collapsible sidebars.
 */
export function Sidebar(props: SidebarProps) {
  const [variantProps, rest] = splitProps(props, sidebar);
  return <div {...sidebar.jsx(variantProps)} {...rest} />;
}

export interface SidebarHeaderProps
  extends ComponentProps<"div">, VariantProps<typeof sidebarSection> {}

/**
 * Renders the leading sidebar section. Must be placed directly inside
 * Sidebar: sections are unpainted regions that cover the sidebar frame.
 */
export function SidebarHeader(props: SidebarHeaderProps) {
  const [variantProps, rest] = splitProps(props, sidebarSection);
  return <div {...sidebarSection.jsx(variantProps)} {...rest} />;
}

export interface SidebarBodyProps
  extends ComponentProps<"div">, VariantProps<typeof sidebarBody> {}

/**
 * Renders the scrollable middle sidebar section. Must be placed directly
 * inside Sidebar: sections are unpainted regions that cover the sidebar
 * frame.
 */
export function SidebarBody(props: SidebarBodyProps) {
  const [variantProps, rest] = splitProps(props, sidebarBody);
  return <div {...sidebarBody.jsx(variantProps)} {...rest} />;
}

export interface SidebarFooterProps
  extends ComponentProps<"div">, VariantProps<typeof sidebarSection> {}

/**
 * Renders the trailing sidebar section. Must be placed directly inside
 * Sidebar: sections are unpainted regions that cover the sidebar frame.
 */
export function SidebarFooter(props: SidebarFooterProps) {
  const [variantProps, rest] = splitProps(props, sidebarSection);
  return <div {...sidebarSection.jsx(variantProps)} {...rest} />;
}
