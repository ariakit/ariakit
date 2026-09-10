/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import * as ak from "@ariakit/react";
import {
  Button,
  ButtonGlider,
  ButtonGroup,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavButton,
  NavButtonContent,
  NavDisclosure,
  NavDisclosureButton,
  NavIcon,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  RadioGroup,
  RadioProvider,
} from "@ariakit/ui/components/radio.ariakit.react";
import {
  Tooltip,
  TooltipAnchor,
  TooltipProvider,
} from "@ariakit/ui/components/tooltip.ariakit.react";
import * as icons from "lucide-react";
import * as React from "react";
import { Logo } from "#app/icons/logo.react.tsx";
import type { GalleryGroupId } from "./sections.ts";
import {
  galleryBasePath,
  galleryGroups,
  getGallerySectionHref,
} from "./sections.ts";

// The settings live as data attributes on <html>, where the page CSS reads
// them, and are persisted under this prefix. The inline script in
// [...section].astro restores them before the first paint, so keep the prefix
// and the attribute names in step with it.
const STORAGE_PREFIX = "ariakit-ui-gallery:";

type GallerySetting = "theme" | "surface" | "font-size";

const listeners = new Set<() => void>();

function getRoot() {
  if (typeof document === "undefined") return null;
  return document.documentElement;
}

function readSetting(name: GallerySetting) {
  return getRoot()?.getAttribute(`data-${name}`) ?? null;
}

