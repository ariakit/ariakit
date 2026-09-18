/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonContent,
  ButtonDescription,
  ButtonGroup,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  Disclosure,
  DisclosureGroup,
} from "@ariakit/ui/components/disclosure.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Nav, NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellFooter,
  ShellHeader,
  ShellHeaderCenter,
  ShellHeaderEnd,
  ShellHeaderStart,
  ShellMain,
  ShellMainBody,
  ShellMainFull,
  ShellMainHeader,
  ShellMainIntro,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellSidebarHeader,
} from "@ariakit/ui/components/shell.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";
import { button } from "@ariakit/ui/styles/button";
import {
  SwatchBookIcon,
  SunIcon,
  XIcon,
  CodeIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { useState } from "react";
import type { ComponentProps } from "react";
import { LogoIcon, Logotype } from "#app/icons/logo.react.tsx";

export interface NavComponentProps extends ComponentProps<typeof Nav> {
  currentUrl: string | URL;
}

export function NavComponent({ currentUrl }: NavComponentProps) {
  const [themeOpen, setThemeOpen] = useState(false);
  const [disclosureOpen, setDisclosureOpen] = useState("first");
  return (
    <Shell>
      <Shell>
        <ShellHeader $height="sm" $blur className="text-sm">
          <ShellHeaderStart>
            <a
              href="/"
              {...button.jsx({ $size: "sm", className: "items-center" })}
            >
              <ButtonSlot $size="2xl">
                <LogoIcon />
              </ButtonSlot>
              <Logotype size="1.25em" className="@max-4xl:hidden" />
            </a>
            {/* <ComboboxProvider defaultSelectedValue="React">
              <ComboboxSelect
                $border={false}
                $lightnessOffset
                className="@max-4xl:hidden"
                icon={<Icon name="react" />}
              />
              <ComboboxPopover className="text-sm">
                <ComboboxItem
                  value="React"
                  checkmark="after"
                  icon={<Icon name="react" />}
                />
                <ComboboxItem
                  value="Vue"
                  checkmark="after"
                  icon={<Icon name="vue" />}
                />
                <ComboboxItem
                  value="Solid"
                  checkmark="after"
                  icon={<Icon name="solid" />}
                />
              </ComboboxPopover>
            </ComboboxProvider> */}
          </ShellHeaderStart>
          <ShellHeaderCenter>
            <Nav
              $cover
              $layout="horizontal"
              className="@max-4xl:hidden"
              glider={{
                $kind: "bar",
                // $barOffset: "0.5rem",
                $animated: false,
              }}
            >
              <NavLink
                href="/react/components"

                currentUrl={currentUrl}
                className="font-medium!"
              >
                Components
              </NavLink>
              <NavLink
                href="/tailwind"
                currentUrl={currentUrl}
                className="font-medium!"
              >
                Styles
              </NavLink>
              <NavLink
                href="/react/examples"
                currentUrl={currentUrl}
                className="font-medium!"
              >
                Examples
              </NavLink>
              <NavLink
                href="/pricing"
                currentUrl={currentUrl}
                className="font-medium!"
              >
                Pricing
              </NavLink>
            </Nav>
          </ShellHeaderCenter>
          <ShellHeaderEnd>
            <Button $px="sm" $p={1}>
              <Badge
                $px="md"
                $size="sm"
                $layer="brand"
                $borderType="dashed"
                $edgeWeight={60}
                $edgePush={0}
              >
                <BadgeLabel>Plus</BadgeLabel>
              </Badge>
            </Button>
            <Button>
              <ButtonSlot>
                <SunIcon />
              </ButtonSlot>
              <ButtonLabel className="hidden">Theme</ButtonLabel>
            </Button>
            <Button onClick={() => setThemeOpen(!themeOpen)}>
              <ButtonSlot>
                <SwatchBookIcon />
              </ButtonSlot>
              <ButtonLabel>Theme</ButtonLabel>
            </Button>
          </ShellHeaderEnd>
        </ShellHeader>
        <ShellSidebar $show="7xl">
          <ShellSidebarBody>
            <DisclosureGroup $cover $p="inherit" className="border-none!">
              <Disclosure
                $split
                open={disclosureOpen === "first"}
                setOpen={(open) => setDisclosureOpen(open ? "first" : "")}
                $border
                className="rounded-t-none!"
                content={{
                  body: { $darken: 0.25, className: "overflow-auto" },
                }}
                button={{
                  label: "Components",
                  indicator: "chevron-right-end",
                  $rounded: "none",
                }}
              >
                <Nav
                  $cover
                  className="text-sm"
                  glider={{
                    $kind: "bar",
                    $animated: false,
                    $side: "end",
                  }}
                >
                  {["Components", "Styles", "Examples", "Pricing"].map(
                    (item) => (
                      <NavLink
                        key={item}
                        href={`/react/${item.toLowerCase()}`}
                        currentUrl={currentUrl}
                        className="ak-ink-100!"
                      >
                        <ButtonSlot
                          $size="2xl"
                          $rowSpan={2}
                          $square={false}
                          $mx="lg"
                        >
                          <Frame
                            $darken
                            $border
                            $p={4}
                            className="h-full w-16 flex flex-col gap-1"
                          >
                            <Frame
                              $lighten={2}
                              $rounded="md"
                              $border
                              className="w-full h-2"
                            />
                            <Frame
                              $lighten={2}
                              $rounded="md"
                              $border
                              className="w-full h-6"
                            />
                          </Frame>
                        </ButtonSlot>
                        <ButtonContent>
                          <ButtonLabel className="font-medium">
                            {item}
                          </ButtonLabel>
                          <ButtonDescription>12 recipes</ButtonDescription>
                        </ButtonContent>
                      </NavLink>
                    ),
                  )}
                </Nav>
              </Disclosure>
              <Disclosure
                $split
                open={disclosureOpen === "second"}
                setOpen={(open) => setDisclosureOpen(open ? "second" : "")}
                $border
                className="rounded-t-none! border-t-0!"
                content={{
                  body: { $darken: 0.25, className: "overflow-auto" },
                }}
                button={{
                  label: "Components",
                  indicator: "chevron-right-end",
                  $rounded: "none",
                }}
              >
                <Nav
                  $cover
                  className="text-sm"
                  glider={{
                    $kind: "bar",
                    $animated: false,
                    $side: "end",
                  }}
                >
                  {["Components", "Styles", "Examples", "Pricing"].map(
                    (item) => (
                      <NavLink
                        key={item}
                        href={`/react/${item.toLowerCase()}`}
                        currentUrl={currentUrl}
                      >
                        {item}
                      </NavLink>
                    ),
                  )}
                </Nav>
              </Disclosure>
            </DisclosureGroup>
            <Nav
              $cover
              className="text-sm"
              glider={{
                $kind: "bar",
                $animated: false,
                $side: "end",
              }}
            >
              <NavLink href="/react/components" currentUrl={currentUrl}>
                Components
              </NavLink>
              <NavLink href="/tailwind" currentUrl={currentUrl}>
                Styles
              </NavLink>
              <NavLink href="/react/examples" currentUrl={currentUrl}>
                Examples
              </NavLink>
              <NavLink href="/pricing" currentUrl={currentUrl}>
                Pricing
              </NavLink>
            </Nav>
            {/* <Nav
              $cover
              className="text-sm"
              glider={{
                $kind: "bar",
                $animated: false,
                $side: "end",
              }}
            >
              <NavDisclosure
                defaultOpen
                $split
                $p="inherit"
                content={{ $guide: false, body: { $rounded: "none" } }}
                $cover
                $border
                // $rounded="none"
                button={{
                  label: "Components",
                  indicator: "chevron-right-end",
                  // $border: true,
                  $rounded: "none",
                }}
              >
                <NavList>
                  <NavLink href="/react/components" currentUrl={currentUrl}>
                    Components
                  </NavLink>
                  <NavLink href="/tailwind" currentUrl={currentUrl}>
                    Styles
                  </NavLink>
                  <NavLink href="/react/examples" currentUrl={currentUrl}>
                    Examples
                  </NavLink>
                  <NavLink href="/pricing" currentUrl={currentUrl}>
                    Pricing
                  </NavLink>
                </NavList>
              </NavDisclosure>
            </Nav> */}
            <div />
          </ShellSidebarBody>
        </ShellSidebar>
        <ShellMain
          $p="var(--gutter)"
          className="[--gutter:--spacing(3)] @2xl:[--gutter:--spacing(8)] pt-0"
        >
          <ShellMainHeader $blur $p={3} $show="max-6xl">
            <ShellHeaderStart>Shell Main Header</ShellHeaderStart>
          </ShellMainHeader>
          <ShellMainIntro>
            {/* <ButtonGroup className="text-xs">
              <Button className="-ms-(--px)">
                <ButtonSlot className="ak-ink-80">
                  <HomeIcon />
                </ButtonSlot>
              </Button>
              <ButtonSeparator $kind="slash" />
              <Button className="ak-ink-80 font-normal">Components</Button>
              <ButtonSeparator $kind="slash" />
              <Button className="ak-ink-80">App Shell</Button>
            </ButtonGroup> */}
            <div className="my-(--gutter)">
              <Heading>App Shell</Heading>
              <Prose>
                <p>
                  A shell is a container for a web application. It provides a
                  consistent look and feel for the application, and helps to
                  organize the content of the application.
                </p>
              </Prose>
            </div>
            <ShellMainFull className="mt-10">
              <Frame $p="var(--gutter)" className="pt-0">
                <Frame className="flex justify-between items-center text-sm">
                  <TextFrame
                    $p={3}
                    $layer="transparent"
                    className="font-medium"
                  >
                    Combobox with a list of options
                  </TextFrame>
                  <ButtonGroup
                    $rounded="xl"
                    $p={0.5}
                    $forceRounded
                    $layer="transparent"
                  >
                    <Button className="ak-ink-80 ui-hover:ak-ink-100">
                      <ButtonSlot>
                        <CodeIcon />
                      </ButtonSlot>
                      <ButtonLabel>Get code</ButtonLabel>
                    </Button>
                    <Button className="ak-ink-80 ui-hover:ak-ink-100">
                      <ButtonSlot>
                        <ExternalLinkIcon />
                      </ButtonSlot>
                      <ButtonLabel hidden>
                        Open preview in a new tab
                      </ButtonLabel>
                    </Button>
                  </ButtonGroup>
                </Frame>
                <Frame $rounded="xl" $forceRounded $border $p={4} $darken={0.5}>
                  <div className="h-80"></div>
                </Frame>
              </Frame>
            </ShellMainFull>
          </ShellMainIntro>
          <ShellMainBody>
            <ShellMainFull>
              <Frame $p="var(--gutter)" className="pt-0">
                <Frame className="flex justify-between items-center text-sm">
                  <TextFrame
                    $p={3}
                    $layer="transparent"
                    className="font-medium"
                  >
                    Combobox with a list of options
                  </TextFrame>
                  <ButtonGroup
                    $rounded="xl"
                    $p={0.5}
                    $forceRounded
                    $layer="transparent"
                  >
                    <Button className="ak-ink-80 ui-hover:ak-ink-100">
                      <ButtonSlot>
                        <CodeIcon />
                      </ButtonSlot>
                      <ButtonLabel>Get code</ButtonLabel>
                    </Button>
                    <Button className="ak-ink-80 ui-hover:ak-ink-100">
                      <ButtonSlot>
                        <ExternalLinkIcon />
                      </ButtonSlot>
                      <ButtonLabel hidden>
                        Open preview in a new tab
                      </ButtonLabel>
                    </Button>
                  </ButtonGroup>
                </Frame>
                <Frame $rounded="xl" $forceRounded $border $p={4} $darken={0.5}>
                  <div className="h-80"></div>
                </Frame>
              </Frame>
            </ShellMainFull>
            <Prose>
              {Array.from({ length: 19 }).map((_, index) => (
                <p key={index}>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Tempore doloremque possimus voluptas voluptatibus nobis?
                  Labore eligendi tempore natus ab laboriosam, quae rerum
                  voluptates quo accusantium, cum in, dicta voluptatum dolore.
                </p>
              ))}
            </Prose>
          </ShellMainBody>
        </ShellMain>
        <ShellSidebar
          $side="end"
          $from="body"
          $border={false}
          $show="6xl"
          className="text-sm"
        >
          <ShellSidebarBody>
            <TextFrame $px="2xl" className="text-xs uppercase ak-ink-0">
              On this page
            </TextFrame>
            <Nav $cover $gap={0.5} glider={{ $kind: "bar", $animated: false }}>
              <NavLink href="/react/components" currentUrl={currentUrl}>
                Components
              </NavLink>
              <NavLink href="/tailwind" currentUrl={currentUrl}>
                Styles
              </NavLink>
              <NavLink href="/react/examples" currentUrl={currentUrl}>
                Examples
              </NavLink>
              <NavLink href="/pricing" currentUrl={currentUrl}>
                Pricing
              </NavLink>
            </Nav>
          </ShellSidebarBody>
        </ShellSidebar>
        <ShellFooter>Footer</ShellFooter>
      </Shell>
      <ShellSidebar
        $side="end"
        $width="lg"
        open={themeOpen}
        className="text-sm"
      >
        <ShellSidebarHeader $height="sm" className="justify-between">
          <TextFrame className="font-medium">Theme</TextFrame>
          <Button onClick={() => setThemeOpen(false)}>
            <ButtonSlot>
              <XIcon />
            </ButtonSlot>
            <ButtonLabel>Close</ButtonLabel>
          </Button>
        </ShellSidebarHeader>
        <ShellSidebarBody>dsadsa</ShellSidebarBody>
        <ShellSidebarFooter>dsadsa</ShellSidebarFooter>
      </ShellSidebar>
    </Shell>
  );
}
