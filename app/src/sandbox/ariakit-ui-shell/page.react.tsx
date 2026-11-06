/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Nav, NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import {
  Shell,
  ShellCenter,
  ShellContent,
  ShellEnd,
  ShellFooter,
  ShellFull,
  ShellHeader,
  ShellMain,
  ShellMainBody,
  ShellSidebar,
  ShellSidebarBody,
  ShellStart,
} from "@ariakit/ui/components/shell.ariakit.react";
import type { ReactNode } from "react";
import { useState } from "react";

// Enough elements in the header area that a fold restyling them is easy to
// notice.
const items = Array.from({ length: 60 }, (_, index) => (
  <span key={index} className="sr-only">
    Item {index + 1}
  </span>
));

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label>
      <input
        type="checkbox"
        tabIndex={0}
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />{" "}
      {label}
    </label>
  );
}

interface SidebarItemsProps {
  label: string;
  links: readonly string[];
}

/** The rows of a sidebar, in a group whose edges the tests compare. */
function SidebarItems({ label, links }: SidebarItemsProps) {
  return (
    <div role="group" aria-label={label} className="grid gap-2">
      {links.map((link) => (
        // WebKit leaves links out of the Tab order unless full keyboard access
        // is on.
        <a key={link} href={`#${link}`} tabIndex={0}>
          {link}
        </a>
      ))}
    </div>
  );
}

/**
 * A page in a centered box. `$maxWidth` on the root shell sets the box, while
 * the bars span the page and their content areas line up with it.
 */
