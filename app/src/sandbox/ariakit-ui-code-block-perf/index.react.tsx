import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  CodeBlock,
  CodeBlockCode,
} from "@ariakit/ui/components/code-block.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { useState } from "react";
import type { load } from "./index.server.ts";

export default function Example({ code }: ReturnType<typeof load>) {
  const [light, setLight] = useState(false);
  const [inserted, setInserted] = useState(false);
  return (
    <Frame
      $layer={light ? "oklch(0.97 0 0)" : "oklch(0.2 0 0)"}
      $p={4}
      className="grid w-3xl max-w-full gap-4"
    >
      <div className="flex gap-2">
        <Button aria-pressed={light} onClick={() => setLight(!light)}>
          Light layer
        </Button>
        <Button aria-pressed={inserted} onClick={() => setInserted(!inserted)}>
          Insert a file
        </Button>
      </div>
      <CodeBlock title="format-price.ts">
        <CodeBlockCode html={code.html} $maxLines={8} />
      </CodeBlock>
      {inserted && (
        <CodeBlock title="inserted.ts">
          <CodeBlockCode html={code.html} $maxLines={8} />
        </CodeBlock>
      )}
    </Frame>
  );
}
