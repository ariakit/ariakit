import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavItem,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import { ExampleRouter, RouterNavLink } from "../router.react.tsx";

interface Page {
  title: string;
  pages?: string[];
}

const groups: { label: string; pages: Page[] }[] = [
  {
    label: "Getting started",
    pages: [
      { title: "Introduction" },
      { title: "Installation", pages: ["Vite", "Next.js", "Astro"] },
      { title: "Project structure" },
    ],
  },
  {
    label: "Guides",
    pages: [
      { title: "Styling", pages: ["Themes", "Dark mode"] },
      { title: "Forms" },
      { title: "Testing" },
    ],
  },
];

function getPath(title: string) {
  return `/${title.toLowerCase().replaceAll(/\W+/g, "-")}`;
}

export default function Example() {
  return (
    <ExampleRouter initialPath={getPath("Next.js")}>
      <Frame
        $lighten={0.5}
        $rounded="2xl"
        $border
        $p={2}
        className="w-72 text-sm"
      >
        {/* Each group starts its own guide. The nested pages always show, and
            a dot marks each of them on the guide. The bar of the current link
            draws on the guide, and it fills the dot of a nested link. */}
        <Nav aria-label="Docs" list={false} $guide="smooth" bar $cover>
          {groups.map((group) => (
            <NavGroup key={group.label}>
              <NavGroupLabel>{group.label}</NavGroupLabel>
              <NavList>
                {group.pages.map((page) => {
                  const link = (
                    <RouterNavLink key={page.title} to={getPath(page.title)}>
                      {page.title}
                    </RouterNavLink>
                  );
                  if (!page.pages) return link;
                  return (
                    <NavItem key={page.title}>
                      {link}
                      <NavList $marker="bullet">
                        {page.pages.map((title) => (
                          <RouterNavLink key={title} to={getPath(title)}>
                            {title}
                          </RouterNavLink>
                        ))}
                      </NavList>
                    </NavItem>
                  );
                })}
              </NavList>
            </NavGroup>
          ))}
        </Nav>
      </Frame>
    </ExampleRouter>
  );
}
