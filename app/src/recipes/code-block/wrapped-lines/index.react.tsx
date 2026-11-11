import {
  CodeBlock,
  CodeBlockCode,
} from "@ariakit/ui/components/code-block.ariakit.react";
import { FileIcon } from "../file-icon.react.tsx";
import type { load } from "./index.server.ts";

export default function Example({ code, icon }: ReturnType<typeof load>) {
  return (
    <CodeBlock
      title={{
        children: "package.json",
        icon: icon && <FileIcon icon={icon} />,
      }}
      className="w-lg max-w-full"
    >
      {/* A wrapped line starts after the gutter of the line numbers, and its
          mark covers every row of it. */}
      <CodeBlockCode html={code.html} copy={code.text} $wrap $lineNumbers />
    </CodeBlock>
  );
}
