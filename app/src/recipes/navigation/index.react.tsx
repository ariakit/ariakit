import { Badge } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Nav,
  NavLinkDescription,
  NavLinkLabel,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { ChartBar, House, Inbox, Settings, Users } from "lucide-react";
import { ExampleRouter, RouterNavLink } from "./router.react.tsx";

const links = [
  { label: "Home", path: "/home", icon: House },
  { label: "Inbox", path: "/inbox", icon: Inbox, count: 3 },
  { label: "Reports", path: "/reports", icon: ChartBar },
  { label: "Team", path: "/team", icon: Users },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Example() {
  return (
    <ExampleRouter initialPath="/home">
      <Nav aria-label="Main" className="w-56">
        {links.map((link) => (
          <RouterNavLink key={link.label} to={link.path}>
            {/* A floating badge sits on the top end corner of the icon. It
                comes before the label, so the hidden description gives the
                count to assistive technologies instead. */}
            <NavSlot className="relative">
              <link.icon />
              {link.count && (
                <NavSlot $kind="box" $floating aria-hidden>
                  <Badge $kind="solid" $round>
                    {link.count}
                  </Badge>
                </NavSlot>
              )}
            </NavSlot>
            <NavLinkLabel>{link.label}</NavLinkLabel>
            {link.count && (
              <NavLinkDescription className="sr-only">
                {link.count} unread
              </NavLinkDescription>
            )}
          </RouterNavLink>
        ))}
      </Nav>
    </ExampleRouter>
  );
}
