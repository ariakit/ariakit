"use client";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { Tab, TabList, TabPanel, useTabStore } from "@ariakit/react";
import type * as monaco from "monaco-editor";
import { tw } from "utils/tw.js";
import { useMedia } from "utils/use-media.js";

export interface EditorProps {
  files: Record<string, string>;
  codeBlocks: Record<string, ReactNode>;
  theme?: monaco.editor.IStandaloneThemeData;
  javascript?: Record<string, { code: string; codeBlock: ReactNode }>;
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

export function Editor({ files, theme, codeBlocks }: EditorProps) {
  const isLarge = useMedia("(min-width: 640px)", true);
  const domRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<typeof monaco>();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const [editorReady, setEditorReady] = useState(false);
  const [editting, setEditting] = useState(false);
  const id = useId();
  const getId = (file: string) => `${id}:${file}`;
  const tab = useTabStore({
    defaultSelectedId: getId(Object.keys(files)[0]!),
    setSelectedId: (selectedId) => {
      if (!selectedId) return;
      if (!editorRef.current) return;
      if (!monacoRef.current) return;
      const file = selectedId.replace(`${id}:`, "");
      const monaco = monacoRef.current;
      const model = monaco.editor.getModel(monaco.Uri.file(file));
      console.log(model);
      if (!model) return;
      editorRef.current.setModel(model);
    },
  });

  useEffect(() => {
    if (!editting) return;
    const controller = new AbortController();
    const { signal } = controller;

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

      monacoRef.current = monaco;
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

      if (theme) {
        monaco.editor.defineTheme("dark-plus", theme);
      }

      const diagnosticsOptions = {
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true,
      } satisfies monaco.languages.typescript.DiagnosticsOptions;

      monaco.languages.typescript?.javascriptDefaults.setDiagnosticsOptions(
        diagnosticsOptions,
      );
      monaco.languages.typescript?.typescriptDefaults.setDiagnosticsOptions(
        diagnosticsOptions,
      );

      const grammars = new Map<string, string>();

      monaco.editor.getModels().forEach((model) => model.dispose());

      Object.entries(files).map(([file, content]) => {
        const language = languages.find((lang) => lang.pattern.test(file));
        invariant(language, `Language not found for file: ${file}`);
        grammars.set(language.name, language.scopeName);
        return monaco.editor.createModel(
          content,
          language.name,
          monaco.Uri.file(file),
        );
      });

      const model = monaco.editor.getModel(
        monaco.Uri.file(tab.getState().selectedId!.replace(`${id}:`, "")),
      );

      console.log(grammars);

      const editor = monaco.editor.create(domRef.current, {
        // @ts-expect-error
        "bracketPairColorization.enabled": false,
        model,
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

      editor.onDidChangeModelContent(() => {
        console.log(editor.getValue());
      });

      await wireTmGrammars(monaco, registry, grammars, editor);

      editorRef.current = editor;

      setEditorReady(true);
    };

    initMonaco();

    return () => {
      setEditorReady(false);
      controller.abort();
      editorRef.current?.dispose();
      editorRef.current = undefined;
      monacoRef.current = undefined;
    };
  }, [editting, files, theme, isLarge]);

  return (
    <div
      className={tw`w-full max-w-[832px] overflow-hidden rounded-lg
    border-gray-650 dark:border md:rounded-xl`}
    >
      <div
        className={tw`relative z-[12] flex h-12 gap-2 rounded-t-[inherit]
      bg-gray-600 shadow-dark dark:bg-gray-750`}
      >
        <TabList store={tab}>
          {Object.entries(files).map(([file]) => (
            <Tab key={file} id={getId(file)}>
              {file}
            </Tab>
          ))}
        </TabList>
        <button onClick={() => setEditting((e) => !e)}>
          {editting && !editorReady ? "Loading" : editting ? "Reset" : "Edit"}
        </button>
      </div>
      {!editorReady &&
        Object.entries(files).map(([file]) => (
          <TabPanel
            key={file}
            store={tab}
            tabId={getId(file)}
            render={(props) => (
              <div {...props}>{!props.hidden && codeBlocks[file]}</div>
            )}
          />
        ))}
      <div ref={domRef} className={editorReady ? "h-72" : "hidden"} />
    </div>
  );
}
