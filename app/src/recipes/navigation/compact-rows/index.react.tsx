import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CreditCard,
  KeyRound,
  Languages,
  Palette,
  Plug,
  ShieldCheck,
  User,
  Users,
  Webhook,
} from "lucide-react";
import { ExampleRouter, RouterNavLink } from "../router.react.tsx";

interface Link {
  label: string;
  icon: LucideIcon;
}

const groups: { label: string; links: Link[] }[] = [
  {
    label: "Account",
    links: [
      { label: "Profile", icon: User },
      { label: "Appearance", icon: Palette },
      { label: "Language", icon: Languages },
      { label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Workspace",
    links: [
      { label: "Members", icon: Users },
      { label: "Billing", icon: CreditCard },
      { label: "Security", icon: ShieldCheck },
    ],
  },
  {
    label: "Developers",
    links: [
      { label: "API keys", icon: KeyRound },
      { label: "Webhooks", icon: Webhook },
      { label: "Integrations", icon: Plug },
    ],
  },
];

function getPath(title: string) {
  return `/${title.toLowerCase().replaceAll(" ", "-")}`;
}

export default function Example() {
  return (
    <ExampleRouter initialPath={getPath("Appearance")}>
      <Frame
        $lighten={0.5}
        $rounded="2xl"
        $border
        $p={2}
        className="w-64 text-sm"
      >
        {/* The item padding sets the padding of every link, and the group
            labels follow it. */}
        <Nav
          aria-label="Settings"
          list={false}
          $itemPadding={1}
          $gap={0.5}
          $groupGap={3}
          $cover
        >
          {groups.map((group) => (
            <NavGroup key={group.label}>
              <NavGroupLabel>{group.label}</NavGroupLabel>
              <NavList>
                {group.links.map((link) => (
                  <RouterNavLink key={link.label} to={getPath(link.label)}>
                    <NavSlot>
                      <link.icon />
                    </NavSlot>
                    <NavLinkLabel>{link.label}</NavLinkLabel>
                  </RouterNavLink>
                ))}
              </NavList>
            </NavGroup>
          ))}
        </Nav>
      </Frame>
    </ExampleRouter>
  );
}
