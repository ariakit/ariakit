import {
  Nav,
  NavLink,
  NavLinkLabel,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  CalendarDays,
  ChartPie,
  FileText,
  FolderKanban,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: FolderKanban, count: 12 },
  { label: "Calendar", icon: CalendarDays },
  { label: "Documents", icon: FileText },
  { label: "Analytics", icon: ChartPie },
];

export default function Example() {
  const [current, setCurrent] = useState("Projects");
  return (
    // The cover blends the brand color into the surface, and the current link
    // shows its icon and label in the brand color. The link reads its text
    // contrast from its own layer, not the cover, so neither is pushed. The bar
    // also marks the link in high contrast, where the cover takes the page
    // color.
    <Nav
      aria-label="Workspace"
      glider={[
        { $layer: "brand", $mix: 10, $lightnessPush: false },
        {
          $kind: "bar",
          $side: "start",
          $barOffset: "frame",
          $layer: "brand",
          $invert: false,
        },
      ]}
      $rounded="2xl"
      $p={2}
      className="w-60"
    >
      {links.map((link) => {
        const isCurrent = current === link.label;
        return (
          <NavLink
            key={link.label}
            href={`#${link.label.toLowerCase()}`}
            aria-current={isCurrent ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              setCurrent(link.label);
            }}
            $selectedPush={false}
            $text={isCurrent ? "brand" : undefined}
          >
            <NavSlot>
              <link.icon />
            </NavSlot>
            <NavLinkLabel
              $text={isCurrent ? "brand" : undefined}
              $textPush={isCurrent ? 20 : undefined}
            >
              {link.label}
            </NavLinkLabel>
            {link.count && (
              <NavSlot $kind="badge" $p="md">
                {link.count}
              </NavSlot>
            )}
          </NavLink>
        );
      })}
    </Nav>
  );
}
