import type { NavProps } from "@ariakit/ui/components/nav.ariakit.react.tsx";
import {
  Nav,
  NavDisclosure,
  NavDisclosureButton,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react.tsx";
import * as icons from "lucide-react";
import { useState } from "react";

const sections = [
  {
    label: "Getting started",
    icon: icons.Rocket,
    pages: ["Introduction", "Installation"],
  },
  {
    label: "Guides",
    icon: icons.BookOpen,
    pages: ["Styling", "Composition"],
  },
];

interface DocsNavProps extends NavProps {
  /** The page that is current at first, if any. */
  initial?: string;
}

/**
 * A docs sidebar nav whose current page moves to the link the user clicks, so
 * the glider's travel can be checked rather than a frozen state.
 */
function DocsNav({ initial, ...props }: DocsNavProps) {
  const [current, setCurrent] = useState(initial);
  return (
    <Nav $iconSize={5} {...props}>
      {sections.map((section) => (
        <NavDisclosure
          key={section.label}
          defaultOpen
          button={
            <NavDisclosureButton icon={<section.icon strokeWidth={1.5} />}>
              {section.label}
            </NavDisclosureButton>
          }
        >
          <NavList>
            {section.pages.map((page) => (
              <li key={page}>
                <NavLink
                  href={`#${page.toLowerCase()}`}
                  aria-current={current === page ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrent(page);
                  }}
                >
                  {page}
                </NavLink>
              </li>
            ))}
          </NavList>
        </NavDisclosure>
      ))}
    </Nav>
  );
}

export default function Example() {
  return (
    <div className="grid w-80 gap-8 p-4">
      <DocsNav
        aria-label="Bar on the guide"
        initial="Introduction"
        glider={{ $kind: "bar" }}
      />
      <DocsNav
        aria-label="Bar at the end"
        initial="Styling"
        glider={{ $kind: "bar", $side: "end" }}
      />
      <DocsNav aria-label="Cover" initial="Introduction" glider />
      <DocsNav aria-label="No current page" glider={{ $kind: "bar" }} />
      <div dir="rtl">
        <DocsNav
          aria-label="Right to left"
          initial="Composition"
          glider={{ $kind: "bar" }}
        />
      </div>
    </div>
  );
}
