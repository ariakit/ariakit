/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import {
  Button,
  ButtonGlider,
  ButtonGroup,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  Shell,
  ShellFooter,
  ShellHeader,
  ShellHeaderCenter,
  ShellHeaderEnd,
  ShellHeaderStart,
  ShellMain,
  ShellMainBody,
  ShellMainIntro,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellSidebarHeader,
} from "@ariakit/ui/components/shell.ariakit.react";
import { Menu, PanelLeft, SwatchBook, X } from "lucide-react";
import type { ReactNode } from "react";
import { LogoIcon, Logotype } from "#app/icons/logo.react.tsx";

export interface SiteLink {
  href: string;
  label: string;
  current?: boolean;
}

export interface SiteNavigationGroup {
  label: string;
  links: SiteLink[];
}

export interface SiteHeading {
  slug: string;
  text: string;
  depth: number;
}

export interface SiteShellProps {
  currentUrl: string | URL;
  sections: SiteLink[];
  navigation: SiteNavigationGroup[];
  headings?: SiteHeading[];
  intro?: ReactNode;
  children?: ReactNode;
}

interface ThemeOption {
  value: string;
  label: string;
  swatch?: string;
}

// The inline script in the layout toggles panels by these ids, because the
// shell renders without hydration.
export const SITE_NAVIGATION_ID = "site-navigation";
export const SITE_DRAWER_ID = "site-drawer";
export const THEME_PANEL_ID = "site-theme";

