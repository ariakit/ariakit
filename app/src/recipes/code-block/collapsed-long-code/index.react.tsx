import {
  CodeBlock,
  CodeBlockCode,
} from "@ariakit/ui/components/code-block.ariakit.react";
import type { load } from "./index.server.ts";

export default function Example({ code }: ReturnType<typeof load>) {
  return (
    <CodeBlock title="use-users.ts" maxLines={12} className="w-xl max-w-full">
      <CodeBlockCode html={code.html} copy={code.text} $lineNumbers />
    </CodeBlock>
  );
}
