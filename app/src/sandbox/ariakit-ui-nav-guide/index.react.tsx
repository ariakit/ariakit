/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { NavProps } from "@ariakit/ui/components/nav.ariakit.react";
import {
  Nav,
  NavDisclosure,
  NavGroup,
  NavGroupLabel,
  NavItem,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import type { MouseEvent } from "react";
import { useState } from "react";
import {
  Example,
  ExampleGrid,
} from "#app/components/ariakit-ui-example.react.tsx";

interface TreeNavProps extends NavProps {
  /** The name of the link that is current at first. */
  initialCurrent: string;
  /** Draws a dot at each link of the nested list. */
  dots?: boolean;
}

/**
 * A navigation with three levels of links. A click makes a link current, so the
 * bar can be watched as it moves.
 */
function TreeNav({ initialCurrent, dots, ...props }: TreeNavProps) {
  const [current, setCurrent] = useState(initialCurrent);
  const getProps = (name: string) => ({
    href: `#${name.toLowerCase()}`,
    "aria-current": current === name ? ("page" as const) : undefined,
    children: name,
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      setCurrent(name);
    },
  });
  return (
    <Nav className="w-full" {...props}>
      <NavLink {...getProps("Overview")} />
      <NavItem>
        <NavLink {...getProps("Guides")} />
        <NavList $marker={dots ? "bullet" : undefined}>
          <NavLink {...getProps("Install")} />
          <NavItem>
            <NavLink {...getProps("Configure")} />
            <NavList>
              <NavLink {...getProps("Theme")} />
            </NavList>
          </NavItem>
          <NavLink {...getProps("Deploy")} />
        </NavList>
      </NavItem>
      <NavLink {...getProps("FAQ")} />
    </Nav>
  );
}

