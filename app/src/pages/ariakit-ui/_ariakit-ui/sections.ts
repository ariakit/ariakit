/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

export interface GallerySection {
  /** The section's anchor id, which is also its `@ariakit/ui` module name. */
  id: string;
  title: string;
  description: string;
}

export interface GalleryGroup {
  id: string;
  title: string;
  sections: readonly GallerySection[];
}

/**
 * The gallery's table of contents. The Astro page renders one `Section` per
 * entry and the sidebar builds its anchors from the same list, so a section
 * cannot exist in one place without the other.
 */
export const galleryGroups = [
  {
    id: "foundations",
    title: "Foundations",
    sections: [
      {
        id: "layer",
        title: "Layer",
        description:
          "The colored surface at the root of the relative color system. Every nested layer shifts away from its parent, and the modifiers tune lightness, chroma and hue.",
      },
      {
        id: "frame",
        title: "Frame",
        description:
          "Radius, padding, margin and borders on top of a layer, with nested frames staying concentric with the frame around them.",
      },
      {
        id: "container",
        title: "Container",
        description:
          "A centered column capped by a theme token, with an inherited gutter that an ancestor can set for every container below it.",
      },
      {
        id: "text",
        title: "Text",
        description:
          "Text color derived from the layer behind it, kept readable automatically and tuned by push, chroma, warmth and hue.",
      },
      {
        id: "heading",
        title: "Heading",
        description:
          "Heading elements sized by their own level, with a visual level override and flow margins that collapse after another heading.",
      },
      {
        id: "prose",
        title: "Prose",
        description:
          "Long-form content on a shared vertical rhythm, styling the plain markup that has no component of its own.",
      },
      {
        id: "separator",
        title: "Separator",
        description:
          "A rule between sections that reads the rhythm of the column around it.",
      },
      {
        id: "code",
        title: "Code",
        description:
          "An inline code chip drawn in em, so it scales with the text it sits in.",
      },
      {
        id: "kbd",
        title: "Kbd",
        description:
          "A key cap with a lit top edge and a shadowed lip, redrawn for dark layers.",
      },
      {
        id: "link",
        title: "Link",
        description:
          "An inline text link with a brand tint that lightens on dark layers, a hover underline and a focus ring held off the text line.",
      },
    ],
  },
  {
    id: "controls",
    title: "Controls",
    sections: [
      {
        id: "button",
        title: "Button",
        description:
          "Flat and bevel buttons across layers, sizes and radii, with the slot, content, label, description, group, separator and glider parts.",
      },
      {
        id: "control",
        title: "Control",
        description:
          "The row anatomy every control shares: slot kinds and sizes, content orientation, label truncation, description clamping, groups and separators.",
      },
      {
        id: "glider",
        title: "Glider",
        description:
          "The surface that glides between sibling controls to mark the selected, hovered or focused one, as a flat cover, a bevel or a bar.",
      },
      {
        id: "badge",
        title: "Badge",
        description:
          "A compact status chip, tinted by its layer, with size, radius and edge variants and an optional leading slot.",
      },
      {
        id: "input",
        title: "Input",
        description:
          "A text field that sinks into the surface around it, with edge weights, focus rings and wrapper compositions.",
      },
      {
        id: "checkbox",
        title: "Checkbox",
        description:
          "A native checkbox drawn by CSS, with mixed and disabled states, label rows with descriptions, and card-shaped labels with a check, slots, descriptions and a grid layout.",
      },
      {
        id: "radio",
        title: "Radio",
        description:
          "A native radio drawn by CSS, with groups, descriptions and disabled states, and card-shaped labels with a dot and a grid layout.",
      },
      {
        id: "select",
        title: "Select",
        description:
          "A select button with a chevron, icons and a badge mode, and a popover of items with checkmarks. The popover is also rendered open.",
      },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    sections: [
      {
        id: "tabs",
        title: "Tabs",
        description:
          "Folder tabs that merge into their panel, with border widths, edge colors, slots, separators and the tab glider in every state.",
      },
      {
        id: "disclosure",
        title: "Disclosure",
        description:
          "A button that reveals content, with indicators, icons, descriptions, guides, split layouts and groups.",
      },
      {
        id: "nav",
        title: "Nav",
        description:
          "Navigation rows with current, hover and disabled states, groups with labels, icons and collapsible sections.",
      },
      {
        id: "sidebar",
        title: "Sidebar",
        description:
          "A fixed side panel with header, body and footer sections that collapses to an icon rail. The page's own sidebar is the live instance.",
      },
    ],
  },
  {
    id: "data",
    title: "Data",
    sections: [
      {
        id: "list",
        title: "List",
        description:
          "Dashed, bulleted and numbered rows, blocks and sections rhythm, nesting, check and progress markers, guides and disclosure rows.",
      },
      {
        id: "table",
        title: "Table",
        description:
          "Declarative and composed tables, cell and container borders, sticky headers, horizontal scroll with a pinned column, numeric columns and hover rows.",
      },
      {
        id: "progress",
        title: "Progress",
        description:
          "Linear tracks and circular rings with a brand fill, at several values and thicknesses.",
      },
    ],
  },
  {
    id: "overlays",
    title: "Overlays",
    sections: [
      {
        id: "popover",
        title: "Popover",
        description:
          "A floating surface anchored to its disclosure, with heading, description, arrow and scroll parts. The open state is also rendered inline.",
      },
      {
        id: "dialog",
        title: "Dialog",
        description:
          "A modal surface over a blurred backdrop, with heading, description, dismiss and scroll parts. The open state is also rendered inline.",
      },
      {
        id: "tooltip",
        title: "Tooltip",
        description:
          "A small label that appears next to its anchor on hover and focus. The open state is also rendered inline.",
      },
    ],
  },
] as const satisfies readonly GalleryGroup[];

export type GalleryGroupId = (typeof galleryGroups)[number]["id"];

export type GallerySectionId =
  (typeof galleryGroups)[number]["sections"][number]["id"];

export interface GallerySectionEntry extends GallerySection {
  id: GallerySectionId;
  group: Pick<GalleryGroup, "id" | "title">;
}

export const gallerySections: readonly GallerySectionEntry[] =
  galleryGroups.flatMap((group) =>
    group.sections.map((section) => ({
      ...section,
      group: { id: group.id, title: group.title },
    })),
  );

/** The route of the overview page, which every section page hangs off. */
export const galleryBasePath = "/ariakit-ui/";

export function getGallerySectionHref(id: GallerySectionId) {
  return `${galleryBasePath}${id}/`;
}

export function isGallerySectionId(id: unknown): id is GallerySectionId {
  return gallerySections.some((section) => section.id === id);
}

export function getGallerySection(id: GallerySectionId) {
  const section = gallerySections.find((section) => section.id === id);
  if (!section) {
    throw new Error(`Unknown gallery section: ${id}`);
  }
  return section;
}
