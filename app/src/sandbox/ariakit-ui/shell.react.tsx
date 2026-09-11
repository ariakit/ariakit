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
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonGlider,
  ButtonGroup,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
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
import { RadioProvider } from "@ariakit/ui/components/radio.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import {
  Tooltip,
  TooltipAnchor,
  TooltipProvider,
} from "@ariakit/ui/components/tooltip.ariakit.react";
import * as icons from "lucide-react";
import * as React from "react";
import { Logo } from "#app/icons/logo.react.tsx";
import type { GalleryGroupId, GalleryPageId, GallerySetting } from "./pages.ts";
import {
  GALLERY_SETTINGS,
  GALLERY_STORAGE_PREFIX,
  galleryGroups,
  getGalleryGroupPages,
  getGalleryHref,
  getGalleryPage,
  overviewPage,
} from "./pages.ts";

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
      localStorage.removeItem(`${GALLERY_STORAGE_PREFIX}${name}`);
    } else {
      localStorage.setItem(`${GALLERY_STORAGE_PREFIX}${name}`, value);
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
      {/*
        The radio group is the element, so the toolbar reads as a radiogroup
        rather than a group of radios. ButtonGroup only lends its styles.
      */}
      <ak.RadioGroup aria-label={label} render={<ButtonGroup $border $layer />}>
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
      </ak.RadioGroup>
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

const codeOptions = [
  { value: "shown", label: "Show code snippets", icon: <icons.Code /> },
  { value: "hidden", label: "Hide code snippets", icon: <icons.EyeOff /> },
] satisfies readonly SettingOption[];

const fontSizeOptions = [
  { value: "sm", label: "Small text", icon: <icons.AArrowDown /> },
  { value: "md", label: "Default text", icon: <icons.ALargeSmall /> },
  { value: "lg", label: "Large text", icon: <icons.AArrowUp /> },
] satisfies readonly SettingOption[];

/**
 * The header toolbar that switches the color scheme, the surface the gallery
 * sits on and the root font size, so every example can be checked in each
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
      <SettingGroup
        name="code"
        label="Code snippets"
        fallback="shown"
        options={codeOptions}
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
  fixtures: icons.FlaskConical,
} satisfies Record<GalleryGroupId, icons.LucideIcon>;

interface GalleryNavigationProps {
  /** The current page URL, which marks the matching link as current. */
  currentUrl?: string;
  /** Called when a link changes the page. */
  onNavigate?: () => void;
  children?: React.ReactNode;
}

