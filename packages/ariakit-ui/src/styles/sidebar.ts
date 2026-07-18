import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";

export const sidebar = cv({
  extend: [frame],
  class: [
    "fixed start-0 top-0 z-10 flex flex-col overflow-clip border-e",
    // The frame radius stays dialog-sized for nested covers, but the
    // sidebar itself is square.
    "rounded-none",
    "transition-[inline-size,padding,inset] transition-discrete duration-300",
    "[interpolate-size:allow-keywords]",
    // Width defaults the variants override with inline styles.
    "[--sidebar-max-width:--spacing(60)]",
    "[--sidebar-min-width:--spacing(14)]",
    // Shared by sections; captured before nested frames change them.
    "[--sidebar-gap:var(--ak-frame-padding)]",
    "[--sidebar-duration:var(--tw-duration)]",
  ],
  variants: {
    /**
     * Whether the sidebar is collapsed to its minimum width. Descendants
     * read the flag through container style queries. Widths live in the
     * same variant so only one inline-size rule is ever emitted.
     */
    $collapsed: {
      true: [
        "[--sidebar-collapsed:1]",
        "[inline-size:var(--sidebar-min-width)]",
      ],
      false: [
        "[--sidebar-collapsed:0]",
        "[inline-size:var(--sidebar-max-width)]",
      ],
    },
    /**
     * Sizes the sidebar against its positioning context instead of the app
     * container, for modal sidebars portalled away from it. Both heights
     * live in the same variant so only one block-size rule is ever
     * emitted.
     */
    $fullHeight: {
      true: "[block-size:100%]",
      false: "[block-size:100cqb]",
    },
    /**
     * Sets the expanded width. Numbers scale the spacing token.
     */
    $maxWidth(value?: (string & {}) | number) {
      if (value == null) return;
      return {
        style: { "--sidebar-max-width": getSpacingValue(value) },
      };
    },
    /**
     * Sets the collapsed width. Numbers scale the spacing token.
     */
    $minWidth(value?: (string & {}) | number) {
      if (value == null) return;
      return {
        style: { "--sidebar-min-width": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $collapsed: false,
    $fullHeight: false,
    // The surface sits slightly off the canvas like the legacy ak-layer-3.
    $lightnessOffset: 0.6,
    // Legacy ak-frame-dialog/2, tightening to /1 when collapsed.
    $rounded: "2xl",
    $p(defaultValue, variants) {
      return defaultValue ?? (variants.$collapsed ? 1 : 2);
    },
  },
});

export const sidebarSection = cv({
  extend: [frame],
  class: "grid gap-(--sidebar-gap)",
  defaultVariants: {
    // Sections are unpainted regions covering the sidebar frame; cover
    // determines the corners.
    $layer: false,
    $cover: true,
  },
});

export const sidebarBody = cv({
  extend: [sidebarSection],
  class: "flex-1 overflow-y-auto overflow-x-clip",
});
