import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";

export const sidebar = cv({
  extend: [frame],
  class: [
    "fixed inset-s-0 top-0 z-10 flex flex-col overflow-clip border-e",
    // The frame radius stays dialog-sized so covering sections round their
    // own corners against it, but the panel itself runs to the screen edge.
    // This wins over the frame radius by stylesheet order.
    "rounded-none",
    "transition-[width,padding,inset] transition-discrete duration-300",
    // Lets the collapse animate to and from keyword widths such as auto.
    "[interpolate-size:allow-keywords]",
    // Sections apply their own frame, which rewrites --ak-frame-padding, so
    // they read the sidebar's own padding from this copy.
    "[--sidebar-gap:var(--ak-frame-padding)]",
    // Descendants that fade with the collapse match this duration.
    "[--sidebar-duration:var(--tw-duration)]",
  ],
  variants: {
    /**
     * Whether the sidebar is collapsed to its minimum width. Descendants
     * read the flag through container style queries. The width lives in the
     * same variant so only one width rule is ever emitted.
     */
    $collapsed: {
      true: "[--sidebar-collapsed:1] w-(--sidebar-min-width)",
      false: "[--sidebar-collapsed:0] w-(--sidebar-max-width)",
    },
    /**
     * Sizes the sidebar against its positioning context instead of the app
     * container, for modal sidebars portalled away from it. Both heights
     * live in the same variant so only one height rule is ever emitted.
     */
    $fullHeight: {
      true: "h-full",
      false: "h-[100cqb]",
    },
    /**
     * Sets the expanded width. Numbers scale the spacing token.
     */
    $maxWidth(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--sidebar-max-width": getSpacingValue(value) },
      };
    },
    /**
     * Sets the collapsed width. Numbers scale the spacing token. Nav rows
     * size their icon buttons against it.
     */
    $minWidth(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--sidebar-min-width": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $collapsed: false,
    $fullHeight: false,
    $lightnessOffset: 0.5,
    $rounded: "2xl",
    $maxWidth: 60,
    $minWidth: 14,
    // A collapsed sidebar tightens its padding so the icon rows keep their
    // square proportions.
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
