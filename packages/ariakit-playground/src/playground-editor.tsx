import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isFocusEventOutside, isSelfTarget } from "@ariakit/core/utils/events";
import { invariant } from "@ariakit/core/utils/misc";
import type { CommandOptions } from "@ariakit/react-core/command/command";
import { useCommand } from "@ariakit/react-core/command/command";
import type { RoleProps } from "@ariakit/react-core/role/role";
import { Role } from "@ariakit/react-core/role/role";
import {
  useControlledState,
  useEvent,
  useForkRef,
  useId,
  useInitialValue,
  useSafeLayoutEffect,
  useWrapElement,
} from "@ariakit/react-core/utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "@ariakit/react-core/utils/system";
import type { As, Props } from "@ariakit/react-core/utils/types";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import {
  HighlightStyle,
  bracketMatching,
  syntaxHighlighting,
} from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import type { Extension } from "@codemirror/state";
import { EditorState, StateEffect } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  scrollPastEnd,
} from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { getExtension } from "./__utils/get-extension.js";
import { getValue } from "./__utils/get-value.js";
import { PlaygroundContext } from "./__utils/playground-context.js";
import type { PlaygroundCodeOptions } from "./playground-code.js";
import { usePlaygroundCode } from "./playground-code.js";
import type { PlaygroundStore } from "./playground-store.js";

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
  element.setAttribute("data-gramm", "false");
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
  syntaxHighlighting(prismjsClassNames),
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
    ...closeBracketsKeymap,
    ...searchKeymap,
    indentWithTab,
  ]),
];

export const usePlaygroundEditor = createHook<PlaygroundEditorOptions>(
  ({
    store,
    file,
    lineNumbers: showLineNumbers = true,
    keyboardDescription = "Press Enter to edit the code",
    keyboardDescriptionProps,
    maxHeight,
    defaultExpanded,
    expanded: expandedProp,
    setExpanded: setExpandedProp,
    ...props
  }) => {
    const context = useContext(PlaygroundContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "PlaygroundEditor must be wrapped in a Playground component"
    );

    const ref = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorView | null>(null);
    const value = store.useState((state) => getValue(state, file));
    const initialValue = useInitialValue(value);
    const [editorDOM, setEditorDOM] = useState<HTMLElement | null>(null);
    const [editable, setEditable] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);

    const [expanded, setExpanded] = useControlledState(
      defaultExpanded ?? !maxHeight,
      expandedProp,
      setExpandedProp
    );

    const extensions = useMemo(() => {
      const editorStyle = EditorView.theme({
        "&": { maxHeight: "inherit" },
        ".cm-scroller": { overflow: expanded ? "auto" : "hidden" },
      });
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const doc = update.state.doc;
          store?.setValue(file, doc.toString());
        }
      });
      return [
        ...defaultExtensions,
        editorStyle,
        updateListener,
        getLanguage(file),
        showLineNumbers && lineNumbers(),
        expanded && scrollPastEnd(),
      ].filter(Boolean) as Extension[];
    }, [expanded, store?.setValue, file, showLineNumbers]);

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

    const onClickProp = useEvent(props.onClick);

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

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.key !== "Escape") return;
      setEditable(false);
      ref.current?.focus();
    });

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      setFocusVisible(false);
      if (isFocusEventOutside(event)) {
        setEditable(false);
      }
    });

    const onFocusVisibleProp = props.onFocusVisible;

    const onFocusVisible = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusVisibleProp?.(event);
      if (event.defaultPrevented) return;
      setFocusVisible(true);
    });

    const keyboardDescriptionId = useId(keyboardDescriptionProps?.id);

    props = {
      role: "group",
      "aria-label": file,
      "aria-describedby": keyboardDescriptionId,
      ...props,
      ref: useForkRef(ref, props.ref),
      onClick,
      onKeyDown,
      onBlur,
      onFocusVisible,
      children: editorDOM ? null : undefined,
    };

    // as="div" is necessary to avoid styling issues on iOS
    props = useCommand({ as: "div", ...props });

    props = usePlaygroundCode({
      store,
      file,
      lineNumbers: showLineNumbers,
      ...props,
      maxHeight,
      expanded,
      setExpanded,
      highlight: !editorDOM && props.highlight,
    });

    props = useWrapElement(
      props,
      (element) => (
        <>
          {element}
          {focusVisible && !editable && (
            <Role
              children={keyboardDescription}
              {...keyboardDescriptionProps}
              id={keyboardDescriptionId}
            />
          )}
        </>
      ),
      [
        focusVisible,
        editable,
        keyboardDescription,
        keyboardDescriptionProps,
        keyboardDescriptionId,
      ]
    );

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
      store?: PlaygroundStore;
      file: string;
      lineNumbers?: boolean;
      keyboardDescription?: string;
      keyboardDescriptionProps?: RoleProps;
    };

export type PlaygroundEditorProps<T extends As = "div"> = Props<
  PlaygroundEditorOptions<T>
>;
