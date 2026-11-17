/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { CopyButton } from "@ariakit/ui/components/copy-button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { useId } from "react";

export interface AgentPromptProps {
  /** The prompt that people give to their coding agent. */
  prompt: string;
  /** @default "Prompt for your agent" */
  title?: string;
}

/**
 * Shows a prompt for a coding agent with a button that copies it. The page
 * needs `client:load` on this component, so the button copies, and a click
 * right after the page loads isn't lost before the button hydrates.
 */
export function AgentPrompt({
  prompt,
  title = "Prompt for your agent",
}: AgentPromptProps) {
  const titleId = useId();
  return (
    <Frame
      render={<section aria-labelledby={titleId} />}
      data-agent-prompt
      $border
      $rounded="2xl"
      $lighten={0.3}
      $p={1}
    >
      <div className="flex items-center justify-between gap-2 ps-3">
        <p id={titleId} className="font-medium">
          {title}
        </p>
        <CopyButton value={prompt}>Copy prompt</CopyButton>
      </div>
      <Frame
        render={<pre />}
        $border
        $borderType="ring"
        $layer="canvas"
        $p={4}
        className="font-mono text-sm whitespace-pre-wrap"
      >
        {prompt}
      </Frame>
    </Frame>
  );
}
