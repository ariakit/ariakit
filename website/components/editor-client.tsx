"use client";
import { useEffect, useRef, useState } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { editor } from "monaco-editor";
import { useMedia } from "website/utils/use-media.js";

interface Props {
  files: Record<string, string>;
  theme: any;
  codeBlocks: Record<string, JSX.Element>;
  types: Array<{ name: string; content: string }>;
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

export function EditorClient({ files, theme, types, codeBlocks }: Props) {
  const isLarge = useMedia("(min-width: 640px)", true);
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const initMonaco = async () => {
      const [monaco, { wireTmGrammars }, { Registry }, { loadWASM }, onigasm] =
        await Promise.all([
          import("monaco-editor"),
          import("monaco-editor-textmate"),
          import("monaco-textmate"),
          import("onigasm"),
          // @ts-expect-error
          import("onigasm/lib/onigasm.wasm"),
        ]);

      if (signal?.aborted) return;

      // Prevent Fast Refresh errors
      await loadWASM(onigasm.default).catch(() => {});

      if (signal?.aborted) return;

      const registry = new Registry({
        getGrammarDefinition: async (scopeName) => {
          const language = languages.find(
            (lang) => lang.scopeName === scopeName
          );
          invariant(language, `Language not found for scope: ${scopeName}`);
          const { default: content } = await language.get();
          return { format: "json", content };
        },
      });

      const grammars = new Map<string, string>();

      const element = ref.current;
      invariant(element);

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      });

      types.forEach(({ name, content }) => {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          `file:///node_modules/@types/${name.replace(
            /^@([^\/]+)\//,
            "$1__"
          )}/index.d.ts`
        );
      });

      monaco.editor.defineTheme("dark-plus", theme);

      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        noSuggestionDiagnostics: true,
      });

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        // noSemanticValidation: true,
        // noSyntaxValidation: true,
        // noSuggestionDiagnostics: true,
      });

      let model: editor.ITextModel | undefined;

      monaco.editor.getModels().forEach((model) => model.dispose());

      Object.entries(files).forEach(([name, content]) => {
        const language = languages.find((lang) => lang.pattern.test(name));
        invariant(language, `Language not found for file: ${name}`);
        grammars.set(language.name, language.scopeName);
        const _model = monaco.editor.createModel(
          content,
          language.name,
          monaco.Uri.file(name.replace(/^.*\/([^\/]+)$/, "$1"))
        );
        if (!model) {
          model = _model;
        }
      });

      const editor = monaco.editor.create(ref.current, {
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
        scrollbar: {
          useShadows: false,
        },
        padding: {
          top: 16,
        },
        renderLineHighlightOnlyWhenFocus: true,
        formatOnPaste: true,
        minimap: {
          enabled: false,
        },
      });

      editorRef.current = editor;
      await wireTmGrammars(monaco, registry, grammars, editor);

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () =>
        editor.getAction("editor.action.formatDocument")?.run()
      );

      setTimeout(() => {
        setDone(true);
      }, 500);
    };

    initMonaco();

    return () => {
      setDone(false);
      controller.abort();
      editorRef.current?.dispose();
    };
  }, [files, theme, types, isLarge]);

  const [key] = Object.keys(codeBlocks);

  return (
    <>
      {key && !done && codeBlocks[key]}
      <div ref={ref} className={done ? "h-72" : "hidden"} />
    </>
  );
}