export function PageScenario({ controls }: { controls: ReactNode }) {
  const [maxWidth, setMaxWidth] = useState(true);
  const [numberWidth, setNumberWidth] = useState(false);
  const [nested, setNested] = useState(true);
  const [appSidebar, setAppSidebar] = useState(false);
  const [startOpen, setStartOpen] = useState(true);
  const [endOpen, setEndOpen] = useState(true);
  const [edgeParts, setEdgeParts] = useState(false);
  const [innerHeader, setInnerHeader] = useState(false);
  const [innerMaxWidth, setInnerMaxWidth] = useState(false);
  const [thirdLevel, setThirdLevel] = useState(false);
  const [longParts, setLongParts] = useState(false);
  const [stackCenter, setStackCenter] = useState(false);
  const [areaNav, setAreaNav] = useState(false);
  const [barPadding, setBarPadding] = useState(false);
  // A custom padding on the outer header and the inner shell's header.
  const headerPadding = barPadding ? "16px" : undefined;
  const options = (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {controls}
      <Checkbox label="Max width" checked={maxWidth} onChange={setMaxWidth} />
      <Checkbox
        label="Number max width"
        checked={numberWidth}
        onChange={setNumberWidth}
      />
      <Checkbox label="Nested shell" checked={nested} onChange={setNested} />
      <Checkbox
        label="App sidebar"
        checked={appSidebar}
        onChange={setAppSidebar}
      />
      <Checkbox
        label="Start sidebar"
        checked={startOpen}
        onChange={setStartOpen}
      />
      <Checkbox label="End sidebar" checked={endOpen} onChange={setEndOpen} />
      <Checkbox
        label="Edge parts"
        checked={edgeParts}
        onChange={setEdgeParts}
      />
      <Checkbox
        label="Inner header"
        checked={innerHeader}
        onChange={setInnerHeader}
      />
      <Checkbox
        label="Inner max width"
        checked={innerMaxWidth}
        onChange={setInnerMaxWidth}
      />
      <Checkbox
        label="Third level"
        checked={thirdLevel}
        onChange={setThirdLevel}
      />
      <Checkbox
        label="Long parts"
        checked={longParts}
        onChange={setLongParts}
      />
      <Checkbox
        label="Stack center"
        checked={stackCenter}
        onChange={setStackCenter}
      />
      <Checkbox
        label="Navigation in the area"
        checked={areaNav}
        onChange={setAreaNav}
      />
      <Checkbox
        label="Bar padding"
        checked={barPadding}
        onChange={setBarPadding}
      />
    </div>
  );
  const body = (
    <ShellMainBody>
      <ShellContent role="group" aria-label="Body column">
        {options}
      </ShellContent>
      <ShellFull role="group" aria-label="Body band" $layer="brand">
        <ShellContent>
          <p>A band across the whole main area.</p>
        </ShellContent>
      </ShellFull>
    </ShellMainBody>
  );
  const main = thirdLevel ? (
    // A shell directly inside the inner shell, which takes its box from the
    // inner shell's width.
    <Shell>
      <ShellSidebar landmark="nav" aria-label="Third sidebar" $show $width="xs">
        <ShellSidebarBody>
          <SidebarItems label="Third items" links={["Overview"]} />
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellMain>{body}</ShellMain>
    </Shell>
  ) : (
    <ShellMain>{body}</ShellMain>
  );
  const page = nested ? (
    <Shell $maxWidth={innerMaxWidth ? "36rem" : undefined}>
      {innerHeader && (
        <ShellHeader
          $sticky={false}
          $p={headerPadding}
          aria-label="Inner header"
        >
          <ShellStart role="group" aria-label="Inner start">
            Inner start
          </ShellStart>
          <ShellContent role="group" aria-label="Inner header area">
            <div>Inner header area</div>
          </ShellContent>
          <ShellEnd role="group" aria-label="Inner end">
            Inner end
          </ShellEnd>
        </ShellHeader>
      )}
      <ShellSidebar
        landmark="nav"
        aria-label="Start sidebar"
        $show
        open={startOpen}
      >
        <ShellSidebarBody>
          <SidebarItems
            label="Start items"
            links={["Introduction", "Installation", "Styling"]}
          />
        </ShellSidebarBody>
      </ShellSidebar>
      {main}
      <ShellSidebar
        landmark="aside"
        aria-label="End sidebar"
        $side="end"
        $show
        open={endOpen}
      >
        <ShellSidebarBody>
          <SidebarItems label="End items" links={["On this page"]} />
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  ) : (
    <ShellMain>{body}</ShellMain>
  );
  return (
    // 320 quarters of the shell's 14px text are 1120px.
    <Shell $maxWidth={maxWidth ? (numberWidth ? 320 : "80rem") : undefined}>
      <ShellHeader $stackCenter={stackCenter} $p={headerPadding}>
        {edgeParts && (
          <ShellStart role="group" aria-label="Edge start">
            Menu
          </ShellStart>
        )}
        <ShellContent role="group" aria-label="Header area">
          <ShellStart role="group" aria-label="Area start">
            {longParts ? (
              <span className="whitespace-nowrap">
                A much longer product name
              </span>
            ) : (
              "Brand"
            )}
          </ShellStart>
          <ShellCenter role="group" aria-label="Area center">
            {areaNav ? (
              <Nav aria-label="Header links" $layout="horizontal" $p="none" bar>
                <NavLink
                  href="#guides"
                  text="Guides"
                  aria-current="page"
                  tabIndex={0}
                />
                <NavLink href="#api" text="API" tabIndex={0} />
              </Nav>
            ) : (
              <>Search{items}</>
            )}
          </ShellCenter>
          <ShellEnd role="group" aria-label="Area end">
            Theme
          </ShellEnd>
        </ShellContent>
        {edgeParts && (
          <ShellEnd role="group" aria-label="Edge end">
            Account
          </ShellEnd>
        )}
      </ShellHeader>
      {appSidebar && (
        <ShellSidebar landmark="nav" aria-label="App sidebar" $show $width="sm">
          <ShellSidebarBody>
            <SidebarItems label="App items" links={["Projects"]} />
          </ShellSidebarBody>
        </ShellSidebar>
      )}
      {page}
      <ShellFooter>
        <ShellContent role="group" aria-label="Footer area">
          <ShellStart>Ariakit</ShellStart>
          <ShellEnd>Help</ShellEnd>
        </ShellContent>
      </ShellFooter>
    </Shell>
  );
}
