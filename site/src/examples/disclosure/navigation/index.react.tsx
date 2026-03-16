import clsx from "clsx";
import * as icons from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  Nav,
  NavDisclosure,
  NavDisclosureButton,
  NavLink,
  NavList,
} from "#app/examples/_lib/ariakit/nav.react.tsx";
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
} from "#app/examples/_lib/ariakit/sidebar.react.tsx";

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
      <Sidebar className="ak-nav-icon-4">
        <SidebarHeader>
          <a href="" className="ak-nav-button ak-nav-icon-6">
            <span className="ak-nav-icon rounded p-1 flex-none ak-layer-contrast-primary block">
              <icons.Triangle size={20} strokeWidth={2} />
            </span>
            <span className="ak-nav-button-content">Acme Corp</span>
          </a>
        </SidebarHeader>

        <SidebarBody>
          <Nav>
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
        <div className="ak-layer-0 ak-bordering border-x-0 border-t-0 h-14 sticky top-0 p-2" />
        <div className="ak-frame-dialog grid gap-(--ak-frame-padding) max-w-240 mx-auto">
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
          <div className="ak-layer-pop ak-frame-field h-10" />
        </div>
      </div>
    </div>
  );
}
