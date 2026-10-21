import {
  Nav,
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
import { useLocation } from "react-router";
import { ExampleRouter, RouterNavLink } from "../router.react.tsx";

const links = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/projects", icon: FolderKanban, count: 12 },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
  { label: "Documents", path: "/documents", icon: FileText },
  { label: "Analytics", path: "/analytics", icon: ChartPie },
];

function WorkspaceNav() {
  const { pathname } = useLocation();
  return (
    // The current link blends the brand color into its surface and shows its
    // icon and label in the brand color. The bar also marks the link in high
    // contrast, where the surface takes the page color. The bar name lets the
    // router's view transitions move the bar between links.
    <Nav
      aria-label="Workspace"
      bar={{ $side: "start", $layer: "brand", $invert: false }}
      $rounded="2xl"
      $p={2}
      className="w-60 [--bar-transition-name:workspace-bar]"
    >
      {links.map((link) => {
        const isCurrent = pathname === link.path;
        return (
          <RouterNavLink
            key={link.label}
            to={link.path}
            $selectedPush={false}
            $layer={isCurrent ? "brand" : undefined}
            $mix={isCurrent ? 10 : undefined}
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
          </RouterNavLink>
        );
      })}
    </Nav>
  );
}

export default function Example() {
  return (
    <ExampleRouter initialPath="/projects">
      <WorkspaceNav />
    </ExampleRouter>
  );
}
