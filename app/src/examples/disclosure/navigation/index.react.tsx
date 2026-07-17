import {
  Nav,
  NavDisclosure,
  NavDisclosureButton,
  NavIcon,
  NavLink,
  NavList,
} from "@ariakit/ui/ariakit/nav.react.tsx";
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
} from "@ariakit/ui/ariakit/sidebar.react.tsx";
import { button } from "@ariakit/ui/styles/button.ts";
import { navButton, navButtonContent } from "@ariakit/ui/styles/nav.ts";
import { clsx } from "clsx";
import * as icons from "lucide-react";
import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";

// Legacy ak-nav-button on a plain link: the nav row additions are layered
// onto the button cv. The row gap is restated because the ui-nav-gated gap
// rules only fire under a Nav root, and plain ak-button paints no idle layer
// offset.
const brandLink = button.jsx({
  // Legacy ak-nav-button rows sit on the field radius.
  $rounded: "lg",
  $lightnessOffset: false,
  className: clsx(navButton.jsx({}).className, "gap-[calc(0.75em+1px)]"),
});

// Legacy ak-nav-icon-6: the icon-size channel the NavIcon child reads.
const brandLinkStyle = {
  ...brandLink.style,
  "--nav-icon-size": "calc(var(--spacing) * 6)",
} as CSSProperties;

const links = [
  {
    label: "Getting Started",
    icon: icons.Rocket,
    links: [
      {
        label: "Introduction",
        href: "#/",
      },
      {
        label: "Installation",
        href: "#/installation",
      },
      {
        label: "Quickstart",
        href: "#/quickstart",
      },
      {
        label: "Editor Setup",
        href: "#/editor-setup",
      },
    ],
  },
  {
    label: "Guides",
    icon: icons.BookText,
    links: [
      {
        label: "Styling & Theming",
        href: "#/guides/styling",
      },
      {
        label: "Accessibility",
        href: "#/guides/accessibility",
      },
      {
        label: "Composition",
        href: "#/guides/composition",
      },
      {
        label: "Testing",
        href: "#/guides/testing",
      },
      {
        label: "Internationalization",
        href: "#/guides/i18n",
      },
    ],
  },
  {
    label: "Resources",
    icon: icons.Layers,
    links: [
      {
        label: "FAQ",
        href: "#/resources/faq",
      },
      {
        label: "Changelog",
        href: "#/resources/changelog",
      },
      {
        label: "Migration",
        href: "#/resources/migration",
      },
      {
        label: "Releases",
        href: "#/resources/releases",
      },
    ],
  },
];

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  return () => {
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
}

export default function Example() {
  const href = useSyncExternalStore(
    subscribeToLocation,
    () => window.location.href,
    () => undefined,
  );
  return (
    <div
      className={clsx(
        "grid w-[100cqi] transition-[grid-template-columns] duration-300",
        "grid-cols-[--spacing(60)_1fr]",
      )}
    >
      <div />
      <Sidebar>
        <SidebarHeader>
          <a href="" {...brandLink} style={brandLinkStyle}>
            <NavIcon className="rounded p-1 ak-layer ak-layer-brand ak-layer-contrast block">
              <icons.Triangle size={20} strokeWidth={2} />
            </NavIcon>
            <span {...navButtonContent.jsx({})}>Acme Corp</span>
          </a>
        </SidebarHeader>

        <SidebarBody>
          <Nav $iconSize={4}>
            {links.map((link) => (
              <NavDisclosure
                key={link.label}
                defaultOpen={link.label === "Getting Started"}
                className="text-[0.9375rem]"
                button={
                  <NavDisclosureButton icon={<link.icon strokeWidth={1.5} />}>
                    {link.label}
                  </NavDisclosureButton>
                }
              >
                <NavList>
                  {link.links.map((link) => (
                    <li key={link.label}>
                      <NavLink href={link.href} currentUrl={href}>
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </NavList>
              </NavDisclosure>
            ))}
          </Nav>
        </SidebarBody>
      </Sidebar>

      <div>
        <div className="ak-layer ak-layer-0 ak-frame-bordering border-x-0 border-t-0 h-14 sticky top-0 p-2" />
        <div className="ak-frame ak-frame-dialog/dialog grid gap-(--ak-frame-padding) max-w-240 mx-auto">
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
          <div className="ak-layer ak-layer-6 ak-frame ak-frame-field/field h-10" />
        </div>
      </div>
    </div>
  );
}
