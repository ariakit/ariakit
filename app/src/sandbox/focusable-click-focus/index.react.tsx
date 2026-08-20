import * as Ariakit from "@ariakit/react";
import type { ComponentProps } from "react";
import { forwardRef, useState } from "react";
import "./style.css";

const CustomCheckbox = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  function CustomCheckbox(props, ref) {
    return <input ref={ref} {...props} type="checkbox" />;
  },
);

export default function Example() {
  const [checked, setChecked] = useState(false);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [submittedData, setSubmittedData] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Ariakit.Button>Button</Ariakit.Button>
      <label>
        <Ariakit.Checkbox
          checked={checked}
          onChange={() => setChecked((c) => !c)}
        />{" "}
        Checkbox
      </label>
      <Ariakit.RadioProvider>
        <label>
          <Ariakit.Radio value="a" /> Radio A
        </label>
        <label>
          <Ariakit.Radio value="b" /> Radio B
        </label>
      </Ariakit.RadioProvider>
      <Ariakit.Button render={<input type="submit" value="Submit" />} />
      <label>
        <Ariakit.Checkbox
          checked={checked}
          onChange={() => setChecked((c) => !c)}
          render={<CustomCheckbox />}
        />{" "}
        Wrapped
      </label>
      <Ariakit.Button onClick={() => setShowNodeEditor(true)}>
        Add node editor
      </Ariakit.Button>
      {/* https://github.com/ariakit/ariakit/issues/7215 */}
      {showNodeEditor ? (
        <Ariakit.Focusable
          className="node-editor"
          render={
            <form
              aria-label="Node editor"
              onSubmit={(event) => {
                event.preventDefault();
                // TODO: Remove this workaround after the linked issue is fixed.
                // https://github.com/ariakit/ariakit/issues/7215
                const data = new FormData(event.currentTarget);
                data.set("nodeType", data.get("nodeTypeField") ?? "");
                data.delete("nodeTypeField");
                setSubmittedData(JSON.stringify(Object.fromEntries(data)));
              }}
            />
          }
          tabIndex={0}
        >
          <label>
            Node type
            <input name="nodeTypeField" />
          </label>
          <button type="submit">Save node</button>
          {submittedData ? (
            <output>Submitted data: {submittedData}</output>
          ) : null}
          <output>
            <span className="pointer-focus">Pointer focus</span>
            <span className="keyboard-focus">Keyboard focus</span>
          </output>
        </Ariakit.Focusable>
      ) : null}
    </div>
  );
}
