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
  ButtonSlot,
  ButtonLabel,
} from "@ariakit/ui/components/button.ariakit.react.tsx";
import {
  Nav,
  NavButton,
  NavButtonContent,
  NavDisclosure,
  NavDisclosureButton,
  NavIcon,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react.tsx";
import type { SidebarProps } from "@ariakit/ui/components/sidebar.ariakit.react.tsx";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarToggle,
} from "@ariakit/ui/components/sidebar.ariakit.react.tsx";
import { clsx } from "clsx";
import * as icons from "lucide-react";
import * as React from "react";
import { Caption, Sample, Samples, Stage } from "./gallery.react.tsx";

const sections = [
  {
    label: "Getting started",
    icon: icons.Rocket,
    links: ["Introduction", "Installation", "Quickstart"],
  },
  {
    label: "Guides",
    icon: icons.BookOpen,
    links: ["Styling", "Composition"],
  },
  {
    label: "Resources",
    icon: icons.Layers,
    links: ["Migration"],
  },
];

/**
 * A sized box that becomes the containing block of the fixed sidebar inside
 * it, so the panel lays out in the card instead of over the page.
 */
function SidebarStage({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      // Layout containment is what makes the stage the containing block of
      // the fixed sidebar; container-type alone stopped implying it, and only
      // sizes the sidebar's container units.
      className={clsx(
        "relative h-80 w-full overflow-clip rounded-xl contain-layout [container-type:size]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarNav() {
  return (
    <Nav>
      {sections.map((section, index) => (
        <NavDisclosure
          key={section.label}
          defaultOpen={index === 0}
          button={
            <NavDisclosureButton icon={<section.icon strokeWidth={1.5} />}>
              {section.label}
            </NavDisclosureButton>
          }
        >
          <NavList>
            {section.links.map((link, linkIndex) => (
              <li key={link}>
                <NavLink
                  href="#sidebar"
                  aria-current={
                    index === 0 && linkIndex === 0 ? "page" : undefined
                  }
                >
                  {link}
                </NavLink>
              </li>
            ))}
          </NavList>
        </NavDisclosure>
      ))}
    </Nav>
  );
}

function Brand() {
  return (
    <NavButton render={<a href="#sidebar" />}>
      <NavIcon>
        <icons.Hexagon strokeWidth={1.5} />
      </NavIcon>
      <NavButtonContent>Ariakit UI</NavButtonContent>
    </NavButton>
  );
}

function Account() {
  return (
    <NavButton>
      <NavIcon>
        <icons.CircleUserRound strokeWidth={1.5} />
      </NavIcon>
      <NavButtonContent>Diego Haz</NavButtonContent>
    </NavButton>
  );
}

function DemoSidebar(props: SidebarProps) {
  return (
    <Sidebar className="[--nav-icon-size:--spacing(5)]" {...props}>
      <SidebarHeader>
        <Brand />
      </SidebarHeader>
      <SidebarBody>
        <SidebarNav />
      </SidebarBody>
      <SidebarFooter>
        <Account />
      </SidebarFooter>
    </Sidebar>
  );
}

function CollapsingSidebar(props: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="grid gap-3">
      <Button
        $rounded="lg"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
        className="w-max"
      >
        <ButtonSlot>
          {collapsed ? <icons.PanelLeftOpen /> : <icons.PanelLeftClose />}
        </ButtonSlot>
        {collapsed ? "Expand" : "Collapse"}
      </Button>
      <SidebarStage>
        <DemoSidebar collapsed={collapsed} {...props} />
      </SidebarStage>
    </div>
  );
}

function CollapsibleSidebar() {
  return (
    <SidebarProvider>
      <div className="grid gap-3">
        <SidebarToggle
          render={
            <Button $rounded="lg" className="w-max">
              <ButtonSlot>
                <icons.Menu />
              </ButtonSlot>
              <ButtonLabel>Toggle</ButtonLabel>
            </Button>
          }
        />
        <SidebarStage className="grid place-items-center">
          <Caption>The sidebar is closed. Toggle it to open.</Caption>
          <DemoSidebar />
        </SidebarStage>
      </div>
    </SidebarProvider>
  );
}

export function SidebarSection() {
  return (
    <Samples columns="wide">
      <Sample
        title="Anatomy"
        code="Sidebar > SidebarHeader + SidebarBody + SidebarFooter"
        description="A brand row in the header, a nav in the scrolling body and an account row in the footer. The sections cover the sidebar frame, so only the panel paints."
      >
        <SidebarStage>
          <DemoSidebar />
        </SidebarStage>
      </Sample>

      <Sample
        title="Collapsed"
        code="Sidebar collapsed"
        description="Collapsing squares every row around its icon, fades the labels and the indicators, and closes the gap, all off the one flag the sidebar publishes. Toggle it to watch the transition."
      >
        <CollapsingSidebar />
      </Sample>

      <Sample
        title="Collapsible with a toggle"
        code="SidebarProvider > SidebarToggle + Sidebar"
        description="With a provider the sidebar is a dialog the toggle opens and closes. Under the mobile breakpoint it opens as a modal drawer over the page."
      >
        <CollapsibleSidebar />
      </Sample>

      <Sample
        title="Widths and surface"
        code="$maxWidth={48} $minWidth={12} · $lightnessOffset={2} · $p={3}"
        description="The expanded and collapsed widths are the sidebar's own knobs, and the panel is a frame with a lifted surface and padding."
      >
        <CollapsingSidebar
          $maxWidth={48}
          $minWidth={12}
          $lightnessOffset={2}
          $p={3}
        />
      </Sample>

      <Sample
        title="Painted sections"
        code="SidebarHeader $layer $lightnessOffset · SidebarFooter $layer $border"
        description="Sections are unpainted by default. Given a layer they round their own corners against the panel."
      >
        <SidebarStage>
          <Sidebar className="[--nav-icon-size:--spacing(5)]">
            <SidebarHeader $layer $lightnessOffset>
              <Brand />
            </SidebarHeader>
            <SidebarBody>
              <SidebarNav />
            </SidebarBody>
            <SidebarFooter $layer $lightnessOffset $border>
              <Account />
            </SidebarFooter>
          </Sidebar>
        </SidebarStage>
      </Sample>

      <Sample
        title="Live instance"
        code="The page sidebar"
        description="The sidebar on the left of this page is the same component with page links, a persisted collapse and a mobile drawer."
      >
        <Stage>
          <Caption>
            Resize the window below 768px to open it as a drawer from the
            floating button, or collapse it from its footer.
          </Caption>
        </Stage>
      </Sample>
    </Samples>
  );
}
