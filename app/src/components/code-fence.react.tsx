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
  CodeBlock,
  CodeBlockCode,
  CodeBlockPanel,
  CodeBlockTab,
  CodeBlockTabList,
} from "@ariakit/ui/components/code-block.ariakit.react";
import { useId } from "react";
import type { InstallBlockProps } from "#app/recipes/code-block/code-blocks-in-prose/install-block.react.tsx";
import { InstallBlock } from "#app/recipes/code-block/code-blocks-in-prose/install-block.react.tsx";
import { FileIcon } from "#app/recipes/code-block/file-icon.react.tsx";
import type { FileIconData } from "#app/recipes/code-block/file-icons.ts";

/** The code of one fence, highlighted at build time. */
export interface CodeFenceFile {
  title?: string;
  icon?: FileIconData;
  /** The `html` of `highlight`. */
  html: string;
  /** The `text` of `highlight`, which the copy button copies. */
  text: string;
  lineNumbers?: boolean;
  wrap?: boolean;
  prompt?: boolean;
}

export type CodeFenceProps =
  | { kind: "code"; file: CodeFenceFile; maxLines?: number }
  | { kind: "tabs"; files: CodeFenceFile[]; maxLines?: number }
  | { kind: "install"; commands: InstallBlockProps["commands"] };

function getTitle(file: CodeFenceFile) {
  if (!file.title) return;
  return {
    children: file.title,
    icon: file.icon && <FileIcon icon={file.icon} />,
  };
}

function getCodeProps(file: CodeFenceFile) {
  return {
    html: file.html,
    copy: file.text,
    $lineNumbers: file.lineNumbers,
    $wrap: file.wrap,
    $prompt: file.prompt,
  };
}

function TabsFence({
  files,
  maxLines,
}: Extract<CodeFenceProps, { kind: "tabs" }>) {
  // Tab ids are element ids, so each block on the page needs its own.
  const prefix = useId();
  const getTabId = (index: number) => `${prefix}-${index}`;
  return (
    <CodeBlock defaultSelectedId={getTabId(0)} maxLines={maxLines}>
      <CodeBlockTabList aria-label="Files">
        {files.map((file, index) => (
          <CodeBlockTab
            key={index}
            id={getTabId(index)}
            icon={file.icon && <FileIcon icon={file.icon} />}
            separator={!!index}
          >
            {file.title}
          </CodeBlockTab>
        ))}
      </CodeBlockTabList>
      {files.map((file, index) => (
        <CodeBlockPanel
          key={index}
          tabId={getTabId(index)}
          {...getCodeProps(file)}
        />
      ))}
    </CodeBlock>
  );
}

/**
 * Renders a fenced code block of an MDX page as an Ariakit UI code block. The
 * `remarkCodeFences` plugin reads the info string of each fence, highlights its
 * code at build time, and renders this component as an island, so the browser
 * never loads the highlighter.
 */
export function CodeFence(props: CodeFenceProps) {
  // The app gives an island the display of its parent, so in a flex column,
  // such as Prose, the island is a flex row, and the block would shrink to the
  // width of its code. The wrapper fills the row instead.
  return <div className="w-full min-w-0">{renderBlock(props)}</div>;
}

function renderBlock(props: CodeFenceProps) {
  if (props.kind === "install") {
    return <InstallBlock commands={props.commands} />;
  }
  if (props.kind === "tabs") {
    return <TabsFence {...props} />;
  }
  const { file, maxLines } = props;
  return (
    <CodeBlock title={getTitle(file)} maxLines={maxLines}>
      <CodeBlockCode {...getCodeProps(file)} />
    </CodeBlock>
  );
}
