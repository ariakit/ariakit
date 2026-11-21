/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavLink,
  NavLinkLabel,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellMain,
  ShellMainBody,
  ShellSidebar,
  ShellSidebarBody,
  ShellStart,
} from "@ariakit/ui/components/shell.ariakit.react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Checkbox } from "./page.react.tsx";

const revealValues = {
  off: "Off",
  place: "In place",
  zoom: "Zoom",
} as const;

type RevealId = keyof typeof revealValues;

function isRevealId(value: string): value is RevealId {
  return Object.hasOwn(revealValues, value);
}

function getReveal(value: RevealId) {
  if (value === "off") return;
  if (value === "place") return true;
  return value;
}

// Enough content that a sidebar toggle that restyles it is easy to notice.
const notebooks = [
  "All notes",
  ...Array.from({ length: 15 }, (_, index) => `Notebook ${index + 1}`),
];
const paragraphs = Array.from({ length: 30 }, (_, index) => (
  <p key={index}>
    Stop {index + 1}: the night train leaves at nine and reaches the coast
    before the morning light.
  </p>
));

interface SidebarLinksProps {
  links: readonly string[];
}

function SidebarLinks({ links }: SidebarLinksProps) {
  return (
    <Nav $p="none">
      {links.map((link) => (
        <NavLink key={link} href="#">
          <NavLinkLabel>{link}</NavLinkLabel>
        </NavLink>
      ))}
    </Nav>
  );
}

/**
 * Sidebars that main uncovers, like the sidebar beside a tab row, and a body
 * behind a wrapper in main, like the body of a tab panel. The end sidebar is
 * open on the first render and comes after main in the DOM. With
 * `$center="outer"`, the note stays on the center of the window while the
 * sidebars open and close.
 */
export function RevealScenario({ controls }: { controls: ReactNode }) {
  const [reveal, setReveal] = useState<RevealId>("zoom");
  const [outer, setOuter] = useState(true);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(true);
  const revealValue = getReveal(reveal);
  return (
    <Shell>
      <ShellHeader>
        <ShellStart className="flex-wrap gap-x-4">
          {controls}
          <Frame
            $p={1}
            $rounded="md"
            $border
            className="text-sm"
            render={
              <select
                aria-label="Reveal"
                value={reveal}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  if (isRevealId(value)) {
                    setReveal(value);
                  }
                }}
              />
            }
          >
            {Object.entries(revealValues).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </Frame>
          <Checkbox
            label="Center on the shell"
            checked={outer}
            onChange={setOuter}
          />
          <Checkbox
            label="Start sidebar"
            checked={startOpen}
            onChange={setStartOpen}
          />
          <Checkbox
            label="End sidebar"
            checked={endOpen}
            onChange={setEndOpen}
          />
        </ShellStart>
      </ShellHeader>
      <ShellSidebar
        landmark="nav"
        aria-label="Start sidebar"
        open={startOpen}
        $show
        $width="sm"
        $reveal={revealValue}
      >
        <ShellSidebarBody>
          <SidebarLinks links={notebooks} />
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellMain $size="auto">
        {/* A panel in main, like a tab panel. The same space at both sides
            keeps the note on the center of the window. */}
        <div
          role="group"
          aria-label="Panel"
          className="col-[main] row-[main-header-start/body-end] m-2"
        >
          <ShellMainBody $center={outer ? "outer" : "shell"}>
            <div role="group" aria-label="Note">
              {paragraphs}
            </div>
          </ShellMainBody>
        </div>
      </ShellMain>
      <ShellSidebar
        landmark="aside"
        aria-label="End sidebar"
        $side="end"
        open={endOpen}
        $show
        $width="sm"
        $reveal={revealValue}
      >
        <ShellSidebarBody>
          <SidebarLinks links={["Note details", "History"]} />
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
