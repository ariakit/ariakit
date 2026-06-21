import { press } from "@ariakit/test";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRef, useState } from "react";

export default function Example() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [lastCharCode, setLastCharCode] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(0);

  function handleKeyPress(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    setLastCharCode(event.charCode);

    if (event.charCode === 13) {
      event.preventDefault();
      setSubmitted((count) => count + 1);
    }
  }

  const runSimulatedEnter = async () => {
    await press.Enter(textareaRef.current);
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Comment</span>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-24 w-80 rounded border border-gray-300 p-2"
        />
      </label>
      <button
        type="button"
        onClick={runSimulatedEnter}
        className="rounded border border-gray-300 px-3 py-1"
      >
        Run simulated Enter
      </button>
      <p className="flex gap-3">
        <span>
          Last char code:{" "}
          <output aria-label="Last char code">
            {lastCharCode === null ? "none" : lastCharCode}
          </output>
        </span>
        <span>
          Submitted: <output aria-label="Submitted">{submitted}</output>
        </span>
      </p>
    </div>
  );
}
