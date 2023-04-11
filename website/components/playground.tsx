import type { IVSCodeTheme } from "monaco-vscode-textmate-theme-converter";
import { convertTheme } from "monaco-vscode-textmate-theme-converter";
import darkPlus from "shiki/themes/dark-plus.json";
import { tsToJsFilename } from "utils/ts-to-js-filename.js";
import { tsToJs } from "utils/ts-to-js.js";
import { CodeBlock } from "./code-block.js";
import type { PlaygroundClientProps } from "./playground-client.js";
import { PlaygroundClient } from "./playground-client.js";

export type PlaygroundProps = Omit<
  PlaygroundClientProps,
  "theme" | "codeBlocks" | "javascript"
>;

const theme = convertTheme({ type: "dark", ...darkPlus } as IVSCodeTheme);

export function Playground(props: PlaygroundProps) {
  const codeBlocks: Record<string, any> = {};
  const javascript: Record<string, { code: string; codeBlock: any }> = {};

  Object.entries(props.files).forEach(([filename, code]) => {
    if (/\.tsx?$/.test(filename)) {
      const jsFilename = tsToJsFilename(filename);
      const jsCode = tsToJs(code);
      javascript[filename] = {
        code: jsCode,
        codeBlock: (
          // @ts-expect-error RSC
          <CodeBlock type="editor" filename={jsFilename} code={jsCode} />
        ),
      };
    }
    codeBlocks[filename] = (
      // @ts-expect-error RSC
      <CodeBlock type="editor" filename={filename} code={code} />
    );
  });

  return (
    <PlaygroundClient
      {...props}
      theme={theme}
      codeBlocks={codeBlocks}
      javascript={javascript}
    />
  );
}
