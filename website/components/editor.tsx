import type { IVSCodeTheme } from "monaco-vscode-textmate-theme-converter";
import { convertTheme } from "monaco-vscode-textmate-theme-converter";
import darkPlus from "shiki/themes/dark-plus.json";
import { dts } from "website/utils/dts.js";
import { CodeBlock } from "./code-block.js";
import { EditorClient } from "./editor-client.js";

interface Props {
  files: Record<string, string>;
  dependencies: Record<string, string>;
}

const theme = convertTheme({ type: "dark", ...darkPlus } as IVSCodeTheme);

export async function Editor({ files, dependencies }: Props) {
  const codeBlocks: Record<string, any> = {};

  const firstFilename = Object.keys(files)[0]!;

  // const types = await Promise.all(
  //   Object.keys({ ...dependencies, ["react/jsx-runtime"]: "" }).map(
  //     async (name) => ({
  //       name,
  //       content: await dts(name, firstFilename),
  //     })
  //   )
  // );

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

  return (
    <EditorClient
      files={files}
      theme={theme}
      codeBlocks={codeBlocks}
      types={[]}
    />
  );
}
