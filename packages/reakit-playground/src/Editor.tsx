import * as React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { EditorState, EditorActions } from "./useEditorState";

export type EditorProps = EditorState &
  EditorActions & {
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
  };

export function Editor({
  code,
  update,
  readOnly,
  lineWrapping,
  theme = "dracula",
  tabSize = 2,
  mode = "jsx"
}: EditorProps) {
  return (
    <CodeMirror
      value={code}
      onBeforeChange={(_, __, value) => update(value)}
      options={{
        theme,
        readOnly,
        lineWrapping,
        tabSize,
        mode
      }}
    />
  );
}
