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
    "transition-[width,padding,inset,translate] transition-discrete",
    // Opened by its provider, the panel slides in from its own edge, and back
    // out when closed. A sidebar with no provider declares data-open to stay in
    // place.
    "ui-open:starting:-translate-x-full rtl:ui-open:starting:translate-x-full",
    "ui-closed:-translate-x-full rtl:ui-closed:translate-x-full",
    // Lets the sidebar animate to and from keyword widths such as auto.
    "[interpolate-size:allow-keywords]",
    // Sections apply their own frame, which rewrites --ak-frame-padding, so
    // they read the sidebar's own padding from this copy.
    "[--sidebar-gap:var(--ak-frame-padding)]",
    // Descendants that fade as the sidebar collapses match this duration.
    "[--sidebar-duration:var(--tw-duration)]",
  ],
  variants: {
    /**
     * Whether the sidebar is collapsed to its minimum width. Descendants read
     * the flag through container style queries. The width lives in the same
     * variant so only one width rule is ever emitted.
     */
    $collapsed: {
      true: "[--sidebar-collapsed:1] w-(--sidebar-min-width)",
      false: "[--sidebar-collapsed:0] w-(--sidebar-max-width)",
    },
    /**
     * Sizes the sidebar against its positioning context instead of the app
     * container, for the drawer, portalled away from it. Both heights live in
     * the same variant so only one height rule is ever emitted.
     */
    $fullHeight: {
      true: "h-full",
      false: "h-[100cqb]",
    },
    /**
     * Whether the sidebar moves between its states: the narrowing to the icon
     * rail, and the slide in and out of the page. Both durations live in the
     * same variant so only one duration rule is ever emitted. Off by default,
     * because a panel nothing opens would only ever slide in on load; the
     * component turns it on once the page has painted.
     */
    $animated: {
      true: "duration-300 motion-reduce:duration-0",
      false: "duration-0",
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
     * Sets the collapsed width. Numbers scale the spacing token. Nav rows size
     * their icon buttons against it.
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
    $animated: false,
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
  // The body fills the panel, so its content packs at the start rather than
  // spreading over the height.
  class: "flex-1 content-start overflow-y-auto overflow-x-clip",
});
