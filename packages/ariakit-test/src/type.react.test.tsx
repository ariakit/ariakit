import { useState } from "react";
import { expect, test } from "vitest";
import { q, render } from "./react.tsx";
import { type } from "./type.ts";

function MessageInput() {
  const [message, setMessage] = useState("");
  return (
    <label>
      Message
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
    </label>
  );
}

// https://github.com/ariakit/ariakit/issues/7959
test("type inserts an emoji followed by text into a controlled input", async () => {
  const { unmount } = await render(<MessageInput />);
  try {
    const input = q.textbox("Message") as HTMLInputElement;

    await type("😀a", input);

    expect(input.value).toBe("😀a");
    expect(input.selectionStart).toBe(3);
  } finally {
    unmount();
  }
});
