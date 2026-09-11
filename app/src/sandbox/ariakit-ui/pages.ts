/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { invariant } from "@ariakit/utils";

// Pure data shared by the React app and the Playwright tests. Keep this module
// free of React, CSS and Node imports.

/**
 * The settings live as data attributes on `<html>`, where `style.css` and the
 * surface classes read them, and are persisted under this prefix. The inline
 * script that `shell.react.tsx` renders restores them before the first paint,
 * and the header controls in the same file write them, so keep them in step.
 */
export const GALLERY_STORAGE_PREFIX = "ariakit-ui-gallery:";

/** The settings the header controls switch, in their `data-` attribute form. */
export const GALLERY_SETTINGS = [
  "theme",
  "surface",
  "font-size",
  "code",
] as const;

export type GallerySetting = (typeof GALLERY_SETTINGS)[number];

/**
 * Marks the one element per page that the screenshot suite moves real keyboard
 * focus to before it captures, so every baseline shows one focus ring. Pages
 * must never set Ariakit's internal focus markers instead.
 */
export const SCREENSHOT_FOCUS_ATTRIBUTE = "data-screenshot-focus";

export interface GalleryGroup {
  id: string;
  title: string;
}

/**
 * The sidebar's table of contents. `fixtures` is last and collapsed, because
 * its pages exist for regression tests rather than for browsing.
 */
export const galleryGroups = [
  { id: "foundations", title: "Foundations" },
  { id: "controls", title: "Controls" },
  { id: "navigation", title: "Navigation" },
  { id: "data", title: "Data" },
  { id: "overlays", title: "Overlays" },
  { id: "fixtures", title: "Regression fixtures" },
] as const satisfies readonly GalleryGroup[];

export type GalleryGroupId = (typeof galleryGroups)[number]["id"];

export interface GalleryPage {
  /** The hash route segment, which is also the page module's file name. */
  id: string;
  title: string;
  description: string;
  group: GalleryGroupId;
  /**
   * `showcase` pages are captured in every setting by the screenshot suite.
   * `fixture` pages hold regression-only scenarios and are captured once, in
   * the light canvas setting.
   */
  kind: "showcase" | "fixture";
}

