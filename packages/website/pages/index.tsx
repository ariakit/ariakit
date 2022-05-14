import React from "react";
import Link from "next/link";

const links: Array<{ href: string; label: string }> = [
  { href: "/examples/button", label: "Button" },
  { href: "/examples/button-as-div", label: "Button as div" },
  { href: "/examples/button-as-link", label: "Button as link" },
  { href: "/examples/checkbox", label: "Checkbox" },
  { href: "/examples/checkbox-controlled", label: "Checkbox controlled" },
  { href: "/examples/checkbox-as-button", label: "Checkbox as button" },
  { href: "/examples/checkbox-custom", label: "Checkbox custom" },
  { href: "/examples/checkbox-state", label: "Checkbox state" },
  { href: "/examples/checkbox-group", label: "Checkbox group" },
  { href: "/examples/collection", label: "Collection" },
  { href: "/examples/combobox", label: "Combobox" },
  { href: "/examples/combobox-cancel", label: "Combobox cancel" },
  { href: "/examples/combobox-matches", label: "Combobox matches" },
  { href: "/examples/combobox-multiple", label: "Combobox multiple" },
  { href: "/examples/command", label: "Command" },
  {
    href: "/examples/command-enter-disabled",
    label: "Command with enter disabled",
  },
  {
    href: "/examples/command-space-disabled",
    label: "Command with space disabled",
  },
  { href: "/examples/menu-context-menu", label: "Context menu" },
  { href: "/examples/dialog", label: "Dialog" },
  { href: "/examples/dialog-animated", label: "Dialog Animated" },
  { href: "/examples/disclosure", label: "Disclosure" },
  { href: "/examples/focus-trap", label: "Focus trap" },
  { href: "/examples/form", label: "Form" },
  { href: "/examples/form-select", label: "Form select" },
  { href: "/examples/group", label: "Group" },
  { href: "/examples/heading", label: "Heading" },
  { href: "/examples/hovercard", label: "Hovercard" },
  { href: "/examples/menu", label: "Menu" },
  { href: "/examples/menu-bar", label: "Menu bar" },
  { href: "/examples/menu-combobox", label: "Menu combobox" },
  { href: "/examples/menu-item-checkbox", label: "Menu item checkbox" },
  { href: "/examples/menu-nested", label: "Menu nested" },
  { href: "/examples/popover", label: "Popover" },
  { href: "/examples/popover-standalone", label: "Popover standalone" },
  { href: "/examples/popover-responsive", label: "Popover responsive" },
  { href: "/examples/radio", label: "Radio" },
  { href: "/examples/select", label: "Select" },
  { href: "/examples/select-autofill", label: "Select autofill" },
  { href: "/examples/select-combobox", label: "Select combobox" },
  { href: "/examples/select-grid", label: "Select grid" },
  { href: "/examples/select-group", label: "Select group" },
  { href: "/examples/select-item-custom", label: "Select item custom" },
  { href: "/examples/select-multiple", label: "Select multiple" },
  { href: "/examples/tab", label: "Tab" },
  { href: "/examples/tab-react-router", label: "Tab react-router" },
  { href: "/examples/toolbar", label: "Toolbar" },
  { href: "/examples/toolbar-select", label: "Toolbar with Select" },
  { href: "/examples/tooltip", label: "Tooltip" },
  { href: "/examples/tooltip-placement", label: "Tooltip placement" },
  { href: "/examples/tooltip-timeout", label: "Tooltip timeout" },
  { href: "/examples/tooltip-animated", label: "Tooltip animated" },
].sort((a, b) => a.label.localeCompare(b.label));

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <h1 className="text-3xl font-semibold">Hello!</h1>
      <p>
        The Ariakit docs are still under construction. You can{" "}
        <a
          href="https://newsletter.ariakit.org"
          className="text-primary-1 underline hover:no-underline dark:text-primary-1-dark"
        >
          subscribe to our newsletter
        </a>{" "}
        to get major updates.
      </p>
      <h2 className="text-2xl">Examples</h2>
      <ul>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
