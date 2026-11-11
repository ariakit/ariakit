import {
  CodeBlock,
  CodeBlockCode,
} from "@ariakit/ui/components/code-block.ariakit.react";
import { FileIcon } from "../file-icon.react.tsx";
import type { load } from "./index.server.ts";

export default function Example({ code, icon }: ReturnType<typeof load>) {
  return (
    // The title names the scroll area and the copy button, which is "Copy
    // format-price.ts".
    <CodeBlock
      title={{
        children: "format-price.ts",
        icon: icon && <FileIcon icon={icon} />,
      }}
      className="w-xl max-w-full"
    >
      <CodeBlockCode html={code.html} copy={code.text} />
    </CodeBlock>
  );
}
