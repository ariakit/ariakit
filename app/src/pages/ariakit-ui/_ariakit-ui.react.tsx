/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

// The hydrated blocks of the Ariakit UI gallery page. The Astro page owns the
// shell and mounts each of these as an island; the sections live in one file
// per component under _ariakit-ui/.
export { GalleryControls, GallerySidebar } from "./_ariakit-ui/shell.react.tsx";

export { LayerSection } from "./_ariakit-ui/layer.react.tsx";
export { FrameSection } from "./_ariakit-ui/frame.react.tsx";
export { ContainerSection } from "./_ariakit-ui/container.react.tsx";
export { TextSection } from "./_ariakit-ui/text.react.tsx";
export { HeadingSection } from "./_ariakit-ui/heading.react.tsx";
export { ProseSection } from "./_ariakit-ui/prose.react.tsx";
export { SeparatorSection } from "./_ariakit-ui/separator.react.tsx";
export { CodeSection } from "./_ariakit-ui/code.react.tsx";
export { KbdSection } from "./_ariakit-ui/kbd.react.tsx";
export { LinkSection } from "./_ariakit-ui/link.react.tsx";

export { ButtonSection } from "./_ariakit-ui/button.react.tsx";
export { ControlSection } from "./_ariakit-ui/control.react.tsx";
export { GliderSection } from "./_ariakit-ui/glider.react.tsx";
export { BadgeSection } from "./_ariakit-ui/badge.react.tsx";
export { InputSection } from "./_ariakit-ui/input.react.tsx";
export { CheckboxSection } from "./_ariakit-ui/checkbox.react.tsx";
export { RadioSection } from "./_ariakit-ui/radio.react.tsx";
export { SelectSection } from "./_ariakit-ui/select.react.tsx";

export { TabsSection } from "./_ariakit-ui/tabs.react.tsx";
export { DisclosureSection } from "./_ariakit-ui/disclosure.react.tsx";
export { NavSection } from "./_ariakit-ui/nav.react.tsx";
export { SidebarSection } from "./_ariakit-ui/sidebar.react.tsx";

export { ListSection } from "./_ariakit-ui/list.react.tsx";
export { TableSection } from "./_ariakit-ui/table.react.tsx";
export { ProgressSection } from "./_ariakit-ui/progress.react.tsx";

export { PopoverSection } from "./_ariakit-ui/popover.react.tsx";
export { DialogSection } from "./_ariakit-ui/dialog.react.tsx";
export { TooltipSection } from "./_ariakit-ui/tooltip.react.tsx";
