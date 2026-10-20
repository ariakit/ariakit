import * as ak from "@ariakit/react";
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonGlider,
  ButtonGroup,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import { Layer } from "@ariakit/ui/components/layer.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { List, ListItem } from "@ariakit/ui/components/list.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellFooter,
  ShellHeader,
  ShellHeaderCenter,
  ShellHeaderEnd,
  ShellMain,
  ShellMainBody,
  ShellMainHeader,
  ShellMainIntro,
  ShellMainPopout,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellSidebarHeader,
} from "@ariakit/ui/components/shell.ariakit.react";
import { Text } from "@ariakit/ui/components/text.ariakit.react";
import { ChevronRight, Hexagon, Palette, PanelLeft, X } from "lucide-react";
import { useId, useState } from "react";

export default function Example() {
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [appliedTheme, setAppliedTheme] = useState(defaultTheme);
  const [draftTheme, setDraftTheme] = useState(defaultTheme);
  const navigationId = useId();
  const customizeId = useId();

  const setDraft = (update: Partial<ThemeOptions>) => {
    setDraftTheme((current) => ({ ...current, ...update }));
  };
  const applyTheme = () => {
    setAppliedTheme(draftTheme);
    setCustomizeOpen(false);
  };
  // Closing discards unapplied changes.
  const closeCustomize = () => {
    setDraftTheme(appliedTheme);
    setCustomizeOpen(false);
  };

  return (
    <Shell>
      <Shell $size={appliedTheme.density === "compact" ? "sm" : "md"}>
        <ShellHeader
          $blur
          $height="sm"
          start={
            <>
              <Button
                className="@max-3xl/shell:hidden"
                aria-label="Toggle navigation"
                aria-expanded={navigationOpen}
                aria-controls={navigationId}
                onClick={() => setNavigationOpen((open) => !open)}
              >
                <ButtonSlot>
                  <PanelLeft />
                </ButtonSlot>
              </Button>
              <a href="#" className="flex items-center gap-2 font-semibold">
                <Text
                  $text="brand"
                  $textHue={appliedTheme.accent.hue}
                  render={<span />}
                  className="flex"
                >
                  <Hexagon strokeWidth={1.5} className="size-5" />
                </Text>
                Forge UI
              </a>
            </>
          }
          center={
            <ShellHeaderCenter>
              <Nav
                $layout="horizontal"
                aria-label="Main"
                glider={[{ $kind: "flat" }, { $kind: "bar" }]}
                className="@max-4xl/shell:hidden"
              >
                {topLinks.map((link, index) => (
                  <NavLink
                    key={link}
                    href="#"
                    aria-current={index === 0 ? "page" : undefined}
                  >
                    {link}
                  </NavLink>
                ))}
              </Nav>
            </ShellHeaderCenter>
          }
          end={
            <ShellHeaderEnd>
              <Button
                className="@max-3xl/shell:hidden"
                aria-expanded={customizeOpen}
                aria-controls={customizeId}
                onClick={() => {
                  if (customizeOpen) {
                    closeCustomize();
                  } else {
                    setCustomizeOpen(true);
                  }
                }}
              >
                <ButtonSlot>
                  <Palette />
                </ButtonSlot>
                <ButtonLabel>Customize</ButtonLabel>
              </Button>
            </ShellHeaderEnd>
          }
        />

        <ShellSidebar
          id={navigationId}
          open={navigationOpen}
          aria-label="Documentation"
          render={<nav />}
        >
          <ShellSidebarBody>
            <Nav
              list={false}
              render={<div />}
              glider={[
                { $kind: "flat" },
                { $kind: "bar", $barOffset: "center" },
              ]}
            >
              {navigationGroups.map((group) => (
                <NavGroup key={group.label}>
                  <NavGroupLabel>{group.label}</NavGroupLabel>
                  <NavList>
                    {group.links.map((link) => (
                      <NavLink
                        key={link}
                        href="#"
                        aria-current={link === currentPage ? "page" : undefined}
                      >
                        {link}
                      </NavLink>
                    ))}
                  </NavList>
                </NavGroup>
              ))}
            </Nav>
          </ShellSidebarBody>
        </ShellSidebar>

        <ShellMain>
          <ShellMainHeader $blur $show="max-6xl">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 text-sm">
                <li className="ak-ink-70">Components</li>
                <li aria-hidden className="ak-ink-70">
                  <ChevronRight className="size-3.5" />
                </li>
                <li aria-current="page">Combobox</li>
              </ol>
            </nav>
          </ShellMainHeader>

          <ShellMainIntro>
            <Prose>
              <HeadingLevel level={1}>
                <Heading>Combobox</Heading>
              </HeadingLevel>
              <p>
                A text input with a filterable list of options. Use it when a
                select is too long to scan, or when users need to type to find
                an option.
              </p>
            </Prose>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge}>
                  <BadgeLabel>{badge}</BadgeLabel>
                </Badge>
              ))}
            </div>
          </ShellMainIntro>

          <ShellMainBody>
            <section id="overview">
              <Prose>
                <HeadingLevel level={2}>
                  <Heading>Overview</Heading>
                </HeadingLevel>
                <p>
                  The combobox keeps focus in the input while the list filters.
                  Options can be static or loaded from a server as the user
                  types.
                </p>
                <p>
                  Selection is single by default. Pass a multiple flag to keep
                  the list open and show each selected value as a chip.
                </p>
              </Prose>
            </section>

            <ShellMainPopout>
              <Frame
                $layer
                $rounded="xl"
                $p={4}
                $border
                $hue={appliedTheme.accent.hue}
                className="flex flex-col gap-3"
              >
                <p className="ak-ink-70 text-sm">Preview</p>
                <Input aria-label="Search fruit" placeholder="Search fruit" />
                <ul className="flex flex-col gap-1 text-sm">
                  {previewOptions.map((option) => (
                    <li key={option} className="rounded-md px-3 py-2">
                      {option}
                    </li>
                  ))}
                </ul>
              </Frame>
            </ShellMainPopout>

            <section id="usage">
              <Prose>
                <HeadingLevel level={2}>
                  <Heading>Usage</Heading>
                </HeadingLevel>
                <p>
                  Render the input and its options as children. The component
                  handles focus, filtering, and the active option.
                </p>
                <Frame
                  render={<pre />}
                  $layer
                  $rounded="lg"
                  $p={3}
                  $border
                  className="overflow-x-auto text-sm"
                >
                  <code>{`<Combobox placeholder="Search fruit">
  <ComboboxItem value="Apple" />
  <ComboboxItem value="Banana" />
</Combobox>`}</code>
                </Frame>
                <p>
                  Give each option a text value. The filter matches that value,
                  so keep labels short and unique.
                </p>
              </Prose>
            </section>

            <section id="keyboard">
              <Prose>
                <HeadingLevel level={2}>
                  <Heading>Keyboard</Heading>
                </HeadingLevel>
                <List>
                  <ListItem>
                    <Kbd>ArrowDown</Kbd> opens the list and moves to the next
                    option.
                  </ListItem>
                  <ListItem>
                    <Kbd>Enter</Kbd> selects the active option.
                  </ListItem>
                  <ListItem>
                    <Kbd>Escape</Kbd> closes the list and clears the filter.
                  </ListItem>
                </List>
              </Prose>
            </section>
          </ShellMainBody>
        </ShellMain>

        <ShellSidebar
          $side="end"
          $width="sm"
          $from="body"
          $border={false}
          $show="5xl"
          aria-label="On this page"
          render={<nav />}
        >
          <ShellSidebarBody>
            <Nav render={<div />} list={false}>
              <NavGroup>
                <NavGroupLabel>On this page</NavGroupLabel>
                <NavList>
                  {tocItems.map((item) => (
                    <NavLink key={item.id} href={`#${item.id}`}>
                      {item.title}
                    </NavLink>
                  ))}
                </NavList>
              </NavGroup>
            </Nav>
          </ShellSidebarBody>
        </ShellSidebar>

        <ShellFooter
          start={<span className="ak-ink-70">© 2026 Forge UI</span>}
          end={<Link href="#">Release notes</Link>}
        />
      </Shell>

      <ShellSidebar
        id={customizeId}
        open={customizeOpen}
        $side="end"
        $width="lg"
        aria-label="Customize"
        render={<aside />}
      >
        <ShellSidebarHeader>
          <div className="flex w-full items-center justify-between gap-2">
            <HeadingLevel level={2}>
              <ak.Heading className="text-base font-medium">
                Customize
              </ak.Heading>
            </HeadingLevel>
            <Button aria-label="Close" onClick={closeCustomize}>
              <ButtonSlot>
                <X />
              </ButtonSlot>
            </Button>
          </div>
        </ShellSidebarHeader>

        <ShellSidebarBody>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Accent</p>
              <ak.RadioProvider
                value={draftTheme.accent.hue}
                setValue={(value) => {
                  const match = accents.find((accent) => accent.hue === value);
                  if (match) {
                    setDraft({ accent: match });
                  }
                }}
              >
                <ak.RadioGroup
                  aria-label="Accent"
                  render={<div className="flex gap-2" />}
                >
                  {accents.map((accent) => (
                    <ak.Radio
                      key={accent.hue}
                      value={accent.hue}
                      aria-label={accent.name}
                      className="size-8 justify-center rounded-full p-0 aria-[checked=true]:ring-2 aria-[checked=true]:ring-current"
                      // Renders the radio role before hydration.
                      type="button"
                      render={<Button />}
                    >
                      <Layer
                        $layer="brand"
                        $hue={accent.hue}
                        className="size-5 shrink-0 rounded-full"
                      />
                    </ak.Radio>
                  ))}
                </ak.RadioGroup>
              </ak.RadioProvider>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Density</p>
              <ak.RadioProvider
                value={draftTheme.density}
                setValue={(value) => {
                  if (value === "compact" || value === "comfortable") {
                    setDraft({ density: value });
                  }
                }}
              >
                <ak.RadioGroup aria-label="Density" render={<ButtonGroup />}>
                  <ak.Radio
                    value="compact"
                    // Renders the radio role before hydration.
                    type="button"
                    render={<Button />}
                  >
                    <ButtonLabel>Compact</ButtonLabel>
                  </ak.Radio>
                  <ak.Radio
                    value="comfortable"
                    // Renders the radio role before hydration.
                    type="button"
                    render={<Button />}
                  >
                    <ButtonLabel>Comfortable</ButtonLabel>
                  </ak.Radio>
                  <ButtonGlider />
                </ak.RadioGroup>
              </ak.RadioProvider>
            </div>
          </div>
        </ShellSidebarBody>

        <ShellSidebarFooter className="flex justify-end gap-2">
          <Button onClick={() => setDraftTheme(defaultTheme)}>
            <ButtonLabel>Reset</ButtonLabel>
          </Button>
          <Button $layer="brand" $kind="bevel" onClick={applyTheme}>
            <ButtonLabel>Apply</ButtonLabel>
          </Button>
        </ShellSidebarFooter>
      </ShellSidebar>
    </Shell>
  );
}

const accents = [
  { name: "Blue", hue: "blue" },
  { name: "Green", hue: "green" },
  { name: "Magenta", hue: "magenta" },
  { name: "Orange", hue: "orange" },
] as const;

type Accent = (typeof accents)[number];

interface ThemeOptions {
  accent: Accent;
  density: "compact" | "comfortable";
}

const defaultTheme: ThemeOptions = {
  accent: accents[0],
  density: "comfortable",
};

const topLinks = ["Components", "Styles", "Examples", "Pricing"];

const currentPage = "Combobox";

const navigationGroups = [
  {
    label: "Getting started",
    links: ["Introduction", "Installation", "Theming"],
  },
  {
    label: "Components",
    links: ["Accordion", currentPage, "Dialog", "Tabs"],
  },
  {
    label: "Utilities",
    links: ["Focus trap", "Portal", "Visually hidden"],
  },
];

const badges = ["Stable", "Keyboard", "Accessible"];

const previewOptions = ["Apple", "Apricot", "Banana", "Blueberry"];

const tocItems = [
  { id: "overview", title: "Overview" },
  { id: "usage", title: "Usage" },
  { id: "keyboard", title: "Keyboard" },
];
