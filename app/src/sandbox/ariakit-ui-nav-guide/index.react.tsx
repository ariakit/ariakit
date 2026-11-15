/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react";
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

/**
 * Keeps the current link of a navigation in state. A click makes a link
 * current, so the bar can be watched as it moves.
 */
function useCurrentLink(initialCurrent: string) {
  const [current, setCurrent] = useState(initialCurrent);
  return (name: string) => ({
    href: `#${name.toLowerCase()}`,
    "aria-current": current === name ? ("page" as const) : undefined,
    children: name,
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      setCurrent(name);
    },
  });
}

interface TreeNavProps extends NavProps {
  /** The name of the link that is current at first. */
  initialCurrent: string;
  /** Draws a dot at each link of the nested list. */
  dots?: boolean;
}

/** A navigation with three levels of links. */
function TreeNav({ initialCurrent, dots, ...props }: TreeNavProps) {
  const getProps = useCurrentLink(initialCurrent);
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

/**
 * Links on a guide around a disclosure, whose links are not on the guide. The
 * bar leaves the guide while a link of the disclosure is current.
 */
function DisclosureNav(props: NavProps) {
  const getProps = useCurrentLink("Overview");
  return (
    <Nav $guide="smooth" bar className="w-full" {...props}>
      <NavLink {...getProps("Overview")} />
      <NavDisclosure button="Guides" defaultOpen>
        <NavList>
          <NavLink {...getProps("Install")} />
          <NavLink {...getProps("Deploy")} />
        </NavList>
      </NavDisclosure>
      <NavLink {...getProps("FAQ")} />
      <NavLink {...getProps("Support")} />
    </Nav>
  );
}

/**
 * Links on a guide where one link keeps its bar at the end side, off the guide.
 * The guide has no bar while that link is current.
 */
function OffGuideBarNav(props: NavProps) {
  const getProps = useCurrentLink("Guides");
  return (
    <Nav $guide="smooth" bar className="w-full" {...props}>
      <NavLink {...getProps("Overview")} />
      <NavLink {...getProps("Guides")} />
      <NavLink {...getProps("Support")} bar={{ $side: "end" }} />
    </Nav>
  );
}

/**
 * Links on a guide that change while the navigation stays, like the links of
 * another page. The bar glides from where it is to the current link of the new
 * links, and shows at once when the navigation had no links before.
 */
function ChangingLinksNav(props: NavProps) {
  const [links, setLinks] = useState<"docs" | "blog" | "none">("docs");
  const getDocsProps = useCurrentLink("Overview");
  const getBlogProps = useCurrentLink("Archive");
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setLinks("docs")}>Show docs links</Button>
        <Button onClick={() => setLinks("blog")}>Show blog links</Button>
        <Button onClick={() => setLinks("none")}>Show no links</Button>
      </div>
      <Nav $guide="smooth" bar className="w-full" {...props}>
        {links === "docs" && (
          <>
            <NavLink {...getDocsProps("Overview")} />
            <NavLink {...getDocsProps("Install")} />
            <NavLink {...getDocsProps("Configure")} />
            <NavLink {...getDocsProps("Deploy")} />
            <NavLink {...getDocsProps("FAQ")} />
          </>
        )}
        {links === "blog" && (
          <>
            <NavLink {...getBlogProps("Latest")} />
            <NavLink {...getBlogProps("Releases")} />
            <NavLink {...getBlogProps("Archive")} />
          </>
        )}
      </Nav>
    </div>
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
        title="Padded link on a guide"
        description="A link with its own padding keeps the guide continuous with the links around it, and its bar still stops at its number."
        code={`
          <Nav ordered $guide="smooth" bar>
            <NavLink>Overview</NavLink>
            <NavLink $p={3} aria-current="page">Guides</NavLink>
            <NavLink>FAQ</NavLink>
          </Nav>
        `}
      >
        <Nav
          aria-label="Padded link on a guide"
          ordered
          $guide="smooth"
          bar
          className="w-full"
        >
          <NavLink href="#overview">Overview</NavLink>
          <NavLink href="#guides" $p={3} aria-current="page">
            Guides
          </NavLink>
          <NavLink href="#faq">FAQ</NavLink>
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

      <Example
        title="Bar around a disclosure"
        description="The bar leaves the guide while a link of the disclosure is current, and comes back to the guide with a link around the disclosure. Click a link to make it current."
        code={`
          <Nav $guide="smooth" bar>
            <NavLink aria-current="page">Overview</NavLink>
            <NavDisclosure button="Guides">
              <NavList>
                <NavLink>Install</NavLink>
              </NavList>
            </NavDisclosure>
            <NavLink>FAQ</NavLink>
          </Nav>
        `}
      >
        <DisclosureNav aria-label="Bar around a disclosure" />
      </Example>

      <Example
        title="Bar off the guide on one link"
        description="One link keeps its bar at the end side. When it becomes current, the bar leaves the guide at once. Click a link to make it current."
        code={`
          <Nav $guide="smooth" bar>
            <NavLink>Overview</NavLink>
            <NavLink aria-current="page">Guides</NavLink>
            <NavLink bar={{ $side: "end" }}>Support</NavLink>
          </Nav>
        `}
      >
        <OffGuideBarNav aria-label="Bar off the guide on one link" />
      </Example>

      <Example
        title="Bar on a guide whose links change"
        description="The links change while the navigation stays, like the links of another page. The bar glides from where it is to the current link of the new links. Click a link to make it current, or a button to change the links."
        code={`
          <Nav $guide="smooth" bar>
            {links.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </Nav>
        `}
      >
        <ChangingLinksNav aria-label="Bar on a guide whose links change" />
      </Example>
    </ExampleGrid>
  );
}