// The first option of each setting is the default, which keeps the stylesheet
// value. The layout and preview scripts apply the others to the root element.
const THEME_MODES: ThemeOption[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const THEME_ACCENTS: ThemeOption[] = [
  { value: "blue", label: "Blue", swatch: "oklch(56.7% 0.1546 248.5156)" },
  { value: "violet", label: "Violet", swatch: "oklch(54% 0.2 293)" },
  { value: "green", label: "Green", swatch: "oklch(55% 0.14 155)" },
  { value: "orange", label: "Orange", swatch: "oklch(62% 0.18 45)" },
  { value: "pink", label: "Pink", swatch: "oklch(60% 0.2 355)" },
];

const THEME_RADII: ThemeOption[] = [
  { value: "default", label: "Default" },
  { value: "0.0625em", label: "Sharp" },
  { value: "0.5em", label: "Round" },
];

/**
 * The Ariakit site layout. An outer shell holds the page and a full-height
 * theme panel at the end. The inner shell holds the header, the site
 * navigation, the main content, a table of contents, and the footer.
 */
export function SiteShell({
  currentUrl,
  sections,
  navigation,
  headings = [],
  intro,
  children,
}: SiteShellProps) {
  const tocHeadings = headings.filter((heading) => heading.depth <= 3);
  return (
    <Shell>
      <Shell>
        <ShellHeader $height="sm" $blur className="text-sm">
          <ShellHeaderStart>
            <Button
              aria-label="Open menu"
              aria-expanded="false"
              aria-controls={SITE_DRAWER_ID}
              data-shell-toggle
              className="@3xl/shell:hidden"
            >
              <ButtonSlot>
                <Menu />
              </ButtonSlot>
            </Button>
            <Button
              aria-label="Toggle navigation"
              aria-expanded="true"
              aria-controls={SITE_NAVIGATION_ID}
              data-shell-toggle
              className="@max-3xl/shell:hidden"
            >
              <ButtonSlot>
                <PanelLeft />
              </ButtonSlot>
            </Button>
            <a
              href="/"
              aria-label="Ariakit"
              className="flex items-center gap-2 px-1"
            >
              <LogoIcon size="1.5em" />
              <Logotype size="1.25em" className="@max-xl/shell:hidden" />
            </a>
          </ShellHeaderStart>
          <ShellHeaderCenter className="@max-2xl/shell:hidden">
            <Nav
              $cover
              $layout="horizontal"
              aria-label="Main"
              glider={{ $kind: "bar", $animated: false }}
            >
              {sections.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  aria-current={link.current ? "page" : undefined}
                  className="font-medium"
                >
                  {link.label}
                </NavLink>
              ))}
            </Nav>
          </ShellHeaderCenter>
          <ShellHeaderEnd>
            {/* The phone menu holds the theme options below 48rem. A viewport
                query matches the outer shell, which spans the viewport. */}
            <Button
              aria-expanded="false"
              aria-controls={THEME_PANEL_ID}
              data-shell-toggle
              className="max-md:hidden"
            >
              <ButtonSlot>
                <SwatchBook />
              </ButtonSlot>
              <ButtonLabel className="@max-lg/shell:hidden">Theme</ButtonLabel>
            </Button>
          </ShellHeaderEnd>
        </ShellHeader>
        <ShellSidebar
          id={SITE_NAVIGATION_ID}
          render={<nav />}
          aria-label="Site"
          className="text-sm"
        >
          <ShellSidebarBody>
            <SiteNavigation currentUrl={currentUrl} groups={navigation} />
          </ShellSidebarBody>
        </ShellSidebar>
        {/* Below 48rem, a drawer replaces the sidebar and the header links. */}
        <ShellSidebar
          id={SITE_DRAWER_ID}
          open={false}
          $show="max-3xl"
          render={<nav />}
          aria-label="Menu"
          data-shell-transient
          className="text-sm"
        >
          <ShellSidebarHeader $height="sm" className="justify-between">
            <span className="font-medium">Menu</span>
            <Button
              aria-label="Close menu"
              aria-controls={SITE_DRAWER_ID}
              data-shell-close
            >
              <ButtonSlot>
                <X />
              </ButtonSlot>
            </Button>
          </ShellSidebarHeader>
          <ShellSidebarBody>
            <SiteNavigation
              currentUrl={currentUrl}
              groups={[{ label: "Sections", links: sections }, ...navigation]}
            />
            <div className="grid gap-6 px-3 pt-6 pb-3">
              <span className="ak-ink-70 text-xs font-medium">Theme</span>
              <ThemeOptions idPrefix={SITE_DRAWER_ID} />
            </div>
          </ShellSidebarBody>
        </ShellSidebar>
        <ShellMain
          $p="var(--site-gutter)"
          $maxWidth="56rem"
          className="[--site-gutter:--spacing(4)] @3xl/shell:[--site-gutter:--spacing(8)]"
        >
          {/* Children are direct grid items, so samples can use main bands. */}
          {intro && (
            <ShellMainIntro className="gap-y-4 pt-10 pb-6">
              {intro}
            </ShellMainIntro>
          )}
          <ShellMainBody className="gap-y-8 pb-16">{children}</ShellMainBody>
        </ShellMain>
        {tocHeadings.length > 0 && (
          <ShellSidebar
            $side="end"
            $width="sm"
            $from="body"
            $show="6xl"
            $border={false}
            $layer="transparent"
            render={<nav />}
            aria-label="On this page"
            className="text-sm"
          >
            <ShellSidebarBody>
              <p className="ak-ink-70 px-3 pb-2 text-xs font-medium uppercase">
                On this page
              </p>
              {/* The layout script marks the link of the section in view. */}
              <Nav
                $cover
                $gap={0.5}
                render={<div />}
                glider={{ $kind: "bar", $animated: false }}
                data-site-toc
              >
                {tocHeadings.map((heading) => (
                  <NavLink
                    key={heading.slug}
                    href={`#${heading.slug}`}
                    className={heading.depth > 2 ? "ps-6" : undefined}
                  >
                    {heading.text}
                  </NavLink>
                ))}
              </Nav>
            </ShellSidebarBody>
          </ShellSidebar>
        )}
        <ShellFooter
          className="text-sm"
          start={<span className="ak-ink-70">© Ariakit FZ-LLC</span>}
          end={
            <Nav $layout="horizontal" aria-label="Footer">
              {sections.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </Nav>
          }
        />
      </Shell>
      <ShellSidebar
        id={THEME_PANEL_ID}
        open={false}
        $side="end"
        $width="lg"
        render={<aside />}
        aria-label="Theme"
        className="text-sm"
      >
        <ShellSidebarHeader $height="sm" className="justify-between">
          <span className="font-medium">Theme</span>
          <Button
            aria-label="Close theme"
            aria-controls={THEME_PANEL_ID}
            data-shell-close
          >
            <ButtonSlot>
              <X />
            </ButtonSlot>
          </Button>
        </ShellSidebarHeader>
        <ShellSidebarBody className="grid content-start gap-6">
          <ThemeOptions idPrefix={THEME_PANEL_ID} />
        </ShellSidebarBody>
        <ShellSidebarFooter>
          <Button data-theme-reset className="w-full justify-center">
            Reset
          </Button>
        </ShellSidebarFooter>
      </ShellSidebar>
    </Shell>
  );
}