function writeSetting(name: GallerySetting, value: string | null) {
  const root = getRoot();
  if (!root) return;
  if (value == null) {
    root.removeAttribute(`data-${name}`);
  } else {
    root.setAttribute(`data-${name}`, value);
  }
  try {
    if (value == null) {
      localStorage.removeItem(`${STORAGE_PREFIX}${name}`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}${name}`, value);
    }
  } catch {
    // Storage can be unavailable; the attribute alone still applies the setting
    // for this page view.
  }
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The current value of a setting attribute. The server snapshot is empty, so
 * hydration matches the server markup and the restored value paints on the
 * first client render.
 */
function useSetting(name: GallerySetting) {
  return React.useSyncExternalStore(
    subscribe,
    () => readSetting(name),
    () => null,
  );
}

interface SettingOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface SettingGroupProps {
  name: GallerySetting;
  label: string;
  /** The option that means "no attribute", which is the page default. */
  fallback: string;
  options: readonly SettingOption[];
}

/**
 * One segmented control of the header: a radio group of icon buttons with a
 * glider under the checked one.
 */
function SettingGroup({ name, label, fallback, options }: SettingGroupProps) {
  const value = useSetting(name) ?? fallback;
  return (
    <RadioProvider
      value={value}
      setValue={(next) => {
        writeSetting(name, next === fallback ? null : String(next));
      }}
    >
      <ButtonGroup render={<RadioGroup aria-label={label} />} $border $layer>
        {options.map((option) => (
          <TooltipProvider key={option.value}>
            <TooltipAnchor
              render={
                <ak.Radio
                  value={option.value}
                  aria-label={option.label}
                  render={<Button $lightnessOffset={false} $px="sm" />}
                />
              }
            >
              <ButtonSlot>{option.icon}</ButtonSlot>
            </TooltipAnchor>
            <Tooltip>{option.label}</Tooltip>
          </TooltipProvider>
        ))}
        <ButtonGlider $state="selected" />
      </ButtonGroup>
    </RadioProvider>
  );
}

const themeOptions = [
  { value: "system", label: "System theme", icon: <icons.Monitor /> },
  { value: "light", label: "Light theme", icon: <icons.Sun /> },
  { value: "dark", label: "Dark theme", icon: <icons.Moon /> },
] satisfies readonly SettingOption[];

const surfaceOptions = [
  { value: "canvas", label: "Canvas surface", icon: <icons.Square /> },
  { value: "raised", label: "Raised surface", icon: <icons.Layers2 /> },
  { value: "inverted", label: "Inverted surface", icon: <icons.Contrast /> },
  { value: "tinted", label: "Brand-tinted surface", icon: <icons.Palette /> },
] satisfies readonly SettingOption[];

const fontSizeOptions = [
  { value: "sm", label: "Small text", icon: <icons.AArrowDown /> },
  { value: "md", label: "Default text", icon: <icons.ALargeSmall /> },
  { value: "lg", label: "Large text", icon: <icons.AArrowUp /> },
] satisfies readonly SettingOption[];

/**
 * The header toolbar that switches the color scheme, the surface the gallery
 * sits on and the root font size, so every sample can be checked in each
 * combination.
 */
export function GalleryControls() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SettingGroup
        name="theme"
        label="Color scheme"
        fallback="system"
        options={themeOptions}
      />
      <SettingGroup
        name="surface"
        label="Gallery surface"
        fallback="canvas"
        options={surfaceOptions}
      />
      <SettingGroup
        name="font-size"
        label="Text size"
        fallback="md"
        options={fontSizeOptions}
      />
    </div>
  );
}

const groupIcons = {
  foundations: icons.Shapes,
  controls: icons.ToggleLeft,
  navigation: icons.Compass,
  data: icons.Table,
  overlays: icons.SquareStack,
} satisfies Record<GalleryGroupId, icons.LucideIcon>;

export interface GallerySidebarProps {
  /** The current page URL, which marks the matching link as current. */
  currentUrl?: string;
}

interface GalleryNavigationProps extends GallerySidebarProps {
  children?: React.ReactNode;
}

function GalleryNavigation({ currentUrl, children }: GalleryNavigationProps) {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between">
        <NavButton render={<a href={galleryBasePath} />}>
          <NavIcon>
            <Logo iconOnly />
          </NavIcon>
          <NavButtonContent>Ariakit UI</NavButtonContent>
        </NavButton>
        {children}
      </div>
      <Nav className="min-h-0 flex-1 overflow-x-clip overflow-y-auto">
        {galleryGroups.map((group) => {
          const Icon = groupIcons[group.id];
          return (
            <NavDisclosure
              key={group.id}
              defaultOpen
              button={
                <NavDisclosureButton icon={<Icon strokeWidth={1.5} />}>
                  {group.title}
                </NavDisclosureButton>
              }
            >
              <NavList>
                {group.sections.map((section) => (
                  <li key={section.id}>
                    <NavLink
                      href={getGallerySectionHref(section.id)}
                      currentUrl={currentUrl}
                    >
                      {section.title}
                    </NavLink>
                  </li>
                ))}
              </NavList>
            </NavDisclosure>
          );
        })}
      </Nav>
    </>
  );
}

/**
 * Keeps the gallery navigation beside the page on desktop and opens it in a
 * modal dialog on mobile.
 */
export function GallerySidebar(props: GallerySidebarProps) {
  const store = ak.useDialogStore();

  React.useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    // Release the dialog's focus trap and scroll lock when the desktop panel
    // takes over. Keep this breakpoint in step with the layout classes.
    const onChange = () => {
      if (desktop.matches) {
        store.hide();
      }
    };
    onChange();
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [store]);

  // Keep nested rows rounded while the panel itself meets the viewport edge.
  const panelClass =
    "fixed inset-s-0 top-0 flex h-dvh w-(--gallery-sidebar-width) max-w-full flex-col gap-2 overflow-clip rounded-none border-e [--nav-icon-size:--spacing(5)]";

  return (
    <>
      <Frame
        render={<aside aria-label="Gallery sections" />}
        $p={2}
        $rounded="2xl"
        $lightnessOffset={0.5}
        className={`${panelClass} z-20 max-[768px]:hidden`}
      >
        <GalleryNavigation {...props} />
      </Frame>
      <ak.Dialog
        store={store}
        aria-label="Gallery sections"
        unmountOnHide
        render={<Frame $p={2} $rounded="2xl" $lightnessOffset={0.5} />}
        backdrop={<div className="bg-black/30 backdrop-blur-xs" />}
        className={`${panelClass} z-30`}
      >
        <GalleryNavigation {...props}>
          <ak.DialogDismiss
            render={<Button $p={2} />}
            aria-label="Close gallery sections"
          >
            <ButtonSlot>
              <icons.X />
            </ButtonSlot>
          </ak.DialogDismiss>
        </GalleryNavigation>
      </ak.Dialog>
      <ak.DialogDisclosure
        store={store}
        aria-label="Open gallery sections"
        render={<Button $kind="bevel" $rounded="full" $p={3} />}
        className="fixed! end-4 bottom-4 z-20 min-[768px]:hidden"
      >
        <ButtonSlot $size="lg">
          <icons.Menu />
        </ButtonSlot>
      </ak.DialogDisclosure>
    </>
  );
}
