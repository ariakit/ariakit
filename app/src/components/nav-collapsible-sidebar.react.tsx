/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react.tsx";
import {
  Nav,
  NavDisclosure,
  NavDisclosureButton,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react.tsx";
import {
  Sidebar,
  SidebarBody,
} from "@ariakit/ui/components/sidebar.ariakit.react.tsx";
import * as icons from "lucide-react";
import { useState } from "react";

const sections = [
  {
    label: "Getting started",
    icon: icons.Rocket,
    links: [
      { label: "Introduction", href: "#nav" },
      { label: "Installation", href: "#nav" },
      { label: "Quickstart", href: "#nav" },
    ],
  },
  {
    label: "Guides",
    icon: icons.BookOpen,
    links: [
      { label: "Styling", href: "#nav" },
      { label: "Composition", href: "#nav" },
    ],
  },
  {
    label: "Resources",
    icon: icons.Layers,
    links: [{ label: "Migration", href: "#nav" }],
  },
];

/**
 * The Nav components inside a Sidebar that collapses to its icon rail, so the
 * gallery can exercise the collapse transition instead of showing two frozen
 * widths.
 */
export function NavCollapsibleSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="grid gap-3 justify-items-start">
      <Button
        $rounded="lg"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
      >
        {collapsed ? (
          <icons.PanelLeftOpen size={16} />
        ) : (
          <icons.PanelLeftClose size={16} />
        )}
        {collapsed ? "Expand sidebar" : "Collapse sidebar"}
      </Button>
      <div className="nav-sidebar-stage">
        <Sidebar collapsed={collapsed}>
          <SidebarBody>
            <Nav $iconSize={5}>
              {sections.map((section) => (
                <NavDisclosure
                  key={section.label}
                  defaultOpen={section.label === "Getting started"}
                  button={
                    <NavDisclosureButton
                      icon={<section.icon strokeWidth={1.5} />}
                    >
                      {section.label}
                    </NavDisclosureButton>
                  }
                >
                  <NavList>
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <NavLink href={link.href}>{link.label}</NavLink>
                      </li>
                    ))}
                  </NavList>
                </NavDisclosure>
              ))}
            </Nav>
          </SidebarBody>
        </Sidebar>
      </div>
    </div>
  );
}
