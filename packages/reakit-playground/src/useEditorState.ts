import * as React from "react";

export type EditorState = {
  /** TODO: Description */
  code: string;
};

export type EditorActions = {
  /** TODO: Description */
  update: React.Dispatch<React.SetStateAction<string>>;
};

export type UseEditorStateOptions = {
  /** TODO: Description */
  code?: string | (() => string);
};

export function useEditorState({
  code: initialCode = ""
}: UseEditorStateOptions): EditorState & EditorActions {
  const [code, update] = React.useState(initialCode);
  return { code, update };
}
