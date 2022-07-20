import React from "react";
import { cx } from "ariakit-utils/misc";
import pkg from "ariakit/package.json";
import {
  Select,
  SelectItem,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import { VisuallyHidden } from "ariakit/visually-hidden";
import Link from "next/link";
import button from "../styles/button";
import popup from "../styles/popup";

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
  { href: "/examples/combobox-animated", label: "Combobox animated" },
  { href: "/examples/combobox-cancel", label: "Combobox cancel" },
  { href: "/examples/combobox-disclosure", label: "Combobox disclosure" },
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
  { href: "/examples/dialog-animated", label: "Dialog animated" },
  { href: "/examples/dialog-details", label: "Dialog details" },
  { href: "/examples/dialog-react-router", label: "Dialog react-router" },
  { href: "/examples/disclosure", label: "Disclosure" },
  { href: "/examples/focus-trap", label: "Focus trap" },
  { href: "/examples/focus-trap-region", label: "Focus trap region" },
  { href: "/examples/form", label: "Form" },
  { href: "/examples/form-select", label: "Form select" },
  { href: "/examples/group", label: "Group" },
  { href: "/examples/heading", label: "Heading" },
  { href: "/examples/hovercard", label: "Hovercard" },
  { href: "/examples/menu", label: "Menu" },
  { href: "/examples/menu-bar", label: "Menu bar" },
  { href: "/examples/menu-combobox", label: "Menu combobox" },
  { href: "/examples/menu-item-checkbox", label: "Menu item checkbox" },
  { href: "/examples/menu-item-radio", label: "Menu item radio" },
  { href: "/examples/menu-nested", label: "Menu nested" },
  { href: "/examples/popover", label: "Popover" },
  { href: "/examples/popover-flip", label: "Popover flip" },
  { href: "/examples/popover-responsive", label: "Popover responsive" },
  { href: "/examples/popover-selection", label: "Popover selection" },
  { href: "/examples/popover-standalone", label: "Popover standalone" },
  { href: "/examples/portal", label: "Portal" },
  { href: "/examples/portal-lazy", label: "Portal lazy" },
  { href: "/examples/radio", label: "Radio" },
  { href: "/examples/select", label: "Select" },
  { href: "/examples/select-autofill", label: "Select autofill" },
  { href: "/examples/select-combobox", label: "Select combobox" },
  { href: "/examples/select-grid", label: "Select grid" },
  { href: "/examples/select-group", label: "Select group" },
  { href: "/examples/select-item-custom", label: "Select item custom" },
  { href: "/examples/select-multiple", label: "Select multiple" },
  { href: "/examples/separator", label: "Separator" },
  { href: "/examples/tab", label: "Tab" },
  { href: "/examples/tab-react-router", label: "Tab react-router" },
  { href: "/examples/toolbar", label: "Toolbar" },
  { href: "/examples/toolbar-select", label: "Toolbar with Select" },
  { href: "/examples/tooltip", label: "Tooltip" },
  { href: "/examples/tooltip-placement", label: "Tooltip placement" },
  { href: "/examples/tooltip-timeout", label: "Tooltip timeout" },
].sort((a, b) => a.label.localeCompare(b.label));

