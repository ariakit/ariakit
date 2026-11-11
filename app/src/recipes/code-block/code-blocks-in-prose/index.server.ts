import { highlight } from "@ariakit/ui/utils/highlight.server";
import { getFileIcon } from "../file-icons.ts";

const commands = {
  prerequisites: {
    npm: "npm install react react-dom",
    pnpm: "pnpm add react react-dom",
    yarn: "yarn add react react-dom",
    bun: "bun add react react-dom",
  },
  library: {
    npm: "npm install @ariakit/react",
    pnpm: "pnpm add @ariakit/react",
    yarn: "yarn add @ariakit/react",
    bun: "bun add @ariakit/react",
  },
};

const usage = `import * as Ariakit from "@ariakit/react";

export function Details() {
  return (
    <Ariakit.DisclosureProvider>
      <Ariakit.Disclosure>Show details</Ariakit.Disclosure>
      <Ariakit.DisclosureContent>
        The order ships in two to three days.
      </Ariakit.DisclosureContent>
    </Ariakit.DisclosureProvider>
  );
}`;

const styles = `.disclosure-content[data-enter] {
  animation: fade-in 150ms ease-out;
}`;

function highlightCommands(record: Record<string, string>) {
  return Object.entries(record).map(([packageManager, command]) => ({
    packageManager,
    icon: getFileIcon(packageManager),
    ...highlight(command, "bash"),
  }));
}

function highlightFile(name: string, code: string, lines?: number[]) {
  const lang = name.endsWith(".css") ? "css" : "tsx";
  return { name, icon: getFileIcon(name), ...highlight(code, lang, { lines }) };
}

export function load() {
  return {
    prerequisites: highlightCommands(commands.prerequisites),
    library: highlightCommands(commands.library),
    usage: highlightFile("details.tsx", usage, [6]),
    styles: highlightFile("disclosure.css", styles),
  };
}
