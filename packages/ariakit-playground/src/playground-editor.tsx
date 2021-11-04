import {
  ComponentPropsWithRef,
  ElementType,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { commentKeymap } from "@codemirror/comment";
import { highlightActiveLineGutter, lineNumbers } from "@codemirror/gutter";
import { HighlightStyle, tags as t } from "@codemirror/highlight";
import { history, historyKeymap } from "@codemirror/history";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { bracketMatching } from "@codemirror/matchbrackets";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { EditorState, Extension, StateEffect } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  keymap,
} from "@codemirror/view";
import { isFocusEventOutside, isSelfTarget } from "ariakit-utils/events";
import {
  useEventCallback,
  useForkRef,
  useInitialValue,
  useSafeLayoutEffect,
  useWrapElement,
} from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { CommandOptions, useCommand } from "ariakit/command";
import { PlaygroundContext, getExtension, getValue } from "./__utils";
import { PlaygroundCodeOptions, usePlaygroundCode } from "./playground-code";
import { PlaygroundState } from "./playground-state";

function getLanguage(file: string) {
  const extension = getExtension(file);
  switch (extension) {
    case "js":
    case "jsx":
      return javascript({ jsx: true });
    case "ts":
    case "tsx":
      return javascript({ jsx: true, typescript: true });
    case "css":
      return css();
  }
  return null;
}

function appendEditorProps(editor: EditorView, file: string) {
  const element = editor.dom.querySelector<HTMLElement>("[contenteditable]");
  if (!element) return;
  element.tabIndex = -1;
  element.setAttribute("aria-label", file);
}

const prismjsClassNames = HighlightStyle.define([
  { tag: [t.keyword, t.null], class: "token keyword" },
  { tag: [t.name], class: "token name" },
  { tag: [t.propertyName], class: "token property-name" },
  { tag: [t.typeName, t.className, t.tagName], class: "token class-name" },
  { tag: [t.operator], class: "token operator" },
  { tag: [t.punctuation], class: "token punctuation" },
  { tag: [t.squareBracket], class: "token punctuation square-bracket" },
  { tag: [t.string], class: "token string" },
  { tag: [t.angleBracket], class: "token angle-bracket" },
  { tag: [t.regexp], class: "token regex" },
  { tag: [t.comment], class: "token comment" },
  { tag: [t.number], class: "token number" },
  { tag: [t.bool], class: "token boolean" },
  { tag: [t.atom], class: "token name" },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    class: "token function",
  },
]);

const defaultExtensions = [
  prismjsClassNames,
  highlightActiveLineGutter(),
  highlightActiveLine(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  bracketMatching(),
  closeBrackets(),
  history(),
  highlightSelectionMatches(),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
    ...commentKeymap,
    ...closeBracketsKeymap,
    ...searchKeymap,
    indentWithTab,
  ]),
];

export const usePlaygroundEditor = createHook<PlaygroundEditorOptions>(
  ({
    state,
    file,
    lineNumbers: showLineNumbers = true,
    enableButton,
    enableButtonProps,
    ...props
  }) => {
    state = useStore(state || PlaygroundContext, [
      useCallback((s: PlaygroundState) => getValue(s, file), [file]),
      "setValue",
    ]);
    const ref = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorView | null>(null);
    const value = getValue(state, file);
    const initialValue = useInitialValue(value);
    const [editorDOM, setEditorDOM] = useState<HTMLElement | null>(null);
    const [editable, setEditable] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);

    const extensions = useMemo(() => {
      const editorStyle = EditorView.theme({
        "&": { maxHeight: "inherit" },
        ".cm-scroller": { overflow: editable ? "auto" : "hidden" },
      });
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const doc = update.state.doc;
          state?.setValue(file, doc.toString());
        }
      });
      return [
        ...defaultExtensions,
        editorStyle,
        updateListener,
        getLanguage(file),
        showLineNumbers && lineNumbers(),
      ].filter(Boolean) as Extension[];
    }, [editable, state?.setValue, file, showLineNumbers]);

    const initialExtensions = useInitialValue(extensions);

    useEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.dispatch({
        effects: StateEffect.reconfigure.of(extensions),
      });
    }, [extensions]);

    useEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const editorValue = editor.state.doc.toString();
      if (value !== editorValue) {
        editor.dispatch({
          changes: { from: 0, to: editorValue.length, insert: value },
        });
      }
    }, [value]);

    useSafeLayoutEffect(() => {
      const parent = ref.current;
      if (!parent) return;
      const editorState = EditorState.create({
        doc: initialValue,
        extensions: initialExtensions,
      });
      const editor = new EditorView({ state: editorState });
      editorRef.current = editor;
      appendEditorProps(editor, file);
      parent.appendChild(editor.dom);
      setEditorDOM(editor.dom);
      return () => {
        editor.destroy();
        setEditorDOM(null);
      };
    }, [initialValue, initialExtensions, file]);

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        setEditable(true);
        if (!isSelfTarget(event)) return;
        editorRef.current?.focus();
      },
      [onClickProp]
    );

    const onKeyDownProp = useEventCallback(props.onKeyDown);

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;
        if (event.key !== "Escape") return;
        setEditable(false);
        ref.current?.focus();
      },
      [onKeyDownProp]
    );

    const onBlurProp = useEventCallback(props.onBlur);

    const onBlur = useCallback(
      (event: FocusEvent<HTMLDivElement>) => {
        onBlurProp(event);
        if (event.defaultPrevented) return;
        setFocusVisible(false);
        if (isFocusEventOutside(event)) {
          setEditable(false);
        }
      },
      [onBlurProp]
    );

    const onFocusVisibleProp = useEventCallback(props.onFocusVisible);

    const onFocusVisible = useCallback(
      (event: FocusEvent<HTMLDivElement>) => {
        onFocusVisibleProp(event);
        if (event.defaultPrevented) return;
        setFocusVisible(true);
      },
      [onFocusVisibleProp, editable]
    );

    const EnableButton =
      typeof enableButton !== "boolean"
        ? enableButton || "div"
        : enableButton
        ? "div"
        : null;

    props = useWrapElement(
      props,
      (element) => (
        <>
          {element}
          {console.log({ focusVisible, editable })}
          {focusVisible && !editable && EnableButton && (
            <EnableButton
              children="Press Enter to edit the code"
              {...enableButtonProps}
            />
          )}
        </>
      ),
      [focusVisible, editable, EnableButton, enableButtonProps]
    );

    props = {
      ...props,
      ref: useForkRef(ref, props.ref),
      onClick,
      onKeyDown,
      onBlur,
      onFocusVisible,
      children: editorDOM ? null : undefined,
      style: {
        ...props.style,
      },
    };

    props = useCommand(props);

    props = usePlaygroundCode({
      state,
      file,
      lineNumbers: showLineNumbers,
      ...props,
      highlight: !editorDOM && props.highlight,
    });

    return props;
  }
);

export const PlaygroundEditor = createComponent<PlaygroundEditorOptions>(
  (props) => {
    const htmlProps = usePlaygroundEditor(props);
    return createElement("div", htmlProps);
  }
);

export type PlaygroundEditorOptions<T extends As = "div"> =
  PlaygroundCodeOptions<T> &
    CommandOptions<T> & {
      state?: PlaygroundState;
      file: string;
      lineNumbers?: boolean;
      enableButton?: boolean | ElementType<ComponentPropsWithRef<"div">>;
      enableButtonProps: ComponentPropsWithRef<"div">;
    };

export type PlaygroundEditorProps<T extends As = "div"> = Props<
  PlaygroundEditorOptions<T>
>;