export default function Home() {
  const select = useSelectState({ defaultValue: `v${pkg.version}` });
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="layer-2 fixed p-4 gap-4 top-0 left-0 z-40 flex w-full items-center bg-canvas-2 supports-backdrop-blur:bg-canvas-2/80 backdrop-blur dark:bg-canvas-2-dark dark:supports-backdrop-blur:bg-canvas-2-dark/80">
        <Link href="/">
          <a className="flex items-center gap-2 rounded-[9px] focus-visible:ariakit-outline">
            <VisuallyHidden>Ariakit</VisuallyHidden>
            <svg
              aria-hidden
              height="36"
              viewBox="0 0 48 48"
              className="fill-primary-2 dark:fill-primary-2-dark-foreground"
            >
              <circle cx="29" cy="24" r="5" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 4C7.58172 4 4 7.58172 4 12V36C4 40.4183 7.58172 44 12 44H36C40.4183 44 44 40.4183 44 36V12C44 7.58172 40.4183 4 36 4H12ZM23.9997 35.9997C30.6271 35.9997 35.9997 30.6271 35.9997 23.9997C35.9997 17.3723 30.6271 11.9997 23.9997 11.9997C17.3723 11.9997 11.9997 17.3723 11.9997 23.9997C11.9997 30.6271 17.3723 35.9997 23.9997 35.9997Z"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 0C5.37258 0 0 5.37258 0 12V36C0 42.6274 5.37258 48 12 48H36C42.6274 48 48 42.6274 48 36V12C48 5.37258 42.6274 0 36 0H12ZM12 2C6.47715 2 2 6.47715 2 12V36C2 41.5228 6.47715 46 12 46H36C41.5228 46 46 41.5228 46 36V12C46 6.47715 41.5228 2 36 2H12Z"
              />
            </svg>
            <svg
              aria-hidden
              height="20"
              viewBox="0 0 150 40"
              fill="currentColor"
            >
              <path d="M0 31.8444C0 26.1477 4.54821 23.0601 15.2874 21.9363C15.1253 19.572 13.9408 18.0421 10.9962 18.0421C8.71647 18.0421 6.44237 18.999 3.81066 20.4843L0.949871 15.2271C4.39735 13.1298 8.28065 11.6667 12.5495 11.6667C19.4891 11.6667 23.3333 15.6166 23.3333 23.9057V39.3603H16.768L16.2093 36.5787H16.0081C13.7229 38.5758 11.1582 40 8.10744 40C3.14016 39.9945 0 36.3951 0 31.8444ZM15.2874 31.4828V26.7652C9.56577 27.5329 7.69955 29.1629 7.69955 31.2157C7.69955 32.957 8.90644 33.8082 10.8174 33.8082C12.6389 33.7971 13.8625 32.9181 15.2874 31.4828V31.4828Z" />
              <path d="M28.8048 12.3321H35.3844L35.9444 17.0567H36.1459C38.1282 13.4451 41.1016 11.6755 43.8791 11.6755C44.9878 11.6222 46.0948 11.8121 47.1213 12.232L45.783 19.1491C44.8272 18.8732 43.8383 18.7272 42.8431 18.715C40.7937 18.715 38.3018 20.0283 36.8515 23.7234V39.394H28.788L28.8048 12.3321Z" />
              <path d="M48.7878 4.18978C48.7878 1.73044 50.7295 0 53.4091 0C56.0886 0 58.0303 1.73044 58.0303 4.18978C58.0303 6.64912 56.0886 8.37399 53.4091 8.37399C50.7295 8.37399 48.7878 6.62686 48.7878 4.18978ZM49.4036 12.3579H57.3923V39.3939H49.4036V12.3579Z" />
              <path d="M62.1212 31.8444C62.1212 26.1477 66.6443 23.0601 77.3112 21.9363C77.1502 19.572 75.9736 18.0421 73.0433 18.0421C70.7845 18.0421 68.5257 18.999 65.9117 20.4843L63.0702 15.2271C66.4889 13.1298 70.3461 11.6667 74.5862 11.6667C81.4847 11.6667 85.303 15.6166 85.303 23.9057V39.3603H78.7819L78.2269 36.5787H78.0271C75.7572 38.5758 73.2154 40 70.1851 40C65.2457 39.9945 62.1212 36.3951 62.1212 31.8444ZM77.3112 31.4828V26.7652C71.6281 27.5329 69.7744 29.1629 69.7744 31.2157C69.7744 32.957 70.9676 33.8082 72.8657 33.8082C74.675 33.7971 75.8904 32.9181 77.3112 31.4828V31.4828Z" />
              <path d="M90.4546 1.06061H98.2912V23.0045H98.4917L107.075 12.2698H115.786L106.317 23.4343L116.515 39.3772H107.826L101.728 28.7877L98.2912 32.6952V39.3939H90.4546V1.06061Z" />
              <path d="M118.636 4.18978C118.636 1.73044 120.546 0 123.182 0C125.818 0 127.727 1.73044 127.727 4.18978C127.727 6.64912 125.818 8.37399 123.182 8.37399C120.546 8.37399 118.636 6.62686 118.636 4.18978ZM119.242 12.3579H127.1V39.3939H119.242V12.3579Z" />
              <path d="M134.125 29.5265V18.6253H130.455V12.6524L134.573 12.3745L135.504 5.15149H142.097V12.3745H148.547V18.653H142.097V29.4321C142.097 32.4935 143.481 33.7214 145.579 33.7214C146.454 33.6929 147.318 33.5202 148.137 33.2103L149.394 39.0443C147.47 39.6815 145.457 40.0042 143.431 39.9999C136.788 39.9999 134.125 35.7828 134.125 29.5265Z" />
            </svg>
          </a>
        </Link>
        <div className="flex gap-1 items-center">
          <Select
            state={select}
            className={cx(
              button(),
              "rounded-lg text-xs h-8 px-2 focus-visible:ariakit-outline-input bg-primary-1 dark:bg-alpha-3-dark hover:bg-alpha-3-hover dark:hover:bg-alpha-3-dark-hover font-semibold dark:text-alpha-3-dark/90 mr-2"
            )}
          />
          <SelectPopover state={select} className={cx(popup(), "p-2")}>
            <SelectItem value="v2.0.0-next.34" />
            <SelectItem value="v1.3.10" />
          </SelectPopover>
          <div className="opacity-30 font-semibold">/</div>
          <button
            className={cx(
              button(),
              "rounded-lg h-8 px-2 focus-visible:ariakit-outline-input"
            )}
          >
            Examples
          </button>
          <div className="opacity-30 font-semibold">/</div>
          <button
            className={cx(
              button(),
              "rounded-lg h-8 px-2 focus-visible:ariakit-outline-input"
            )}
          >
            Button as link
          </button>
        </div>
        <button
          className={cx(button(), "ml-auto")}
          onClick={() => {
            if (document.documentElement.classList.contains("dark")) {
              document.documentElement.classList.remove("dark");
              document.documentElement.classList.add("light");
              localStorage.setItem("theme", "light");
            } else {
              document.documentElement.classList.remove("light");
              document.documentElement.classList.add("dark");
              localStorage.setItem("theme", "dark");
            }
          }}
        >
          Toggle dark mode
        </button>
      </div>
      <h1 className="text-3xl font-semibold mt-10">Hello!</h1>

      <p>
        The Ariakit docs are still under construction. You can{" "}
        <a
          href="https://newsletter.ariakit.org"
          className="rounded-lg text-link dark:text-link-dark underline hover:decoration-[3px] [text-decoration-skip-ink:none]"
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
