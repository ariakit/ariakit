import {
  CodeBlock,
  CodeBlockPanel,
  CodeBlockTab,
  CodeBlockTabList,
} from "@ariakit/ui/components/code-block.ariakit.react";
import { useId } from "react";
import useLocalStorageState from "use-local-storage-state";
import { FileIcon } from "../file-icon.react.tsx";
import type { load } from "./index.server.ts";

type InstallCommand = ReturnType<typeof load>["library"][number];

export interface InstallBlockProps {
  commands: InstallCommand[];
}

/**
 * Renders an install command with a tab for each package manager. Every block
 * on the page shares the choice, and the browser remembers it. The server and
 * the first render show npm, so hydration matches the page, and the saved
 * choice applies right after it.
 */
export function InstallBlock({ commands }: InstallBlockProps) {
  // Tab ids are element ids, so each block needs its own.
  const prefix = useId();
  // Every hook with the same key shares the value, on this page and in other
  // tabs. Without storage, such as in some private windows, the choice lasts
  // until the page reloads.
  const [packageManager, setPackageManager] = useLocalStorageState(
    "package-manager",
    { defaultValue: "npm" },
  );
  const selected =
    commands.find((command) => command.packageManager === packageManager) ??
    commands[0];
  return (
    <CodeBlock
      selectedId={`${prefix}-${selected?.packageManager}`}
      setSelectedId={(id) => {
        if (!id) return;
        setPackageManager(id.slice(prefix.length + 1));
      }}
    >
      <CodeBlockTabList aria-label="Package manager">
        {commands.map((command, index) => (
          <CodeBlockTab
            key={command.packageManager}
            id={`${prefix}-${command.packageManager}`}
            icon={command.icon && <FileIcon icon={command.icon} />}
            separator={!!index}
          >
            {command.packageManager}
          </CodeBlockTab>
        ))}
      </CodeBlockTabList>
      {/* The tabs are views of one command, so one panel follows the selected
          tab. The page has more than one install block, so the label of the
          copy button names the command. */}
      <CodeBlockPanel
        single
        html={selected?.html}
        copy={{ value: selected?.text ?? "", label: `Copy ${selected?.text}` }}
        $prompt
      />
    </CodeBlock>
  );
}
