/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as Ariakit from "@ariakit/react";
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
import { useState } from "react";
import { Example, ExampleGrid } from "../example.react.tsx";

// Migrated from nav-optional-headings.react.tsx in the nav-interactions
// sandbox, with the same markup.
function NavOptionalHeadings() {
  const [headings, setHeadings] = useState(false);
  // A hidden heading supplies false; zero is still a navigation label.
  return (
    <section aria-label="Optional navigation headings" className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={headings}
          onChange={(event) => setHeadings(event.target.checked)}
        />
        Show navigation headings
      </label>
      <Nav aria-label="Workspace navigation">
        <NavDisclosure button={headings && "Workspace pages"}>
          <NavLink href="/workspace/members">Workspace members</NavLink>
          <NavLink href="/workspace/settings">Workspace settings</NavLink>
        </NavDisclosure>
      </Nav>
      <Nav aria-label="Invitation navigation">
        <NavDisclosure button={0}>
          <NavLink href="/invitations/settings">Invitation settings</NavLink>
        </NavDisclosure>
      </Nav>
    </section>
  );
}

// Every scenario below comes from the nav-interactions sandbox, with the same
// markup, props and initial state.
export function NavFixturesExamples() {
  return (
    <ExampleGrid>
      <Example
        title="Current page in a dialog"
        description="A current link inside an unrelated non-modal dialog leaves the dialog closed."
      >
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
            <Ariakit.DialogDismiss>
              Close navigation dialog
            </Ariakit.DialogDismiss>
          </Ariakit.Dialog>
        </Ariakit.DialogProvider>
      </Example>

      <Example
        title="Section across an unrelated provider"
        description="A current link opens its section even when an unrelated dialog provider sits between them, and it leaves that dialog closed."
      >
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
      </Example>

      <Example
        title="Explicit disclosure parts"
        description="An explicit NavDisclosureButton and NavDisclosureContent, without the button prop, render exactly one button and one content."
      >
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
      </Example>

      <Example
        title="Custom label styles"
        description="A caller's className and style on NavButtonContent survive next to its own classes."
      >
        <Nav aria-label="Account navigation">
          <li>
            <NavButton>
              <NavIcon aria-hidden>A</NavIcon>
              <NavButtonContent
                className="font-semibold"
                style={{ color: "rgb(128, 0, 128)" }}
              >
                Account menu
              </NavButtonContent>
            </NavButton>
          </li>
        </Nav>
      </Example>

      <Example
        title="Optional navigation headings"
        description="A false button prop renders the links without a disclosure, and zero still counts as a button label. A checkbox toggles the heading."
        code={
          <>
            <Nav>
              <NavDisclosure button={false}>
                <NavLink>Workspace members</NavLink>
                <NavLink>Workspace settings</NavLink>
              </NavDisclosure>
            </Nav>
            <Nav>
              <NavDisclosure button={0}>
                <NavLink>Invitation settings</NavLink>
              </NavDisclosure>
            </Nav>
          </>
        }
      >
        <NavOptionalHeadings />
      </Example>
    </ExampleGrid>
  );
}

export default NavFixturesExamples;
