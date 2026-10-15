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
  Button,
  ButtonGroup,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { ShellMainFull } from "@ariakit/ui/components/shell.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";
import { CodeIcon, ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface SampleFile {
  name: string;
  content: string;
}

export interface SampleCardProps {
  id: string;
  title: string;
  href: string;
  files: SampleFile[];
  fullscreen?: boolean;
  children?: ReactNode;
}

/**
 * A preview with its title and code, spanning the full width of the site's main
 * area. The layout script toggles the code region, because the card renders
 * without hydration.
 */
export function SampleCard({
  id,
  title,
  href,
  files,
  fullscreen,
  children,
}: SampleCardProps) {
  const headingId = `${id}-title`;
  const codeId = `${id}-code`;
  return (
    <ShellMainFull render={<section aria-labelledby={headingId} />}>
      {/* Samples inside MDX prose are not main bands, so they drop the band
          gutter and align with the surrounding text. */}
      <Frame
        $p="var(--site-gutter)"
        className="grid grid-cols-1 gap-2 py-0! [.prose>.shell-main-full>&]:px-0!"
      >
        <div className="flex items-center justify-between gap-2 text-sm">
          <TextFrame
            id={headingId}
            render={<h2 />}
            $p={3}
            $layer="transparent"
            className="font-medium"
          >
            {title}
          </TextFrame>
          <ButtonGroup
            $rounded="xl"
            $p={0.5}
            $forceRounded
            $layer="transparent"
          >
            <Button
              aria-expanded="false"
              aria-controls={codeId}
              data-code-toggle
              className="ak-ink-80 ui-hover:ak-ink-100"
            >
              <ButtonSlot>
                <CodeIcon />
              </ButtonSlot>
              <ButtonLabel>Get code</ButtonLabel>
            </Button>
            <Button
              render={<a href={href} target="_blank" rel="noreferrer" />}
              aria-label="Open preview in a new tab"
              className="ak-ink-80 ui-hover:ak-ink-100"
            >
              <ButtonSlot>
                <ExternalLinkIcon />
              </ButtonSlot>
            </Button>
          </ButtonGroup>
        </div>
        <Frame
          $rounded="xl"
          $forceRounded
          $border
          $darken={0.5}
          $p={children ? 4 : "none"}
          className="grid grid-cols-1 overflow-clip"
        >
          {children ?? (
            <iframe
              src={href}
              title={title}
              loading="lazy"
              className="block w-full border-0 bg-transparent"
              style={{ height: fullscreen ? "40rem" : "25rem" }}
            />
          )}
        </Frame>
        <div id={codeId} role="region" aria-label={`${title} code`} hidden>
          <div className="grid grid-cols-1 gap-2">
            {files.map((file) => (
              <Frame
                key={file.name}
                $rounded="xl"
                $forceRounded
                $border
                $darken={0.5}
                $p="none"
                className="overflow-clip text-xs"
              >
                <TextFrame
                  $p={3}
                  $layer="transparent"
                  className="ak-ink-80 font-medium"
                >
                  {file.name}
                </TextFrame>
                <pre className="max-h-96 overflow-auto px-4 pb-4 leading-relaxed">
                  <code>{file.content}</code>
                </pre>
              </Frame>
            ))}
          </div>
        </div>
      </Frame>
    </ShellMainFull>
  );
}
