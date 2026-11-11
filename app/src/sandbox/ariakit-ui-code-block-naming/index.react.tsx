import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockTitle,
} from "@ariakit/ui/components/code-block.ariakit.react";
import type { load } from "./index.server.ts";

export default function Example({ config, store }: ReturnType<typeof load>) {
  return (
    <div className="flex w-xl max-w-full flex-col gap-6">
      {/* A title with an id of its own names the code in the server HTML
          too. */}
      <CodeBlock
        title={<CodeBlockTitle id="config-title">config.ts</CodeBlockTitle>}
      >
        <CodeBlockCode html={config.html} copy={config.text} />
      </CodeBlock>
      {/* Another element replaces the title part, so it doesn't name the
          code, and the copy button takes a label of its own. */}
      <CodeBlock title={<span className="px-3 py-1 text-sm">store.json</span>}>
        <CodeBlockCode
          html={store.html}
          copy={{ value: store.text, label: "Copy store.json" }}
        />
      </CodeBlock>
    </div>
  );
}
