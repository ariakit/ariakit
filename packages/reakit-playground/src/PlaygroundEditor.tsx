import * as React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { useOptions, useProps } from "reakit-system";
import { useLiveRef } from "reakit-utils";
import { PlaygroundActions, PlaygroundStateReturn } from "./usePlaygroundState";

if (typeof navigator !== "undefined") {
  require("codemirror/mode/javascript/javascript");
  require("codemirror/mode/jsx/jsx");
  require("codemirror/mode/htmlmixed/htmlmixed");
  require("codemirror/addon/edit/closebrackets");
  require("codemirror/addon/edit/matchbrackets");
  require("codemirror/addon/edit/matchtags");
  require("codemirror/addon/edit/closetag");
  require("codemirror/addon/fold/xml-fold");
  require("codemirror/addon/scroll/simplescrollbars");
  require("codemirror/addon/selection/active-line");
  require("codemirror/addon/display/autorefresh");
}

export type PlaygroundEditorOptions = PlaygroundStateReturn &
  PlaygroundActions & {
    /** TODO: Description */
    mode?: string | { name: string; [key: string]: any };
    /** TODO: Description */
    theme?: string;
    /** TODO: Description */
    readOnly?: boolean;
    /** TODO: Description */
    tabSize?: number;
    /** TODO: Description */
    lineWrapping?: boolean;
    /** TODO: Description */
    autoRefresh?: boolean;
    /** TODO: Description */
    maxHeight?: string;
  };

export type PlaygroundEditorHTMLProps = React.HTMLAttributes<any>;

export type PlaygroundEditorProps = PlaygroundEditorOptions &
  PlaygroundEditorHTMLProps;

export function PlaygroundEditor({
  code,
  update,
  readOnly,
  lineWrapping,
  theme = "reakit",
  tabSize = 2,
  mode = "jsx",
  autoRefresh,
  maxHeight,
  ...htmlProps
}: PlaygroundEditorOptions & PlaygroundEditorHTMLProps) {
  const options = useOptions(
    "PlaygroundEditor",
    {
      code,
      update,
      readOnly,
      lineWrapping,
      theme,
      tabSize,
      mode,
      autoRefresh,
      maxHeight
    },
    htmlProps
  );

  const [enabled, setEnabled] = React.useState(false);
  const enabledRef = useLiveRef(enabled);
  const _readOnly =
    typeof options.readOnly !== "undefined" ? options.readOnly : !enabled;
  const [ready, setReady] = React.useState(false);

  htmlProps = useProps(
    "PlaygroundEditor",
    { ...options, readOnly: _readOnly },
    htmlProps
  );

  const className = [
    htmlProps.className,
    !enabled && !options.readOnly && "disabled"
  ]
    .filter(Boolean)
    .join(" ");

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const value = options.readOnly ? options.code.trim() : options.code;

  if (typeof window === "undefined" || !ready) {
    return (
      <pre className={className}>{options.readOnly ? value : `${value}\n`}</pre>
    );
  }

  return (
    <CodeMirror
      {...(htmlProps as any)}
      className={className}
      value={value}
      onBeforeChange={(_, __, val) => options.update(val)}
      onMouseDown={() => setEnabled(true)}
      onTouchStart={() => setEnabled(true)}
      onKeyDown={(_, event: KeyboardEvent) => {
        if (
          !enabledRef.current &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          setEnabled(true);
        } else if (event.key === "Escape") {
          event.preventDefault();
          setEnabled(false);
        }
      }}
      onBlur={() => setEnabled(false)}
      onFocus={() => {}}
      options={{
        scrollbarStyle: "overlay",
        theme: options.theme,
        readOnly: _readOnly,
        lineWrapping: options.lineWrapping,
        tabSize: options.tabSize,
        mode: options.mode,
        autoRefresh: options.autoRefresh,
        cursorBlinkRate: _readOnly ? -1 : 530,
        styleActiveLine: !_readOnly,
        smartIndent: !_readOnly,
        matchBrackets: !_readOnly,
        autoCloseBrackets: !_readOnly,
        autoCloseTags: !_readOnly,
        matchTags: !_readOnly,
        extraKeys: enabled
          ? {}
          : {
              Tab: false,
              "Shift-Tab": false
            }
      }}
    />
  );
}