const pages = [
  {
    id: "heading",
    title: "Heading",
    group: "foundations",
    kind: "showcase",
    description:
      "Heading and HeadingLevel. The HeadingLevel context sets the element (h1 to h6), and the element sets the size. The $level variant changes the size without changing the element. Flow margins space headings in running text.",
  },
  {
    id: "prose",
    title: "Prose",
    group: "foundations",
    kind: "showcase",
    description:
      "Long-form content on a shared, em-based vertical rhythm. Prose sets the type size its children scale with and styles the plain markup that has no component of its own (paragraphs, list items and strong). The List and Separator pages show how those components read its gap.",
  },
  {
    id: "separator",
    title: "Separator",
    group: "foundations",
    kind: "showcase",
    description:
      "A horizontal rule between sections. It adds half the rhythm of the prose column around it, removes the top margin of the next element, and paints in the edge color of the surface it sits on.",
  },
  {
    id: "code",
    title: "Code",
    group: "foundations",
    kind: "showcase",
    description:
      "An inline code chip drawn in em. It scales with the text it sits in and stays visibly separate from the surface under it in both themes. A neutral chip keeps the ink of the text around it, and a colored or inverted chip takes the ink of its own surface.",
  },
  {
    id: "kbd",
    title: "Kbd",
    group: "foundations",
    kind: "showcase",
    description:
      "A key cap drawn in em, so it scales with the text around it. It has a lit top edge and a shadowed lip, drawn for the lightness of its own face, so an inverted or colored cap still reads as a key on any surface.",
  },
  {
    id: "link",
    title: "Link",
    group: "foundations",
    kind: "showcase",
    description:
      "An inline text link with a brand tint and an underline that thickens on hover. Its padding grows the hit area and holds the focus ring off its own text, and its tint lightens on dark layers.",
  },
  {
    id: "button",
    title: "Button",
    group: "controls",
    kind: "showcase",
    description:
      "Buttons in the flat and bevel kinds, with layer colors, sizes, slots, label and description content, and disabled states. Also button groups, separators, gliders that follow a checked radio or the current link, and buttons on nested surfaces.",
  },
  {
    id: "badge",
    title: "Badge",
    group: "controls",
    kind: "showcase",
    description:
      "A compact status chip that is not interactive. A plain badge lifts off its surface. A colored badge tints toward its color and gets a matching ring and text. Slots add an icon, a dot, an avatar or a count.",
  },
  {
    id: "input",
    title: "Input",
    group: "controls",
    kind: "showcase",
    description:
      "A bordered text field. Input renders a native input by default. Through render it can also style a textarea, a wrapper that holds a native input next to icons, prefixes or buttons, or a button that looks like an empty field.",
  },
  {
    id: "checkbox",
    title: "Checkbox",
    group: "controls",
    kind: "showcase",
    description:
      "A native checkbox drawn by CSS, the label row that pairs it with a label and a description, and card-shaped labels with a check, slots, descriptions and a grid layout.",
  },
  {
    id: "radio",
    title: "Radio",
    group: "controls",
    kind: "showcase",
    description:
      "Native radio inputs drawn by CSS: in label rows with descriptions, inline in a line of text, and in card-shaped labels. A card can show its dot in the row or as a check mark, and a tile card stacks an icon over its label.",
  },
  {
    id: "combobox",
    title: "Combobox",
    group: "controls",
    kind: "showcase",
    description:
      "A text input that suggests items in a popover, with groups, rich item content and an empty state. ComboboxSelect is a select button whose popover lists items with checkmarks, icons, a badge mode, multiple selection and search.",
  },
  {
    id: "tabs",
    title: "Tabs",
    group: "navigation",
    kind: "showcase",
    description:
      "Folder tabs that merge into their panel, plus flat and bevel kinds, gliders, edges, slots, separators, a right-to-left strip and a strip that overflows.",
  },
  {
    id: "disclosure",
    title: "Disclosure",
    group: "navigation",
    kind: "showcase",
    description:
      "A button that reveals content. Each box shows one disclosure configuration: surfaces, indicator placement, icons and descriptions, content layouts, groups, composition and direction.",
  },
  {
    id: "nav",
    title: "Nav",
    group: "navigation",
    kind: "showcase",
    description:
      "Navigation rows with current and disabled states, icons, labeled groups, collapsible and nested sections, gliders that follow the current, hovered or focused row, and right-to-left layouts.",
  },
  {
    id: "list",
    title: "List",
    group: "data",
    kind: "showcase",
    description:
      "Ordered, unordered and bulleted rows with inline, blocks and sections rhythm, nested lists, guides, check and progress markers, and framed, link and disclosure rows.",
  },
  {
    id: "table",
    title: "Table",
    group: "data",
    kind: "showcase",
    description:
      "Tables built from declarative rows or from composed parts. The page shows inherited border channels, head bands, sticky row groups, pinned columns, sortable headers, and selected and focused rows.",
  },
  {
    id: "progress",
    title: "Progress",
    group: "data",
    kind: "showcase",
    description:
      "Linear bars and circular rings that show how far a task has progressed. A brand fill sits over a track that lifts off the surface under it, and the ring's center paints that surface back.",
  },
  {
    id: "popover",
    title: "Popover",
    group: "overlays",
    kind: "showcase",
    description:
      "A floating surface anchored to its disclosure. It lifts off the surface behind it and separates from it with an adaptive edge (a ring over light surfaces, a border over dark ones) and a shadow. Every popover on this page starts open inline, and its disclosure still closes and reopens it.",
  },
  {
    id: "dialog",
    title: "Dialog",
    group: "overlays",
    kind: "showcase",
    description:
      "A modal surface over a blurred backdrop, with heading, description, dismiss and scroll parts. Every box renders its disclosure closed. Open one to see the dialog, the way a user would.",
  },
  {
    id: "tooltip",
    title: "Tooltip",
    group: "overlays",
    kind: "showcase",
    description:
      "A small label next to its anchor that appears on hover and keyboard focus. Every styled example is held open inline so that the page screenshots show it. The last box shows the live hover and focus behavior.",
  },
  {
    id: "button-fixtures",
    title: "Button fixtures",
    group: "fixtures",
    kind: "fixture",
    description:
      "Regression-only Button and ButtonGroup scenarios, migrated from the button-group-layout sandbox.",
  },
  {
    id: "checkbox-fixtures",
    title: "Checkbox fixtures",
    group: "fixtures",
    kind: "fixture",
    description:
      "Regression-only Checkbox scenarios: a right-to-left tile card with mirrored geometry, and a badge inside a tile that keeps its own slot spacing.",
  },
  {
    id: "combobox-fixtures",
    title: "Combobox fixtures",
    group: "fixtures",
    kind: "fixture",
    description:
      "Regression-only Combobox and ComboboxSelect scenarios, migrated from the combobox-item-highlight, combobox-select-content and input-combobox-optional-props sandboxes.",
  },
  {
    id: "disclosure-fixtures",
    title: "Disclosure fixtures",
    group: "fixtures",
    kind: "fixture",
    description:
      "Regression-only Disclosure scenarios, migrated from the disclosure-button-store and disclosure-optional-content sandboxes.",
  },
  {
    id: "layer-fixtures",
    title: "Layer fixtures",
    group: "fixtures",
    kind: "fixture",
    description:
      "Regression-only Layer, Frame and Text scenarios, migrated from the layer-color-values sandbox. These three components have no showcase page of their own.",
  },
  {
    id: "list-fixtures",
    title: "List fixtures",
    group: "fixtures",
    kind: "fixture",
    description:
      "Regression-only List scenarios, migrated from the list-disclosure-optional-button and list-item-marker-checked sandboxes.",
  },
  {
    id: "nav-fixtures",
    title: "Nav fixtures",
    group: "fixtures",
    kind: "fixture",
    description:
      "Regression-only Nav scenarios, migrated from the nav-interactions sandbox.",
  },
  {
    id: "progress-fixtures",
    title: "Progress fixtures",
    group: "fixtures",
    kind: "fixture",
    description:
      "Regression-only Progress scenarios: a bar and a ring whose value changes on demand.",
  },
  {
    id: "table-fixtures",
    title: "Table fixtures",
    group: "fixtures",
    kind: "fixture",
    description:
      "Regression-only Table scenarios, migrated from the table-cell-layer and table-rows sandboxes, plus element values in declarative rows.",
  },
  {
    id: "tabs-fixtures",
    title: "Tabs fixtures",
    group: "fixtures",
    kind: "fixture",
    description:
      "Regression-only Tabs scenarios, migrated from the tab-panel-shared-store sandbox.",
  },
] as const satisfies readonly GalleryPage[];

