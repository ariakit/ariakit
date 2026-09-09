import { Role } from "@ariakit/react";
import { useState } from "react";
import type { ReactElement } from "react";

function wrapShortcut(element: ReactElement) {
  return (
    <div role="group" aria-label="Shortcut">
      {element}
    </div>
  );
}

export default function Example() {
  const [keyboard, setKeyboard] = useState<HTMLElement | null>(null);
  const [separator, setSeparator] = useState<HTMLHRElement | null>(null);
  const [time, setTime] = useState<HTMLTimeElement | null>(null);
  const [cell, setCell] = useState<HTMLTableCellElement | null>(null);
  const [fieldset, setFieldset] = useState<HTMLFieldSetElement | null>(null);
  const [option, setOption] = useState<HTMLOptionElement | null>(null);
  const [composed, setComposed] = useState<HTMLElement | null>(null);

  const [elementRefs, setElementRefs] = useState("Not inspected");
  const [composedRef, setComposedRef] = useState("Not inspected");

  return (
    <Role.article>
      <Role.h1>Keyboard commands</Role.h1>
      <Role.kbd ref={setKeyboard} title="Command K">
        ⌘K
      </Role.kbd>
      <Role.hr ref={setSeparator} aria-label="Commands" />
      <Role.time ref={setTime} dateTime="2026-09-09">
        September 9
      </Role.time>
      <Role.table>
        <Role.caption>Commands</Role.caption>
        <Role.tbody>
          <Role.tr>
            <Role.td ref={setCell} colSpan={2}>
              Open search
            </Role.td>
          </Role.tr>
        </Role.tbody>
      </Role.table>
      <Role.fieldset ref={setFieldset} disabled>
        <Role.legend>Settings</Role.legend>
        <Role.select aria-label="Input method">
          <Role.optgroup label="Devices">
            <Role.option ref={setOption} value="keyboard">
              Keyboard
            </Role.option>
          </Role.optgroup>
        </Role.select>
      </Role.fieldset>
      <p>
        Native refs:{" "}
        <Role.output aria-label="Element refs">{elementRefs}</Role.output>
      </p>
      <Role.kbd
        ref={setComposed}
        title="Control K"
        render={<span />}
        wrapElement={wrapShortcut}
      >
        Ctrl K
      </Role.kbd>
      <p>
        Composed ref:{" "}
        <Role.output aria-label="Composed ref">{composedRef}</Role.output>
      </p>
      <Role.button
        type="button"
        onClick={() => {
          setElementRefs(
            [keyboard, separator, time, cell, fieldset, option]
              .map((element) => element?.localName)
              .join(", "),
          );
          setComposedRef(composed?.localName ?? "Missing ref");
        }}
      >
        Inspect elements
      </Role.button>
    </Role.article>
  );
}
