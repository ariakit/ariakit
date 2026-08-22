import { useState } from "react";
import { CopyCode } from "../../components/copy-code.react.tsx";

export default function Example() {
  const [text, setText] = useState("First");
  return (
    <div className="flex gap-2 p-4">
      <CopyCode text={text} title={`Copy ${text.toLowerCase()}`} />
      <button type="button" onClick={() => setText("Second")}>
        Change text
      </button>
    </div>
  );
}
