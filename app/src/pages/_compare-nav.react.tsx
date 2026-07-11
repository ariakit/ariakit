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
  Nav,
  NavDisclosure,
  NavDisclosureButton,
  NavLink,
  NavList,
} from "@ariakit/ui/ariakit/nav.react.tsx";
import { Sidebar, SidebarBody } from "@ariakit/ui/ariakit/sidebar.react.tsx";
import { BookTextIcon, RocketIcon } from "lucide-react";
import {
  Nav as LegacyNav,
  NavDisclosure as LegacyNavDisclosure,
  NavDisclosureButton as LegacyNavDisclosureButton,
  NavLink as LegacyNavLink,
  NavList as LegacyNavList,
} from "#app/examples/_lib/ariakit/nav.react.tsx";
import {
  Sidebar as LegacySidebar,
  SidebarBody as LegacySidebarBody,
} from "#app/examples/_lib/ariakit/sidebar.react.tsx";

// Same contained demo box as the sidebar fixture: paint containment
// anchors the fixed sidebar, the size container resolves 100cqb, and the
// width is explicit because everything inside is out of flow.
const frameClassName = "relative h-96 w-72 [container-type:size] contain-paint";

export function CompareNavLegacy() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className={frameClassName}>
        <LegacySidebar>
          <LegacySidebarBody>
            <LegacyNav className="ak-nav-icon-4">
              <LegacyNavDisclosure
                defaultOpen
                button={
                  <LegacyNavDisclosureButton
                    icon={<RocketIcon strokeWidth={1.5} />}
                  >
                    Getting Started
                  </LegacyNavDisclosureButton>
                }
              >
                <LegacyNavList>
                  <li>
                    <LegacyNavLink href="#/" currentUrl="#/">
                      Introduction
                    </LegacyNavLink>
                  </li>
                  <li>
                    <LegacyNavLink href="#/installation" currentUrl="#/">
                      Installation
                    </LegacyNavLink>
                  </li>
                  <li>
                    <LegacyNavLink href="#/quickstart" currentUrl="#/">
                      Quickstart
                    </LegacyNavLink>
                  </li>
                </LegacyNavList>
              </LegacyNavDisclosure>
              <LegacyNavDisclosure
                button={
                  <LegacyNavDisclosureButton
                    icon={<BookTextIcon strokeWidth={1.5} />}
                  >
                    Guides
                  </LegacyNavDisclosureButton>
                }
              >
                <LegacyNavList>
                  <li>
                    <LegacyNavLink href="#/guides/styling" currentUrl="#/">
                      Styling &amp; Theming
                    </LegacyNavLink>
                  </li>
                </LegacyNavList>
              </LegacyNavDisclosure>
            </LegacyNav>
          </LegacySidebarBody>
        </LegacySidebar>
      </div>
      <div className={frameClassName}>
        <LegacySidebar collapsed>
          <LegacySidebarBody>
            <LegacyNav className="ak-nav-icon-4">
              <LegacyNavDisclosure
                button={
                  <LegacyNavDisclosureButton
                    icon={<RocketIcon strokeWidth={1.5} />}
                  >
                    Getting Started
                  </LegacyNavDisclosureButton>
                }
              >
                <LegacyNavList>
                  <li>
                    <LegacyNavLink href="#/" currentUrl="#/">
                      Introduction
                    </LegacyNavLink>
                  </li>
                </LegacyNavList>
              </LegacyNavDisclosure>
            </LegacyNav>
          </LegacySidebarBody>
        </LegacySidebar>
      </div>
    </div>
  );
}

export function CompareNavNew() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className={frameClassName}>
        <Sidebar>
          <SidebarBody>
            <Nav $iconSize={4}>
              <NavDisclosure
                defaultOpen
                button={
                  <NavDisclosureButton icon={<RocketIcon strokeWidth={1.5} />}>
                    Getting Started
                  </NavDisclosureButton>
                }
              >
                <NavList>
                  <li>
                    <NavLink href="#/" currentUrl="#/">
                      Introduction
                    </NavLink>
                  </li>
                  <li>
                    <NavLink href="#/installation" currentUrl="#/">
                      Installation
                    </NavLink>
                  </li>
                  <li>
                    <NavLink href="#/quickstart" currentUrl="#/">
                      Quickstart
                    </NavLink>
                  </li>
                </NavList>
              </NavDisclosure>
              <NavDisclosure
                button={
                  <NavDisclosureButton
                    icon={<BookTextIcon strokeWidth={1.5} />}
                  >
                    Guides
                  </NavDisclosureButton>
                }
              >
                <NavList>
                  <li>
                    <NavLink href="#/guides/styling" currentUrl="#/">
                      Styling &amp; Theming
                    </NavLink>
                  </li>
                </NavList>
              </NavDisclosure>
            </Nav>
          </SidebarBody>
        </Sidebar>
      </div>
      <div className={frameClassName}>
        <Sidebar collapsed>
          <SidebarBody>
            <Nav $iconSize={4}>
              <NavDisclosure
                button={
                  <NavDisclosureButton icon={<RocketIcon strokeWidth={1.5} />}>
                    Getting Started
                  </NavDisclosureButton>
                }
              >
                <NavList>
                  <li>
                    <NavLink href="#/" currentUrl="#/">
                      Introduction
                    </NavLink>
                  </li>
                </NavList>
              </NavDisclosure>
            </Nav>
          </SidebarBody>
        </Sidebar>
      </div>
    </div>
  );
}
