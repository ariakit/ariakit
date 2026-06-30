import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent } from "react";

function isComposing(event: KeyboardEvent) {
  return event.nativeEvent.isComposing || event.keyCode === 229;
}

export default function Example() {
  return (
    <Ariakit.Toolbar
      aria-label="Text formatting"
      style={{ display: "flex", gap: 8 }}
    >
      <Ariakit.ToolbarContainer aria-label="IME field" role="group">
        <label>
          Message{" "}
          <input
            defaultValue="Draft"
            onKeyDown={(event) => {
              if (isComposing(event)) {
                event.stopPropagation();
              }
            }}
          />
        </label>
      </Ariakit.ToolbarContainer>
      <Ariakit.ToolbarItem>Apply</Ariakit.ToolbarItem>
    </Ariakit.Toolbar>
  );
}
