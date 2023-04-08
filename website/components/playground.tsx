import type { IVSCodeTheme } from "monaco-vscode-textmate-theme-converter";
import { convertTheme } from "monaco-vscode-textmate-theme-converter";
import darkPlus from "shiki/themes/dark-plus.json";
import { CodeBlock } from "./code-block.js";
import type { PlaygroundClientProps } from "./playground-client.js";
import { PlaygroundClient } from "./playground-client.js";

export type PlaygroundProps = Omit<
  PlaygroundClientProps,
  "theme" | "codeBlocks"
>;

const theme = convertTheme({ type: "dark", ...darkPlus } as IVSCodeTheme);

export function Playground(props: PlaygroundProps) {
  const codeBlocks: Record<string, any> = {};

  Object.entries(props.files).forEach(([filename, code]) => {
    codeBlocks[filename] = (
      // @ts-expect-error RSC
      <CodeBlock
        type="editor"
        filename={filename}
        code={code}
        className="max-h-72 rounded-b-[inherit]"
      />
    );
  });

  return <PlaygroundClient {...props} theme={theme} codeBlocks={codeBlocks} />;
}
