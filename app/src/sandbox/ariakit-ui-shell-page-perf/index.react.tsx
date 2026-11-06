/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Shell,
  ShellCenter,
  ShellContent,
  ShellEnd,
  ShellFooter,
  ShellHeader,
  ShellMain,
  ShellMainBody,
  ShellMainHeader,
  ShellSidebar,
  ShellSidebarBody,
  ShellStart,
} from "@ariakit/ui/components/shell.ariakit.react";
import { useId, useState } from "react";

// Enough elements inside each part that a fold restyling a part's content shows
// up in the metrics. These are constants so a toggle doesn't rerender them, and
// the measured work stays in the shell.
const tabs = (
  <div className="flex h-5 max-w-sm overflow-hidden">
    {Array.from({ length: 200 }, (_, index) => (
      <span key={index} className="shrink-0 px-2">
        Tab {index + 1}
      </span>
    ))}
  </div>
);
const paragraphs = Array.from({ length: 400 }, (_, index) => (
  <p key={index}>Paragraph {index + 1}</p>
));

/**
 * A page box: `$maxWidth` on the outer shell centers the sidebars and main of
 * the shell inside it, while the bars span the page.
 */
export default function Example() {
  const [open, setOpen] = useState(true);
  const sidebarId = useId();
  return (
    <Shell $maxWidth="80rem">
      <ShellHeader>
        <ShellContent>
          <ShellStart>
            <Button
              aria-label="Toggle sidebar"
              aria-expanded={open}
              aria-controls={sidebarId}
              onClick={() => setOpen((open) => !open)}
            />
          </ShellStart>
          <ShellCenter>{tabs}</ShellCenter>
          <ShellEnd>Account</ShellEnd>
        </ShellContent>
      </ShellHeader>
      <Shell>
        <ShellSidebar
          id={sidebarId}
          landmark="nav"
          aria-label="Documentation"
          $show
          $width="lg"
          open={open}
        >
          <ShellSidebarBody>Sections</ShellSidebarBody>
        </ShellSidebar>
        <ShellMain>
          <ShellMainHeader>
            <ShellStart>Back</ShellStart>
            <ShellContent>{tabs}</ShellContent>
            <ShellEnd>Share</ShellEnd>
          </ShellMainHeader>
          <ShellMainBody>{paragraphs}</ShellMainBody>
        </ShellMain>
        <ShellSidebar landmark="aside" aria-label="On this page" $side="end">
          <ShellSidebarBody>Contents</ShellSidebarBody>
        </ShellSidebar>
      </Shell>
      <ShellFooter>
        <ShellContent>
          <ShellStart>Ariakit</ShellStart>
          <ShellCenter>{tabs}</ShellCenter>
          <ShellEnd>Help</ShellEnd>
        </ShellContent>
      </ShellFooter>
    </Shell>
  );
}
