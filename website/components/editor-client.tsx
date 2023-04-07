"use client";
import { useEffect, useId, useRef, useState } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { Tab, TabList, TabPanel, useTabStore } from "@ariakit/react";
import type monaco from "monaco-editor";
import { tw } from "website/utils/tw.js";
import { useMedia } from "website/utils/use-media.js";

interface Props {
  files: Record<string, string>;
  theme: monaco.editor.IStandaloneThemeData;
  codeBlocks: Record<string, JSX.Element>;
}

const languages = [
  {
    name: "typescript",
    pattern: /\.tsx?$/,
    scopeName: "source.tsx",
    get: () => import("shiki/languages/tsx.tmLanguage.json"),
  },
  {
    name: "javascript",
    pattern: /\.jsx?$/,
    scopeName: "source.js",
    get: () => import("shiki/languages/jsx.tmLanguage.json"),
  },
  {
    name: "css",
    pattern: /\.css$/,
    scopeName: "source.css",
    get: () => import("shiki/languages/css.tmLanguage.json"),
  },
  {
    name: "json",
    pattern: /\.json$/,
    scopeName: "source.json",
    get: () => import("shiki/languages/json.tmLanguage.json"),
  },
  {
    name: "html",
    pattern: /\.html?$/,
    scopeName: "text.html.basic",
    get: () => import("shiki/languages/html.tmLanguage.json"),
  },
];

export function EditorClient({ files, theme, codeBlocks }: Props) {
  const isLarge = useMedia("(min-width: 640px)", true);
  const domRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const [editorReady, setEditorReady] = useState(false);
  const id = useId();
  const getId = (file: string) => `${id}:${file}`;
  const tab = useTabStore({ defaultSelectedId: getId(Object.keys(files)[0]!) });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // @ts-ignore
    const initMonaco = async () => {
      const [monaco, { wireTmGrammars }, { Registry }, { loadWASM }, onigasm] =
        await Promise.all([
          import("monaco-editor/esm/vs/editor/editor.api.js"),
          import("monaco-editor-textmate"),
          import("monaco-textmate"),
          import("onigasm"),
          // @ts-expect-error
          import("onigasm/lib/onigasm.wasm"),
        ]);

      if (signal?.aborted) return;

      // Catch to prevent Fast Refresh errors because loadWasm can only be
      // called once
      await loadWASM(onigasm.default).catch(() => {});

      if (signal?.aborted) return;

      const element = domRef.current;
      invariant(element, "Element not found");

      const registry = new Registry({
        getGrammarDefinition: async (scopeName) => {
          const language = languages.find((l) => l.scopeName === scopeName);
          invariant(language, `Language not found for scope: ${scopeName}`);
          const { default: content } = await language.get();
          return { format: "json", content };
        },
      });

      monaco.editor.defineTheme("dark-plus", theme);

      const diagnosticsOptions = {
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true,
      } satisfies monaco.languages.typescript.DiagnosticsOptions;

      monaco.languages.typescript?.javascriptDefaults.setDiagnosticsOptions(
        diagnosticsOptions
      );
      monaco.languages.typescript?.typescriptDefaults.setDiagnosticsOptions(
        diagnosticsOptions
      );

      const grammars = new Map<string, string>();

      monaco.editor.getModels().forEach((model) => model.dispose());

      const models = Object.entries(files).map(([file, content]) => {
        const language = languages.find((lang) => lang.pattern.test(file));
        invariant(language, `Language not found for file: ${file}`);
        grammars.set(language.name, language.scopeName);
        return monaco.editor.createModel(
          content,
          language.name,
          monaco.Uri.file(file)
        );
      });

      const editor = monaco.editor.create(domRef.current, {
        // @ts-expect-error
        "bracketPairColorization.enabled": false,
        model: models[0],
        fontSize: 14,
        lineHeight: 21,
        fontFamily: "Menlo, Consolas, Courier New, monospace",
        theme: "dark-plus",
        lineNumbers: isLarge ? "on" : "off",
        fixedOverflowWidgets: true,
        automaticLayout: true,
        scrollbar: { useShadows: false },
        padding: { top: 16 },
        renderLineHighlightOnlyWhenFocus: true,
        formatOnPaste: true,
        minimap: { enabled: false },
      });

      monaco.editor.addKeybindingRule({
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        command: "editor.action.formatDocument",
      });

      await wireTmGrammars(monaco, registry, grammars, editor);

      editorRef.current = editor;

      setTimeout(() => setEditorReady(true), 750);
    };

    // initMonaco();

    return () => {
      setEditorReady(false);
      controller.abort();
      editorRef.current?.dispose();
    };
  }, [files, theme, isLarge]);

  return (
    <div
      className={tw`w-full max-w-[832px] overflow-hidden rounded-lg
    border-gray-650 dark:border md:rounded-xl`}
    >
      <div
        className={tw`relative z-[12] h-12 rounded-t-[inherit]
      bg-gray-600 shadow-dark dark:bg-gray-750`}
      >
        <TabList store={tab}>
          {Object.entries(files).map(([file]) => (
            <Tab key={file} id={getId(file)}>
              {file}
            </Tab>
          ))}
        </TabList>
      </div>
      {Object.entries(files).map(([file]) => (
        <TabPanel key={file} store={tab} tabId={getId(file)}>
          {(props) => <div {...props}>{!props.hidden && codeBlocks[file]}</div>}
        </TabPanel>
      ))}
      <div ref={domRef} className={editorReady ? "h-72" : "hidden"} />
    </div>
  );
}
