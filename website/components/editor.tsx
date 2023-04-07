import type { IVSCodeTheme } from "monaco-vscode-textmate-theme-converter";
import { convertTheme } from "monaco-vscode-textmate-theme-converter";
import darkPlus from "shiki/themes/dark-plus.json";
import { CodeBlock } from "./code-block.js";
import { EditorClient } from "./editor-client.js";

interface Props {
  files: Record<string, string>;
  dependencies: Record<string, string>;
}

const theme = convertTheme({ type: "dark", ...darkPlus } as IVSCodeTheme);

export async function Editor({ files }: Props) {
  const codeBlocks: Record<string, any> = {};

  Object.entries(files).forEach(([filename, code]) => {
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

  return <EditorClient files={files} theme={theme} codeBlocks={codeBlocks} />;
}
