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
import type { NavProps } from "@ariakit/ui/components/nav.ariakit.react.tsx";
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

interface DemoSection {
  label: string;
  icon: icons.LucideIcon;
  links: string[];
}

interface DemoContent {
  sections: DemoSection[];
  account: string;
  collapse: string;
  expand: string;
}

const english: DemoContent = {
  sections: [
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
  ],
  account: "Diego Haz",
  collapse: "Collapse",
  expand: "Expand",
};

// The same content in Arabic, for the right-to-left sample.
const arabic: DemoContent = {
  sections: [
    {
      label: "البدء",
      icon: icons.Rocket,
      links: ["مقدمة", "التثبيت", "البدء السريع"],
    },
    {
      label: "الأدلة",
      icon: icons.BookOpen,
      links: ["التنسيق", "التركيب"],
    },
    {
      label: "الموارد",
      icon: icons.Layers,
      links: ["الترحيل"],
    },
  ],
  account: "الحساب",
  collapse: "طيّ",
  expand: "توسيع",
};

interface DemoProps {
  demo?: DemoContent;
  /** The glider every list of the nav renders, if any. */
  glider?: NavProps["glider"];
}

/**
 * A sized box that becomes the containing block of the fixed sidebar inside it,
 * so the panel lays out in the card instead of over the page.
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

function SidebarNav({ demo = english, glider }: DemoProps) {
  return (
    <Nav glider={glider}>
      {demo.sections.map((section, index) => (
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

function Account({ demo = english }: DemoProps) {
  return (
    <NavButton>
      <NavIcon>
        <icons.CircleUserRound strokeWidth={1.5} />
      </NavIcon>
      <NavButtonContent>{demo.account}</NavButtonContent>
    </NavButton>
  );
}

function DemoSidebar({ demo, glider, ...props }: SidebarProps & DemoProps) {
  return (
    <Sidebar className="[--nav-icon-size:--spacing(5)]" {...props}>
      <SidebarHeader>
        <Brand />
      </SidebarHeader>
      <SidebarBody>
        <SidebarNav demo={demo} glider={glider} />
      </SidebarBody>
      <SidebarFooter>
        <Account demo={demo} />
      </SidebarFooter>
    </Sidebar>
  );
}

function CollapsingSidebar({
  demo = english,
  glider,
  ...props
}: SidebarProps & DemoProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="grid gap-3">
      <Button
        $rounded="lg"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
        className="w-max"
      >
        {/* The glyph draws the panel on the left, so it turns around with
            the sidebar in a right-to-left page. */}
        <ButtonSlot className="rtl:-scale-x-100">
          {collapsed ? <icons.PanelLeftOpen /> : <icons.PanelLeftClose />}
        </ButtonSlot>
        {collapsed ? demo.expand : demo.collapse}
      </Button>
      <SidebarStage>
        <DemoSidebar
          collapsed={collapsed}
          demo={demo}
          glider={glider}
          {...props}
        />
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
        title="Active bar"
        code='Nav glider={{ $kind: "bar", $layer: "brand" }} · glider'
        description="A bar on the guide line marks the current page instead of the pill, and a cover glider travels between the rows. Collapse the first one to see the bar leave with the rows."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <CollapsingSidebar glider={{ $kind: "bar", $layer: "brand" }} />
          <SidebarStage>
            <DemoSidebar glider />
          </SidebarStage>
        </div>
      </Sample>

      <Sample
        title="Collapsible with a toggle"
        code="SidebarProvider > SidebarToggle + Sidebar"
        description="With a provider the toggle slides the sidebar in and out of the page. Under the mobile breakpoint it opens as a modal drawer over the page instead."
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
        title="Right to left"
        code='<div dir="rtl"> > Sidebar'
        description="Under a right-to-left direction the panel sits on the end edge with its border on the other side, the rows and the guide lines mirror, and the toggle icon turns around. Collapse it to check the icon rail."
      >
        <div dir="rtl" lang="ar">
          <CollapsingSidebar demo={arabic} />
        </div>
      </Sample>

      <Sample
        title="Live instance"
        code="The page sidebar"
        description="The sidebar at the start of this page is the same component with page links, a persisted collapse and a mobile drawer."
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
