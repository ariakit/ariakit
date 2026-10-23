import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLinkContent,
  NavLinkDescription,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import type { LucideIcon } from "lucide-react";
import { Disc3, Heart, House, ListMusic, Search } from "lucide-react";
import { ExampleRouter, RouterNavLink } from "../router.react.tsx";

interface Item {
  title: string;
  description: string;
  icon?: LucideIcon;
  // The hue of the cover art.
  hue?: "orange" | "green" | "cyan" | "blue" | "magenta";
  // Artists show a round photo instead of square cover art.
  artist?: string;
}

const library: Item[] = [
  {
    title: "Liked Songs",
    description: "Playlist · 1,204 songs",
    icon: Heart,
    hue: "blue",
  },
  {
    title: "Daily Mix 3",
    description: "Playlist · Made for you",
    icon: ListMusic,
    hue: "green",
  },
  {
    title: "Night Drive",
    description: "Album · The Midnight",
    icon: Disc3,
    hue: "magenta",
  },
  { title: "Nina Simone", description: "Artist", artist: "NS" },
  {
    title: "Road Trip",
    description: "Playlist · 42 songs",
    icon: ListMusic,
    hue: "orange",
  },
  { title: "Miles Davis", description: "Artist", artist: "MD" },
];

function getPath(title: string) {
  return `/${title.toLowerCase().replaceAll(/\W+/g, "-")}`;
}

export default function Example() {
  return (
    <ExampleRouter initialPath={getPath("Liked Songs")}>
      <Frame
        $layer
        $lighten={0.5}
        $rounded="2xl"
        $border
        $p={2}
        className="w-72"
      >
        <Nav aria-label="Music" list={false} $cover>
          <NavList>
            <RouterNavLink to={getPath("Home")}>
              <NavSlot>
                <House />
              </NavSlot>
              <NavLinkLabel>Home</NavLinkLabel>
            </RouterNavLink>
            <RouterNavLink to={getPath("Search")}>
              <NavSlot>
                <Search />
              </NavSlot>
              <NavLinkLabel>Search</NavLinkLabel>
            </RouterNavLink>
          </NavList>
          <NavGroup>
            <NavGroupLabel>Your library</NavGroupLabel>
            <NavList>
              {library.map((item) => (
                <RouterNavLink key={item.title} to={getPath(item.title)}>
                  {/* A two-row slot spans the title and the description. */}
                  {item.artist ? (
                    <NavSlot $kind="avatar" $size="xl" $rowSpan={2} aria-hidden>
                      {item.artist}
                    </NavSlot>
                  ) : (
                    <NavSlot
                      $kind="avatar"
                      $rounded="md"
                      $size="xl"
                      $rowSpan={2}
                      $layer="brand"
                      $hue={item.hue}
                    >
                      {item.icon && <item.icon aria-hidden />}
                    </NavSlot>
                  )}
                  <NavLinkContent>
                    <NavLinkLabel>{item.title}</NavLinkLabel>
                    <NavLinkDescription>{item.description}</NavLinkDescription>
                  </NavLinkContent>
                </RouterNavLink>
              ))}
            </NavList>
          </NavGroup>
        </Nav>
      </Frame>
    </ExampleRouter>
  );
}
