import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavLinkContent,
  NavLinkDescription,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import type { LucideIcon } from "lucide-react";
import { Disc3, Heart, House, ListMusic, Search } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";

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

export default function Example() {
  const [current, setCurrent] = useState("Liked Songs");

  const linkProps = (id: string) => ({
    href: `#${id.toLowerCase().replaceAll(/\W+/g, "-")}`,
    "aria-current": current === id ? ("page" as const) : undefined,
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      setCurrent(id);
    },
  });

  return (
    <Frame $layer $lighten={0.5} $rounded="2xl" $border $p={2} className="w-72">
      <Nav aria-label="Music" list={false} glider>
        <NavList>
          <NavLink {...linkProps("Home")}>
            <NavSlot>
              <House />
            </NavSlot>
            <NavLinkLabel>Home</NavLinkLabel>
          </NavLink>
          <NavLink {...linkProps("Search")}>
            <NavSlot>
              <Search />
            </NavSlot>
            <NavLinkLabel>Search</NavLinkLabel>
          </NavLink>
        </NavList>
        <NavGroup>
          <NavGroupLabel>Your library</NavGroupLabel>
          <NavList>
            {library.map((item) => (
              <NavLink key={item.title} {...linkProps(item.title)}>
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
              </NavLink>
            ))}
          </NavList>
        </NavGroup>
      </Nav>
    </Frame>
  );
}