interface ThemeOptionsProps {
  idPrefix: string;
}

function ThemeOptions({ idPrefix }: ThemeOptionsProps) {
  return (
    <>
      <ThemeOptionGroup
        idPrefix={idPrefix}
        label="Mode"
        description="Applies to the site and every preview."
        setting="mode"
        options={THEME_MODES}
      />
      <ThemeOptionGroup
        idPrefix={idPrefix}
        label="Accent"
        description="Recolors brand surfaces, links, and focus rings."
        setting="accent"
        options={THEME_ACCENTS}
      />
      <ThemeOptionGroup
        idPrefix={idPrefix}
        label="Radius"
        description="Scales the corners of every component."
        setting="radius"
        options={THEME_RADII}
      />
    </>
  );
}

interface ThemeOptionGroupProps {
  idPrefix: string;
  label: string;
  description: string;
  setting: string;
  options: ThemeOption[];
}

function ThemeOptionGroup({
  idPrefix,
  label,
  description,
  setting,
  options,
}: ThemeOptionGroupProps) {
  const labelId = `${idPrefix}-${setting}-label`;
  const descriptionId = `${idPrefix}-${setting}-description`;
  return (
    <div className="grid gap-2">
      <span id={labelId} className="font-medium">
        {label}
      </span>
      <span id={descriptionId} className="ak-ink-70 text-xs">
        {description}
      </span>
      {/* The layout script moves the checked state and the tab stop. */}
      <ButtonGroup
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        data-theme-group={setting}
        $layer
        $rounded="lg"
        $p={0.5}
        className="w-full"
      >
        {options.map((option, index) => (
          <Button
            key={option.value}
            role="radio"
            aria-checked={index === 0}
            aria-label={option.swatch ? option.label : undefined}
            tabIndex={index === 0 ? 0 : -1}
            data-theme-setting={setting}
            data-theme-value={option.value}
            data-theme-swatch={option.swatch}
            className="flex-1 justify-center"
          >
            {option.swatch ? (
              <ButtonSlot>
                <span
                  aria-hidden
                  className="block size-4 rounded-full"
                  style={{ background: option.swatch }}
                />
              </ButtonSlot>
            ) : (
              option.label
            )}
          </Button>
        ))}
        <ButtonGlider />
      </ButtonGroup>
    </div>
  );
}

interface SiteNavigationProps {
  currentUrl: string | URL;
  groups: SiteNavigationGroup[];
}

function SiteNavigation({ currentUrl, groups }: SiteNavigationProps) {
  return (
    <Nav
      $cover
      list={false}
      render={<div />}
      glider={{ $kind: "bar", $animated: false }}
    >
      {groups.map((group) => (
        <NavGroup key={group.label}>
          <NavGroupLabel>{group.label}</NavGroupLabel>
          <NavList>
            {group.links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                // Links without an explicit current flag match the page URL.
                {...(link.current == null
                  ? { currentUrl }
                  : { "aria-current": link.current ? "page" : undefined })}
              >
                {link.label}
              </NavLink>
            ))}
          </NavList>
        </NavGroup>
      ))}
    </Nav>
  );
}
