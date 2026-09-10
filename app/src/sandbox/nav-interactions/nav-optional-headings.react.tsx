import {
  Nav,
  NavDisclosure,
  NavLink,
} from "@ariakit/ui/components/nav.ariakit.react";
import * as React from "react";

export function NavOptionalHeadings() {
  const [headings, setHeadings] = React.useState(false);
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
