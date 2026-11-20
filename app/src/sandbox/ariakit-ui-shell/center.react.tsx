/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import {
  Shell,
  ShellContent,
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

// Enough messages that a toggle that restyles them is easy to notice.
const messages = Array.from({ length: 80 }, (_, index) => (
  <p key={index}>Message {index + 1} in the conversation.</p>
));

/**
 * A chat with its own settings sidebar in a panel of the window shell. With
 * `$center="outer"`, the chat stays on the center of the window while the
 * sidebars of the window and of the chat open and close. The end sidebar of the
 * window comes after main in the DOM. "Directly inside" renders the chat shell
 * as a direct child of the window shell, without a main around it.
 */
export function CenterScenario({ controls }: { controls: ReactNode }) {
  const [outer, setOuter] = useState(true);
  const [direct, setDirect] = useState(false);
  const [startOpen, setStartOpen] = useState(true);
  const [endOpen, setEndOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [chatHeader, setChatHeader] = useState(false);
  const [slowFolds, setSlowFolds] = useState(false);
  const chat = (
    <Shell $center={outer ? "outer" : "shell"} $maxWidth="20rem">
      {chatHeader && (
        <ShellHeader $sticky={false} aria-label="Chat header">
          <ShellContent role="group" aria-label="Chat header area">
            Chat header area
          </ShellContent>
        </ShellHeader>
      )}
      <ShellMain $size="auto">
        <ShellMainBody>
          <div role="group" aria-label="Conversation">
            {messages}
          </div>
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        landmark="aside"
        aria-label="Settings"
        $side="end"
        open={settingsOpen}
        $show
        $width="sm"
      >
        <ShellSidebarBody>Settings</ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
  return (
    // The chat sets no duration, so it takes the timing of the window.
    <Shell $duration={slowFolds ? 900 : undefined}>
      <ShellHeader>
        <ShellStart className="flex-wrap gap-x-4">
          {controls}
          <Checkbox
            label="Center on the outer shell"
            checked={outer}
            onChange={setOuter}
          />
          <Checkbox
            label="Directly inside"
            checked={direct}
            onChange={setDirect}
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
          <Checkbox
            label="Settings"
            checked={settingsOpen}
            onChange={setSettingsOpen}
          />
          <Checkbox
            label="Chat header"
            checked={chatHeader}
            onChange={setChatHeader}
          />
          <Checkbox
            label="Slow window folds"
            checked={slowFolds}
            onChange={setSlowFolds}
          />
        </ShellStart>
      </ShellHeader>
      {/* The default `$show` hides it below 48rem, also while it's open. */}
      <ShellSidebar
        landmark="nav"
        aria-label="Start sidebar"
        open={startOpen}
        $width="lg"
      >
        <ShellSidebarBody>Navigation</ShellSidebarBody>
      </ShellSidebar>
      {direct ? (
        chat
      ) : (
        <ShellMain $size="auto">
          {/* A panel in main, like a tab panel. The same space at both sides
              keeps the chat on the center of the window. */}
          <div
            role="group"
            aria-label="Panel"
            className="col-[main] row-[main-header-start/body-end] m-2"
          >
            {chat}
          </div>
        </ShellMain>
      )}
      <ShellSidebar
        landmark="aside"
        aria-label="End sidebar"
        $side="end"
        open={endOpen}
        $show
        $width="xs"
      >
        <ShellSidebarBody>Details</ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