function GalleryNavigation({
  currentUrl,
  onNavigate,
  children,
}: GalleryNavigationProps) {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between">
        <NavButton render={<a href={getGalleryHref()} onClick={onNavigate} />}>
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
          // The regression fixtures are test targets rather than something to
          // browse, so their group starts collapsed.
          const defaultOpen = group.id !== "fixtures";
          return (
            <NavDisclosure
              key={group.id}
              defaultOpen={defaultOpen}
              button={
                <NavDisclosureButton icon={<Icon strokeWidth={1.5} />}>
                  {group.title}
                </NavDisclosureButton>
              }
            >
              <NavList>
                {getGalleryGroupPages(group.id).map((page) => (
                  <li key={page.id}>
                    <NavLink
                      href={getGalleryHref(page.id)}
                      currentUrl={currentUrl}
                      onClick={onNavigate}
                    >
                      {page.title}
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

export interface GallerySidebarProps extends Omit<
  GalleryNavigationProps,
  "onNavigate"
> {}

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
      {/*
        The desktop panel has no z-index: the content column is padded clear of
        it, and a modal opened from a page (z-10) must cover it with its
        backdrop.
      */}
      <Frame
        render={<aside aria-label="Gallery sections" />}
        $p={2}
        $rounded="2xl"
        $lightnessOffset={0.5}
        className={`${panelClass} max-[768px]:hidden`}
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
        {/*
         * A link only changes the hash, so no new document closes the dialog.
         */}
        <GalleryNavigation {...props} onNavigate={store.hide}>
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

// The surface the gallery sits on, switched from the header controls through
// the data-surface attribute on <html>. Classes rather than layer variants,
// because a variant writes an inline style that no attribute can gate.
const surfaceClass = [
  "flex-1",
  "[[data-surface=raised]_&]:ak-layer-10",
  "[[data-surface=inverted]_&]:ak-layer-80",
  "[[data-surface=tinted]_&]:ak-layer-brand [[data-surface=tinted]_&]:ak-layer-mix-20",
].join(" ");

const columnClass = "mx-auto w-[calc(100%---spacing(12))] max-w-wider";

// Restores the persisted settings while the server markup is still parsing, so
// the theme, the surface and the text size never flash before hydration. The
// render-blocking stylesheet holds the first paint, and the island markup that
// follows this script paints with the restored attributes.
const restoreSettingsScript = `(() => {
  try {
    const root = document.documentElement;
    for (const name of ${JSON.stringify(GALLERY_SETTINGS)}) {
      const value = localStorage.getItem(${JSON.stringify(GALLERY_STORAGE_PREFIX)} + name);
      if (value) root.setAttribute("data-" + name, value);
    }
  } catch {}
})();`;

interface GalleryShellProps {
  /** The current page, or undefined on the overview. */
  pageId?: GalleryPageId;
  children?: React.ReactNode;
}

export function GalleryShell({ pageId, children }: GalleryShellProps) {
  const page = pageId ? getGalleryPage(pageId) : undefined;
  const group = galleryGroups.find((entry) => entry.id === page?.group);
  const title = page?.title ?? overviewPage.title;
  const description = page?.description ?? overviewPage.description;
  // Overlays that portal (tooltips, dialogs, combobox popovers) render inside
  // main, so they lift from the gallery surface like the inline boxes do. The
  // surface cannot move to <body>: ui.css paints the canvas there unlayered.
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

  return (
    <div
      id="top"
      className="min-h-dvh overflow-x-clip [--gallery-header-height:--spacing(14)] [--gallery-sidebar-width:--spacing(64)]"
    >
      {/*
        The browser runs this script while it parses the server markup.
        Hydration keeps the element and does not run it again.
      */}
      <script dangerouslySetInnerHTML={{ __html: restoreSettingsScript }} />
      <GallerySidebar currentUrl={getGalleryHref(pageId)} />
      <div className="flex min-h-dvh flex-col min-[768px]:ps-(--gallery-sidebar-width)">
        <Layer
          render={<header />}
          className="sticky top-0 z-10 flex min-h-(--gallery-header-height) items-center border-b"
        >
          <div
            className={`${columnClass} flex flex-wrap items-center gap-x-4 gap-y-2 py-1`}
          >
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-2"
            >
              {page && group ? (
                <>
                  <Link href={getGalleryHref()} className="font-medium">
                    {overviewPage.title}
                  </Link>
                  <span aria-hidden="true" className="ak-ink-40">
                    /
                  </span>
                  <span className="ak-ink-60 max-[768px]:hidden">
                    {group.title}
                  </span>
                  <span
                    aria-hidden="true"
                    className="ak-ink-40 max-[768px]:hidden"
                  >
                    /
                  </span>
                  <span aria-current="page" className="truncate font-medium">
                    {page.title}
                  </span>
                </>
              ) : (
                <>
                  <span aria-current="page" className="truncate font-medium">
                    {overviewPage.title}
                  </span>
                  <Badge $layer="brand" className="max-[768px]:hidden">
                    <BadgeLabel>Manual visual tests</BadgeLabel>
                  </Badge>
                </>
              )}
            </nav>
            <div className="ms-auto flex items-center">
              <GalleryControls />
            </div>
          </div>
        </Layer>

        {/*
          main itself is the portal root, so each portal node is a new child
          created on open. A wrapper that exists at load would be in every held
          popover's snapshot and carry their outside marks, which makes any
          overlay portaled into it ignore Escape.
          https://github.com/ariakit/ariakit/issues/7463
        */}
        <Layer render={<main />} ref={setPortalRoot} className={surfaceClass}>
          <div className={`${columnClass} grid gap-12 py-14 max-[768px]:pb-24`}>
            <HeadingLevel level={1}>
              <div className="grid gap-4">
                <Text
                  $text="brand"
                  render={<p />}
                  className="text-sm font-medium"
                >
                  {group?.title ?? "Ariakit UI"}
                </Text>
                <Heading className="mt-0 mb-0 text-balance">{title}</Heading>
                <p className="ak-ink-70 max-w-3xl text-lg text-pretty">
                  {description}
                </p>
              </div>
            </HeadingLevel>
            {/* The page heading is the h1, so every example box is an h2. */}
            <ak.PortalContext.Provider value={portalRoot}>
              <HeadingLevel level={2}>{children}</HeadingLevel>
            </ak.PortalContext.Provider>
          </div>
        </Layer>

        <Layer render={<footer />} className="border-t">
          <div
            className={`${columnClass} flex flex-wrap items-center gap-x-6 gap-y-2 py-6 text-sm`}
          >
            <p className="ak-ink-70">
              The components live in{" "}
              <Link href="https://github.com/ariakit/ariakit/tree/main/packages/ariakit-ui">
                packages/ariakit-ui
              </Link>{" "}
              and this gallery in{" "}
              <Link href="https://github.com/ariakit/ariakit/tree/main/app/src/sandbox/ariakit-ui">
                app/src/sandbox/ariakit-ui
              </Link>
              .
            </p>
            <Link href="#top" className="ms-auto">
              Back to top
            </Link>
          </div>
        </Layer>
      </div>
    </div>
  );
}
