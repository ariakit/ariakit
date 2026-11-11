import {
  CodeBlock,
  CodeBlockCode,
} from "@ariakit/ui/components/code-block.ariakit.react";
import type { load } from "./index.server.ts";

export default function Example({ code }: ReturnType<typeof load>) {
  return (
    <CodeBlock title="fetch-users.ts" className="w-xl max-w-full">
      {/* The numbers stay in view when the code scrolls sideways, and they
          keep the bar of each marked line. */}
      <CodeBlockCode html={code.html} copy={code.text} $lineNumbers />
    </CodeBlock>
  );
}