export default function NavGuideExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Numbered links"
        description="Without a guide, the numbers sit as near to the links as they do on a guide."
        code={`
          <Nav ordered>
            <NavLink>Overview</NavLink>
          </Nav>
        `}
      >
        <TreeNav aria-label="Numbered links" ordered initialCurrent="Guides" />
      </Example>

      <Example
        title="Numbers on a guide"
        description="The guide joins the numbers and bends into the nested lists."
        code={`
          <Nav ordered $guide="smooth">
            <NavLink>Overview</NavLink>
          </Nav>
        `}
      >
        <TreeNav
          aria-label="Numbers on a guide"
          ordered
          $guide="smooth"
          initialCurrent="Guides"
        />
      </Example>

      <Example
        title="Numbered group"
        description="An ordered list in a group makes room for its own numbers, as an ordered navigation does."
        code={`
          <Nav list={false}>
            <NavGroup>
              <NavGroupLabel>Setup</NavGroupLabel>
              <NavList ordered>
                <NavLink>Install</NavLink>
              </NavList>
            </NavGroup>
          </Nav>
        `}
      >
        <Nav aria-label="Numbered group" list={false} className="w-full">
          <NavGroup>
            <NavGroupLabel>Setup</NavGroupLabel>
            <NavList ordered>
              <NavLink href="#install">Install</NavLink>
              <NavLink href="#configure" aria-current="page">
                Configure
              </NavLink>
              <NavLink href="#deploy">Deploy</NavLink>
            </NavList>
          </NavGroup>
        </Nav>
      </Example>

      <Example
        title="Numbered group on a guide"
        description="One guide runs along all groups, so the gutter of the numbers moves the guide of every group."
        code={`
          <Nav list={false} $guide="smooth">
            <NavGroup>
              <NavGroupLabel>Setup</NavGroupLabel>
              <NavList ordered>
                <NavLink>Install</NavLink>
              </NavList>
            </NavGroup>
            <NavGroup>
              <NavGroupLabel>Reference</NavGroupLabel>
              <NavList>
                <NavLink>API</NavLink>
              </NavList>
            </NavGroup>
          </Nav>
        `}
      >
        <Nav
          aria-label="Numbered group on a guide"
          list={false}
          $guide="smooth"
          className="w-full"
        >
          <NavGroup>
            <NavGroupLabel>Setup</NavGroupLabel>
            <NavList ordered>
              <NavLink href="#install">Install</NavLink>
              <NavLink href="#configure">Configure</NavLink>
            </NavList>
          </NavGroup>
          <NavGroup>
            <NavGroupLabel>Reference</NavGroupLabel>
            <NavList>
              <NavLink href="#api">API</NavLink>
              <NavLink href="#cli">CLI</NavLink>
            </NavList>
          </NavGroup>
        </Nav>
      </Example>

      <Example
        title="Numbered group in a disclosure"
        description="The label of a group with numbers lines up with its links in the body of a disclosure too."
        code={`
          <Nav>
            <NavDisclosure button="Guides">
              <NavGroup>
                <NavGroupLabel>Setup</NavGroupLabel>
                <NavList ordered>
                  <NavLink>Install</NavLink>
                </NavList>
              </NavGroup>
            </NavDisclosure>
          </Nav>
        `}
      >
        <Nav aria-label="Numbered group in a disclosure" className="w-full">
          <NavLink href="#overview">Overview</NavLink>
          <NavDisclosure button="Guides" defaultOpen>
            <NavGroup>
              <NavGroupLabel>Setup</NavGroupLabel>
              <NavList ordered>
                <NavLink href="#install">Install</NavLink>
                <NavLink href="#deploy">Deploy</NavLink>
              </NavList>
            </NavGroup>
          </NavDisclosure>
        </Nav>
      </Example>

      <Example
        title="Bar on the guide"
        description="The bar of the current link draws on the guide. Click a link to make it current."
        code={`
          <Nav $guide="smooth" bar>
            <NavLink aria-current="page">Guides</NavLink>
          </Nav>
        `}
      >
        <TreeNav
          aria-label="Bar on the guide"
          $guide="smooth"
          bar
          initialCurrent="Guides"
        />
      </Example>

      <Example
        title="Bar and dots"
        description="The bar stops at the dot of the current link, and the dot fills with the bar color."
        code={`
          <Nav $guide="smooth" bar>
            <NavItem>
              <NavLink>Guides</NavLink>
              <NavList $marker="bullet">
                <NavLink aria-current="page">Configure</NavLink>
              </NavList>
            </NavItem>
          </Nav>
        `}
      >
        <TreeNav
          aria-label="Bar and dots"
          $guide="smooth"
          bar
          dots
          initialCurrent="Configure"
        />
      </Example>

      <Example
        title="Ringed numbers"
        description="A ring in the bar color lights up around the number of the current link."
        code={`
          <Nav ordered $guide="smooth" bar $markerHighlight="ring">
            <NavLink aria-current="page">Guides</NavLink>
          </Nav>
        `}
      >
        <TreeNav
          aria-label="Ringed numbers"
          ordered
          $guide="smooth"
          bar
          $markerHighlight="ring"
          initialCurrent="Guides"
        />
      </Example>

      <Example
        title="Bar at the end"
        description="A bar at the end side stays a plain bar, off the guide."
        code={`
          <Nav $guide="smooth" bar={{ $side: "end" }}>
            <NavLink aria-current="page">Guides</NavLink>
          </Nav>
        `}
      >
        <TreeNav
          aria-label="Bar at the end"
          $guide="smooth"
          bar={{ $side: "end" }}
          initialCurrent="Guides"
        />
      </Example>

      <Example
        title="Disclosure in a guide"
        description="The guide and the markers don't join the rows of a disclosure, and its links keep their plain bars."
        code={`
          <Nav ordered $guide="smooth" bar>
            <NavLink>Overview</NavLink>
            <NavDisclosure button="Guides">
              <NavList>
                <NavLink aria-current="page">Install</NavLink>
              </NavList>
            </NavDisclosure>
          </Nav>
        `}
      >
        <Nav
          aria-label="Disclosure in a guide"
          ordered
          $guide="smooth"
          bar
          className="w-full"
        >
          <NavLink href="#overview">Overview</NavLink>
          <NavDisclosure button="Guides" defaultOpen>
            <NavList>
              <NavLink href="#install" aria-current="page">
                Install
              </NavLink>
              <NavLink href="#deploy">Deploy</NavLink>
            </NavList>
          </NavDisclosure>
          <NavLink href="#faq">FAQ</NavLink>
        </Nav>
      </Example>
    </ExampleGrid>
  );
}
