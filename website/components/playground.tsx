// import type { IVSCodeTheme } from "monaco-vscode-textmate-theme-converter";
// import { convertTheme } from "monaco-vscode-textmate-theme-converter";
// import darkPlus from "shiki/themes/dark-plus.json";
import { defer } from "utils/defer.ts";
import { tsToJsFilename } from "utils/ts-to-js-filename.ts";
import { tsToJs } from "utils/ts-to-js.ts";
import { CodeBlock } from "./code-block.tsx";
import { PlaygroundClient } from "./playground-client.tsx";
import type { PlaygroundClientProps } from "./playground-client.tsx";

export interface PlaygroundProps
  extends Omit<PlaygroundClientProps, "theme" | "codeBlocks" | "javascript"> {
  onRender?: (hrefs: Iterable<string>) => void;
}

// const theme = convertTheme({ type: "dark", ...darkPlus } as IVSCodeTheme);

export async function Playground({ onRender, ...props }: PlaygroundProps) {
  const codeBlocks: Record<string, any> = {};
  const javascript: Record<string, { code: string; codeBlock: any }> = {};
  const entries = Object.entries(props.files);

  const hovercards = new Set<Promise<Iterable<string>>>();

  for (const [filename, code] of entries) {
    if (/\.tsx?$/.test(filename)) {
      const deferred = defer<Iterable<string>>();
      hovercards.add(deferred);

      const jsFilename = tsToJsFilename(filename);
      const jsCode = await tsToJs(code);
      javascript[filename] = {
        code: jsCode,
        codeBlock: (
          <CodeBlock
            type="editor"
            filename={jsFilename}
            code={jsCode}
            onRender={deferred.resolve}
          />
        ),
      };
    }
    const deferred = defer<Iterable<string>>();
    hovercards.add(deferred);

    codeBlocks[filename] = (
      <CodeBlock
        type="editor"
        filename={filename}
        code={code}
        onRender={deferred.resolve}
      />
    );
  }

  Promise.all(hovercards).then((hrefMatrix) => {
    const hrefsSet = new Set<string>();
    for (const hrefs of hrefMatrix) {
      for (const href of hrefs) {
        hrefsSet.add(href);
      }
    }
    onRender?.(hrefsSet);
  });

  return (
    <PlaygroundClient
      {...props}
      // theme={theme}
      codeBlocks={codeBlocks}
      javascript={javascript}
    />
  );
}
