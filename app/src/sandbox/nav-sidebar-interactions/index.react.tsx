import * as Ariakit from "@ariakit/react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Nav,
  NavButton,
  NavButtonContent,
  NavDisclosure,
  NavDisclosureButton,
  NavDisclosureContent,
  NavIcon,
  NavLink,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Sidebar } from "@ariakit/ui/components/sidebar.ariakit.react";
import * as React from "react";
import { SidebarPlacement } from "./sidebar-placement.react.tsx";
import { SidebarToggleContent } from "./sidebar-toggle-content.react.tsx";

export default function Example() {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="grid gap-6">
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>
          Open navigation dialog
        </Ariakit.DialogDisclosure>
        <Ariakit.Dialog aria-label="Navigation dialog" modal={false}>
          <Nav>
            <li>
              <NavLink href="/docs" currentUrl="/docs">
                Documentation
              </NavLink>
            </li>
          </Nav>
          <Ariakit.DialogDismiss>Close navigation dialog</Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      <Nav>
        <NavDisclosure button="Account pages">
          <Ariakit.DialogProvider>
            <Ariakit.DialogDisclosure>
              Open account settings
            </Ariakit.DialogDisclosure>
            <NavLink href="/account" currentUrl="/account">
              Account overview
            </NavLink>
            <Ariakit.Dialog aria-label="Account settings" modal={false}>
              <Ariakit.DialogHeading>Account settings</Ariakit.DialogHeading>
              <Ariakit.DialogDismiss>
                Close account settings
              </Ariakit.DialogDismiss>
            </Ariakit.Dialog>
          </Ariakit.DialogProvider>
        </NavDisclosure>
      </Nav>
      <Nav aria-label="Project navigation">
        <NavDisclosure>
          <NavDisclosureButton>Project pages</NavDisclosureButton>
          <NavDisclosureContent>
            <NavLink href="/projects" currentUrl="/account">
              All projects
            </NavLink>
          </NavDisclosureContent>
        </NavDisclosure>
      </Nav>
      <section aria-label="Collapsible navigation">
        <Button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "Expand navigation" : "Collapse navigation"}
        </Button>
        <Sidebar
          collapsed={collapsed}
          style={{ position: "relative", height: 120 }}
        >
          <NavButton>
            <NavIcon aria-hidden>A</NavIcon>
            <NavButtonContent
              className="font-semibold"
              style={{ color: "rgb(128, 0, 128)" }}
            >
              Account menu
            </NavButtonContent>
          </NavButton>
        </Sidebar>
      </section>
      <SidebarPlacement />
      <SidebarToggleContent />
    </div>
  );
}
