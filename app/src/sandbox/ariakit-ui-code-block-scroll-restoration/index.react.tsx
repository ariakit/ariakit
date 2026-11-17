import {
  CodeBlock,
  CodeBlockPanel,
  CodeBlockTab,
  CodeBlockTabList,
} from "@ariakit/ui/components/code-block.ariakit.react";
import { useState } from "react";

const commands = {
  npm: "npm install @ariakit/react @tanstack/react-query lucide-react clsx",
  pnpm: "pnpm add @ariakit/react @tanstack/react-query lucide-react clsx",
  yarn: "yarn add @ariakit/react @tanstack/react-query lucide-react clsx",
};

type PackageManager = keyof typeof commands;

function isPackageManager(id?: string | null): id is PackageManager {
  return !!id && Object.hasOwn(commands, id);
}

export default function Example() {
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    "npm",
  );
  const command = isPackageManager(selectedId) ? commands[selectedId] : "";
  return (
    // A narrow block, so the commands scroll sideways.
    <CodeBlock
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      className="w-72 max-w-full"
    >
      <CodeBlockTabList aria-label="Package managers">
        <CodeBlockTab id="npm">npm</CodeBlockTab>
        <CodeBlockTab id="pnpm" separator>
          pnpm
        </CodeBlockTab>
        <CodeBlockTab id="yarn" separator>
          yarn
        </CodeBlockTab>
      </CodeBlockTabList>
      {/* One panel follows the selected tab, and it keeps the scroll position
          of the code for each tab. */}
      <CodeBlockPanel single scrollRestoration $prompt>
        {command}
      </CodeBlockPanel>
    </CodeBlock>
  );
}
