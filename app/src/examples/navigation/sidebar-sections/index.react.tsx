import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavDisclosure,
  NavDisclosureGroup,
  NavLink,
  NavLinkContent,
  NavLinkDescription,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellHeaderStart,
  ShellMain,
  ShellMainBody,
  ShellMainIntro,
  ShellSidebar,
  ShellSidebarBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";
import { Hexagon } from "lucide-react";
import { useState } from "react";

type Thumbnail = "list" | "form" | "grid";

interface Page {
  title: string;
  description?: string;
  thumbnail?: Thumbnail;
}

interface Section {
  title: string;
  pages: Page[];
}

const sections: Section[] = [
  {
    title: "Components",
    pages: [
      { title: "Button", description: "4 examples", thumbnail: "form" },
      { title: "Checkbox", description: "6 examples", thumbnail: "list" },
      { title: "Combobox", description: "12 examples", thumbnail: "list" },
      { title: "Dialog", description: "8 examples", thumbnail: "form" },
      { title: "Menu", description: "9 examples", thumbnail: "list" },
      { title: "Tabs", description: "5 examples", thumbnail: "grid" },
    ],
  },
  {
    title: "Examples",
    pages: [
      { title: "App Shell", description: "10 examples", thumbnail: "grid" },
      { title: "Skeleton", description: "8 examples", thumbnail: "list" },
      { title: "Navigation", description: "12 examples", thumbnail: "form" },
    ],
  },
  {
    title: "Guides",
    pages: [
      { title: "Getting started" },
      { title: "Styling" },
      { title: "Accessibility" },
    ],
  },
];

export default function Example() {
  const [currentPage, setCurrentPage] = useState("Combobox");
  // One section opens at a time, starting with the section of the current page.
  const [openSection, setOpenSection] = useState<string>();
  const activeSection =
    openSection ??
    sections.find((section) =>
      section.pages.some((page) => page.title === currentPage),
    )?.title;
  return (
    <Shell>
      <ShellHeader $blur>
        <ShellHeaderStart>
          {/* An icon starts the logo, so its sides keep the frame padding, like
              the leading icon of a button. */}
          <TextFrame
            $p={2}
            $px="sm"
            className="flex items-center gap-2 font-semibold"
          >
            <Hexagon strokeWidth={1.5} className="size-5" aria-hidden />
            Acme UI
          </TextFrame>
        </ShellHeaderStart>
      </ShellHeader>
      <ShellSidebar>
        <ShellSidebarBody>
          <Nav
            aria-label="Site"
            list={false}
            $fill
            bar={{ $offset: "halfway" }}
          >
            <NavDisclosureGroup $fill>
              {sections.map((section) => (
                <NavDisclosure
                  key={section.title}
                  open={activeSection === section.title}
                  setOpen={(open) => setOpenSection(open ? section.title : "")}
                  $split
                  button={{
                    children: section.title,
                    indicator: "chevron-down-end",
                  }}
                  content={{
                    guide: false,
                    body: { $layer: true, $darken: 0.25 },
                  }}
                >
                  <NavList>
                    {section.pages.map((page) => (
                      <NavLink
                        key={page.title}
                        href={`#${page.title.toLowerCase().replace(" ", "-")}`}
                        aria-current={
                          currentPage === page.title ? "page" : undefined
                        }
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentPage(page.title);
                        }}
                      >
                        {page.thumbnail && (
                          <NavSlot $kind="thumbnail" $rowSpan={2}>
                            <PageThumbnail kind={page.thumbnail} />
                          </NavSlot>
                        )}
                        <NavLinkContent>
                          <NavLinkLabel>{page.title}</NavLinkLabel>
                          {page.description && (
                            <NavLinkDescription>
                              {page.description}
                            </NavLinkDescription>
                          )}
                        </NavLinkContent>
                      </NavLink>
                    ))}
                  </NavList>
                </NavDisclosure>
              ))}
            </NavDisclosureGroup>
          </Nav>
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellMain>
        <ShellMainIntro>
          <h1 className="text-3xl font-semibold">{currentPage}</h1>
        </ShellMainIntro>
        <ShellMainBody>
          <div className="grid gap-4">
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-5/6" />
            <SkeletonBox $rounded="xl" className="h-48" />
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-2/3" />
          </div>
        </ShellMainBody>
      </ShellMain>
    </Shell>
  );
}

interface PageThumbnailProps {
  kind: Thumbnail;
}

// A tiny picture of the page, drawn with static skeleton parts. Its em-based
// parts scale with the link text.
function PageThumbnail({ kind }: PageThumbnailProps) {
  return (
    <Frame
      render={<span />}
      $layer
      $p="none"
      className="grid content-center gap-[0.75em] p-[1.25em] text-[0.25em]"
    >
      {kind === "list" &&
        ["w-full", "w-3/4", "w-5/6"].map((width) => (
          <SkeletonLine key={width} $weight="medium" className={width} />
        ))}
      {kind === "form" && (
        <>
          <SkeletonLine $weight="bold" className="w-1/2" />
          <SkeletonBox $rounded="xs" className="h-[1.5em]" />
          <SkeletonBox
            $layer="brand"
            $rounded="xs"
            className="h-[1.5em] w-1/2"
          />
        </>
      )}
      {kind === "grid" && (
        <span className="grid grid-cols-2 gap-[0.75em]">
          <SkeletonBox $rounded="xs" className="h-[2.5em]" />
          <SkeletonBox $rounded="xs" className="h-[2.5em]" />
          <SkeletonBox $rounded="xs" className="h-[2.5em]" />
          <SkeletonBox $rounded="xs" className="h-[2.5em]" />
        </span>
      )}
    </Frame>
  );
}