export type GalleryPageId = (typeof pages)[number]["id"];

export interface GalleryPageEntry extends GalleryPage {
  id: GalleryPageId;
}

export const galleryPages: readonly GalleryPageEntry[] = pages;

export const showcasePages = galleryPages.filter(
  (page) => page.kind === "showcase",
);

export const fixturePages = galleryPages.filter(
  (page) => page.kind === "fixture",
);

/**
 * The index page of the gallery. It renders at `#/`, and when the URL has no
 * route hash.
 */
export const overviewPage = {
  title: "Component gallery",
  description:
    "Every @ariakit/ui React component, rendered through as many of its variants as the recipes expose, one page per component. The shell around them is built from the same components. Switch the color scheme, the surface and the text size from the header to check every example in each combination.",
};

// Only hashes with this prefix are routes. Any other hash is an in-page anchor,
// such as the placeholder links in the examples, and keeps the current page.
const ROUTE_HASH_PREFIX = "#/";

export function getGalleryHref(id?: GalleryPageId) {
  return `${ROUTE_HASH_PREFIX}${id ?? ""}`;
}

/**
 * Reads the page from a location hash: a page id, `undefined` for the overview
 * (including an unknown id), or `null` for a hash that is not a route.
 */
export function parseGalleryHash(hash: string) {
  if (!hash.startsWith(ROUTE_HASH_PREFIX)) return null;
  const id = hash.slice(ROUTE_HASH_PREFIX.length);
  return isGalleryPageId(id) ? id : undefined;
}

export function isGalleryPageId(value: unknown): value is GalleryPageId {
  return galleryPages.some((page) => page.id === value);
}

export function getGalleryPage(id: GalleryPageId) {
  const page = galleryPages.find((entry) => entry.id === id);
  invariant(page, `Unknown Ariakit UI gallery page: ${id}`);
  return page;
}

export function getGalleryGroupPages(group: GalleryGroupId) {
  return galleryPages.filter((page) => page.group === group);
}
