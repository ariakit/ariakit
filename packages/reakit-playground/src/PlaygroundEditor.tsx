import * as React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { unstable_useOptions } from "reakit/system/useOptions";
import { unstable_useProps } from "reakit/system/useProps";
import { PlaygroundActions, PlaygroundStateReturn } from "./usePlaygroundState";
import { useLiveRef } from "./__utils/useLiveRef";

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
}

export type PlaygroundEditorOptions = PlaygroundStateReturn &
  PlaygroundActions & {
    /** TODO: Description */
    mode?: string | { name: string; [key: string]: any };
    /** TODO: Description */
    theme?: string;
    /** TODO: Description */
    readOnly?: boolean | "nocursor";
    /** TODO: Description */
    tabSize?: number;
    /** TODO: Description */
    lineWrapping?: boolean;
    /** TODO: Description */
    maxHeight?: string;
  };

export type PlaygroundEditorProps = { className?: string };

export function PlaygroundEditor({
  code,
  update,
  readOnly,
  lineWrapping,
  theme = "reakit",
  tabSize = 2,
  mode = "jsx",
  maxHeight = "300px",
  ...htmlProps
}: PlaygroundEditorOptions & PlaygroundEditorProps) {
  const options = unstable_useOptions(
    "PlaygroundEditor",
    {
      code,
      update,
      readOnly,
      lineWrapping,
      theme,
      tabSize,
      mode,
      maxHeight
    },
    htmlProps
  );

  const [enabled, setEnabled] = React.useState(false);
  const enabledRef = useLiveRef(enabled);
  const _readOnly =
    typeof options.readOnly !== "undefined" ? options.readOnly : !enabled;

  htmlProps = unstable_useProps(
    "PlaygroundEditor",
    { ...options, readOnly: _readOnly },
    htmlProps
  );

  const className = [htmlProps.className, !enabled && "disabled"]
    .filter(Boolean)
    .join(" ");

  return (
    <CodeMirror
      className={className}
      value={options.readOnly ? options.code.trim() : options.code}
      onBeforeChange={(_, __, value) => options.update(value)}
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
        readOnly: _readOnly || options.readOnly,
        lineWrapping: options.lineWrapping,
        tabSize: options.tabSize,
        mode: options.mode,
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
