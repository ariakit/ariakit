import {
  CodeBlock,
  CodeBlockPanel,
  CodeBlockTab,
  CodeBlockTabList,
} from "@ariakit/ui/components/code-block.ariakit.react";
import { FileIcon } from "../file-icon.react.tsx";
import type { load } from "./index.server.ts";

export default function Example({ files }: ReturnType<typeof load>) {
  return (
    <CodeBlock defaultSelectedId={files[0]?.name} className="w-xl max-w-full">
      {/* The tabs are wider than the block, so the strip scrolls sideways and
          fades them at the ends. With a mouse, buttons at the ends scroll it
          too. */}
      <CodeBlockTabList aria-label="Files">
        {files.map((file, index) => (
          <CodeBlockTab
            key={file.name}
            id={file.name}
            icon={file.icon && <FileIcon icon={file.icon} />}
            separator={!!index}
          >
            {file.name}
          </CodeBlockTab>
        ))}
      </CodeBlockTabList>
      {files.map((file) => (
        <CodeBlockPanel
          key={file.name}
          tabId={file.name}
          html={file.html}
          copy={file.text}
        />
      ))}
    </CodeBlock>
  );
}
