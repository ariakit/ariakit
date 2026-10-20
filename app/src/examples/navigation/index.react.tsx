import {
  Nav,
  NavLink,
  NavLinkDescription,
  NavLinkLabel,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { ChartBar, House, Inbox, Settings, Users } from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Home", icon: House },
  { label: "Inbox", icon: Inbox, count: 3 },
  { label: "Reports", icon: ChartBar },
  { label: "Team", icon: Users },
  { label: "Settings", icon: Settings },
];

export default function Example() {
  const [current, setCurrent] = useState("Home");
  return (
    <Nav aria-label="Main" glider className="w-56">
      {links.map((link) => (
        <NavLink
          key={link.label}
          href={`#${link.label.toLowerCase()}`}
          aria-current={current === link.label ? "page" : undefined}
          onClick={(event) => {
            event.preventDefault();
            setCurrent(link.label);
          }}
        >
          {/* A floating badge sits on the top end corner of the icon. It comes
              before the label, so the hidden description gives the count to
              assistive technologies instead. */}
          <NavSlot className="relative">
            <link.icon />
            {link.count && (
              <NavSlot $kind="badge" $floating $p="md" aria-hidden>
                {link.count}
              </NavSlot>
            )}
          </NavSlot>
          <NavLinkLabel>{link.label}</NavLinkLabel>
          {link.count && (
            <NavLinkDescription className="sr-only">
              {link.count} unread
            </NavLinkDescription>
          )}
        </NavLink>
      ))}
    </Nav>
  );
}
