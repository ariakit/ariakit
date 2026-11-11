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
      {/* Each panel is the scroll area of its file. It takes the tab stop and
          the name of its tab, and its copy button names the tab too. */}
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
