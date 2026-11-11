import {
  CodeBlock,
  CodeBlockCode,
} from "@ariakit/ui/components/code-block.ariakit.react";
import type { load } from "./index.server.ts";

export default function Example({ code }: ReturnType<typeof load>) {
  return (
    // Without a title, the copy button shows at the end of the line.
    <CodeBlock className="w-md max-w-full">
      <CodeBlockCode
        html={code.html}
        copy={{ value: code.text, label: "Copy command" }}
        $prompt
        aria-label="Install command"
      />
    </CodeBlock>
  );
}
