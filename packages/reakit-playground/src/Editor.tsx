import * as React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

export type EditorProps = {
  initialValue?: string;
  readOnly?: boolean;
};

export function Editor({ initialValue = "", readOnly }: EditorProps) {
  const [value, setValue] = React.useState(initialValue);
  return (
    <CodeMirror
      value={value}
      onBeforeChange={(_, __, nextValue) => setValue(nextValue)}
      options={{
        readOnly,
        tabSize: 2,
        theme: "dracula",
        mode: { name: "jsx", base: { name: "javascript", typescript: true } }
      }}
    />
  );
}
