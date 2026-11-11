import {
  CodeBlock,
  CodeBlockCode,
} from "@ariakit/ui/components/code-block.ariakit.react";
import type { load } from "./index.server.ts";

export default function Example({ code }: ReturnType<typeof load>) {
  return (
    // Without a title, the copy button shows in the top end corner, over the
    // end of the first line. The first line leaves room for it.
    <CodeBlock className="w-xl max-w-full">
      <CodeBlockCode
        html={code.html}
        copy={code.text}
        aria-label="Counter component"
      />
    </CodeBlock>
  );
}
